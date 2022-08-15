import angular from 'angular'
import template from './payment-methods.tpl.html'
import recurringGiftsComponent from './recurring-gifts/recurring-gifts.component'
import profileService from 'common/services/api/profile.service.js'
import paymentMethod from './payment-method/payment-method.component'
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component'
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl.html'
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component'
import sessionEnforcerService, { EnforcerCallbacks, EnforcerModes } from 'common/services/session/sessionEnforcer.service'
import { LoginOktaOnlyEvent, Roles, SignOutEvent } from 'common/services/session/session.service'
import commonModule from 'common/common.module'
import formatAddressForTemplate from 'common/services/addressHelpers/formatAddressForTemplate'
import { scrollModalToTop } from 'common/services/modalState.service'
import uibModal from 'angular-ui-bootstrap/src/modal'
import { concatMap } from 'rxjs/operators/concatMap'
import { Observable } from 'rxjs/Observable'
import sessionService from '../../../common/services/session/session.service'

class PaymentMethodsController {
  /* @ngInject */
  constructor ($rootScope, $uibModal, profileService, sessionService, sessionEnforcerService, analyticsFactory, $log, $timeout, $window, $location) {
    this.$log = $log
    this.$rootScope = $rootScope
    this.$uibModal = $uibModal
    this.paymentMethod = 'bankAccount'
    this.profileService = profileService
    this.paymentFormResolve = {}
    this.successMessage = { show: false }
    this.$timeout = $timeout
    this.$window = $window
    this.paymentMethods = []
    this.$location = $location
    this.sessionService = sessionService
    this.sessionEnforcerService = sessionEnforcerService
    this.analyticsFactory = analyticsFactory
  }

  $onDestroy () {
    // Destroy enforcer
    this.sessionEnforcerService.cancel(this.enforcerId)

    if (this.paymentMethodFormModal) {
      this.paymentMethodFormModal.close()
    }
  }

  $onInit () {
    this.sessionService.handleOktaRedirect().pipe(
      concatMap(data => {
        return data.subscribe ? data : Observable.of(data)
      })
    ).subscribe((data) => {
      if (data) {
        this.sessionEnforcerService([Roles.registered], {
          [EnforcerCallbacks.change]: (role, registrationState) => {
            if (role === Roles.registered && registrationState === 'NEW') {
              this.sessionService.updateCurrentProfile()
              this.$rootScope.$broadcast(LoginOktaOnlyEvent, 'register-account')
            }
          }
        }, EnforcerModes.donor)
        this.sessionService.removeOktaRedirectIndicator()
      }
    },
    error => {
      this.errorMessage = 'generic'
      this.$log.error('Failed to redirect from Okta', error)
      this.sessionService.removeOktaRedirectIndicator()
    })

    this.enforcerId = this.sessionEnforcerService([Roles.registered], {
      [EnforcerCallbacks.signIn]: () => {
        this.loadPaymentMethods()
        this.loadDonorDetails()
      },
      [EnforcerCallbacks.cancel]: () => {
        this.$window.location = '/'
      }
    }, EnforcerModes.donor)

    this.$rootScope.$on(SignOutEvent, (event) => this.signedOut(event))

    this.loading = true

    this.analyticsFactory.pageLoaded()
  }

  loadDonorDetails () {
    this.profileService.getDonorDetails()
      .subscribe(data => {
        this.mailingAddress = data.mailingAddress
      }, error => {
        this.$log.error('Error loading mailing address for use in profile payment method add payment method modals', error)
      })
  }

  loadPaymentMethods () {
    this.loading = true
    this.loadingError = false
    this.profileService.getPaymentMethodsWithDonations()
      .subscribe(
        data => {
          this.loading = false
          this.paymentMethods = data
        },
        error => {
          this.loading = false
          this.loadingError = true
          this.$log.error('Error loading payment methods', error)
        }
      )
  }

  addPaymentMethod () {
    this.paymentMethodFormModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate,
      resolve: {
        paymentForm: this.paymentFormResolve,
        hideCvv: true,
        mailingAddress: this.mailingAddress,
        onPaymentFormStateChange: () => param => this.onPaymentFormStateChange(param.$event)
      }
    })
    this.paymentMethodFormModal.result.then(data => {
      this.successMessage = {
        show: true,
        type: 'paymentMethodAdded'
      }
      data._recurringgifts = [{ donations: [] }]
      this.paymentMethods.push(data)
      this.$timeout(() => {
        this.successMessage.show = false
      }, 60000)
    }, angular.noop)
  }

  onPaymentFormStateChange ($event) {
    this.paymentFormResolve.state = $event.state
    if ($event.state === 'loading' && $event.payload) {
      this.profileService.addPaymentMethod($event.payload)
        .subscribe(data => {
          data.address = data.address && formatAddressForTemplate(data.address)
          this.paymentMethodFormModal.close(data)
          this.paymentFormResolve.state = 'unsubmitted'
        },
        error => {
          if (error.status !== 409) {
            this.$log.error('Error adding payment method', error)
          }
          this.paymentFormResolve.state = 'error'
          this.paymentFormResolve.error = error.data
          scrollModalToTop()
        })
    }
  }

  onDelete () {
    this.loadPaymentMethods()
    this.successMessage.show = true
    this.successMessage.type = 'paymentMethodDeleted'
    this.$timeout(() => {
      this.successMessage.show = false
    }, 60000)
  }

  isCard (paymentMethod) {
    return paymentMethod.self.type === 'cru.creditcards.named-credit-card'
  }

  signedOut (event) {
    if (!event.defaultPrevented) {
      event.preventDefault()
      this.$window.location = '/'
    }
  }
}

const componentName = 'paymentMethods'

export default angular
  .module(componentName, [
    commonModule.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    paymentMethod.name,
    profileService.name,
    paymentMethodDisplay.name,
    sessionService.name,
    sessionEnforcerService.name,
    uibModal
  ])
  .component(componentName, {
    controller: PaymentMethodsController,
    templateUrl: template
  })
