import angular from 'angular'
import 'angular-cookies'
import moment from 'moment'
import map from 'lodash/map'
import omit from 'lodash/omit'
import concat from 'lodash/concat'
import find from 'lodash/find'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/defer'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/from'

import cortexApiService from '../cortexApi.service'
import commonService from './common.service'
import designationsService from './designations.service'
import hateoasHelperService from 'common/services/hateoasHelper.service'
import sessionService, { Roles } from 'common/services/session/session.service'
import { startMonth } from '../giftHelpers/giftDates.service'

const cartTotalCookie = 'giveCartItemCount'
const cartTotalCookieDomain = 'cru.org'

const serviceName = 'cartService'

class Cart {
  /* @ngInject */
  constructor (cortexApiService, commonService, designationsService, sessionService, hateoasHelperService, $cookies) {
    this.cortexApiService = cortexApiService
    this.commonService = commonService
    this.designationsService = designationsService
    this.sessionService = sessionService
    this.hateoasHelperService = hateoasHelperService
    this.$cookies = $cookies
  }

  setCartCountCookie (quantity) {
    if (quantity) {
      this.$cookies.put(cartTotalCookie, quantity, {
        path: '/',
        domain: cartTotalCookieDomain,
        expires: moment().add(58, 'days').toISOString()
      })
    } else {
      this.$cookies.remove(cartTotalCookie, {
        path: '/',
        domain: cartTotalCookieDomain
      })
    }
  }

  get () {
    return Observable.forkJoin(this.cortexApiService.get({
      path: ['carts', this.cortexApiService.scope, 'default'],
      zoom: {
        lineItems: 'lineitems:element[],lineitems:element:availability,lineitems:element:item,lineitems:element:item:code,lineitems:element:item:definition,lineitems:element:rate,lineitems:element:total,lineitems:element:itemfields',
        rateTotals: 'ratetotals:element[]',
        total: 'total,total:cost'
      }
    }), this.commonService.getNextDrawDate())
      .map(([cartResponse, nextDrawDate]) => {
        if (!cartResponse || !cartResponse.lineItems) {
          this.setCartCountCookie(0)
          return {}
        }

        const items = map(cartResponse.lineItems, item => {
          const frequency = item.rate.recurrence.display
          const itemConfig = omit(item.itemfields, ['self', 'links'])
          const giftStartDate = frequency !== 'Single'
            ? startMonth(itemConfig['recurring-day-of-month'], itemConfig['recurring-start-month'], nextDrawDate) : null
          const giftStartDateDaysFromNow = giftStartDate ? giftStartDate.diff(new Date(), 'days') : 0

          let designationType
          angular.forEach(item.itemDefinition['details'], (v, k) => {
            if (v['name'] === 'designation_type') {
              designationType = v['display-value']
            }
          })

          return {
            uri: item.self.uri,
            code: item.itemCode.code,
            displayName: item.itemDefinition['display-name'],
            designationType: designationType,
            price: item.rate.cost.display,
            config: itemConfig,
            frequency: frequency,
            amount: item.rate.cost.amount,
            designationNumber: item.itemCode['product-code'],
            productUri: item.item.self.uri,
            giftStartDate: giftStartDate,
            giftStartDateDaysFromNow: giftStartDateDaysFromNow,
            giftStartDateWarning: giftStartDateDaysFromNow >= 275
          }
        })

        const frequencyTotals = concat({
          frequency: 'Single',
          amount: cartResponse.total && cartResponse.total.cost.amount,
          total: cartResponse.total && cartResponse.total.cost.display
        },
        map(cartResponse.rateTotals, rateTotal => {
          return {
            frequency: rateTotal.recurrence.display,
            amount: rateTotal.cost.amount,
            total: rateTotal.cost.display
          }
        })
        )

        // set cart item count cookie
        this.setCartCountCookie(items.length)

        return {
          id: this.hateoasHelperService.getLink(cartResponse.total, 'cart').split('/').pop(),
          items: items.reverse(), // Show most recent cart items first
          frequencyTotals: frequencyTotals,
          cartTotal: frequencyTotals[0].amount
        }
      })
  }

  getTotalQuantity () {
    return this.cortexApiService
      .get({ path: ['carts', this.cortexApiService.scope, 'default'] })
      .map((cart) => {
        return cart['total-quantity']
      })
  }

  addItem (uri, data, disableSessionRestart) {
    data.quantity = 1

    if (!disableSessionRestart && this.sessionService.getRole() === Roles.public) {
      return this.getTotalQuantity().mergeMap((total) => {
        if (total <= 0) {
          return this.sessionService.signOut().mergeMap(() => {
            return this._addItem(uri, data)
          })
        }
        return this._addItem(uri, data)
      })
    }
    return this._addItem(uri, data)
  }

  /**
   * @private
   */
  _addItem (uri, data) {
    const obj = {
      ...data
    }
    const res = {}
    //  converted payload keys lowercase to uppercase and conveted format as per API request
    for (const [key, value] of Object.entries(obj)) {
      res[key.toUpperCase()] = value
    }
    delete res['QUANTITY']
    const payLoad = {
      configuration: {
        ...res
      },
      quantity: data.quantity
    }

    return this.cortexApiService.post({
      path: uri,
      data: payLoad,
      followLocation: true
    })
  }

  editItem (oldUri, uri, data) {
    return this.deleteItem(oldUri)
      .switchMap(() => this.addItem(uri, data, true))
  }

  deleteItem (uri) {
    return this.cortexApiService.delete({
      path: uri
    })
  }

  bulkAdd (configuredDesignations) {
    let rawCartObservable
    const cart = Observable.defer(() => {
      rawCartObservable = rawCartObservable || this.get() // Only request cart once but wait until subscription before sending request
      return rawCartObservable
    })
    return this.designationsService.bulkLookup(map(configuredDesignations, 'designationNumber'))
      .mergeMap(response => {
        if (!response.links || !response.links.length > 0) {
          return Observable.throw('No results found during lookup')
        }
        return map(response.links, (link, index) => {
          const configuredDesignation = configuredDesignations[index]
          configuredDesignation.uri = link.uri.replace(/^\//, '')
          return this.addItemAndReplaceExisting(cart, configuredDesignation.uri, configuredDesignation)
        })
      })
      .mergeAll()
  }

  addItemAndReplaceExisting (cart, uri, configuredDesignation) {
    return Observable.defer(() => this.addItem(uri, { amount: configuredDesignation.amount }))
      .catch(response => {
        if (response.status === 409) {
          return cart
            .switchMap(cart => {
              const oldUri = find(cart.items, { code: configuredDesignation.designationNumber }).uri.replace(/^\//, '')
              return this.editItem(oldUri, uri, { amount: configuredDesignation.amount })
            })
        } else {
          return Observable.throw(response)
        }
      })
      .map(() => ({ configuredDesignation: configuredDesignation }))
      .catch(response => {
        return Observable.of({ error: response, configuredDesignation: configuredDesignation })
      })
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    commonService.name,
    designationsService.name,
    sessionService.name,
    hateoasHelperService.name,
    'ngCookies'
  ])
  .service(serviceName, Cart)
