import angular from 'angular';
import 'angular-mocks';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './thankYou.component.js';

describe('thank you', () => {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(($componentController) => {
    self.mockPurchase = {
      donorDetails: {
        'mailing-address': {
          'street-address': '123 Mailing St'
        }
      },
      paymentMeans: {
        self: {
          type: "elasticpath.purchases.purchase.paymentmeans"
        },
        'billing-address': {
          address: {
            'street-address': '123 Billing St'
          }
        }
      }
    };

    self.controller = $componentController(module.name, {
      orderService: {
        retrieveLastPurchaseLink: () => '/purchases/crugive/iiydanbt=',
        formatAddressForTemplate: (address) => address
      },
      purchasesService: {
        getPurchase: () => Observable.of(self.mockPurchase)
      },
      profileService: {
        getEmail: () => Observable.of('someperson@someaddress.com')
      }
    });
  }));

  describe('$onInit', () => {
    it('should call all methods needed to load data for the component', () => {
      spyOn(self.controller, 'loadLastPurchase');
      self.controller.$onInit();
      expect(self.controller.loadLastPurchase).toHaveBeenCalled();
    });
  });

  describe('loadLastPurchase', () => {
    it('should load all data from the last completed purchase', () => {
      spyOn(self.controller.purchasesService, 'getPurchase').and.callThrough();
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual({
        donorDetails: {
          'mailing-address': {
            'street-address': '123 Mailing St'
          }
        },
        paymentMeans: {
          self: {
            type: "elasticpath.purchases.purchase.paymentmeans"
          },
          'billing-address': {
            address: {
              'street-address': '123 Billing St'
            }
          }
        }
      });
      expect(self.controller.mailingAddress).toEqual({'street-address': '123 Mailing St'});
      expect(self.controller.billingAddress).toEqual({'street-address': '123 Billing St'});
    });
    it('should not request purchase data if lastPurchaseLink is not defined', () => {
      spyOn(self.controller.orderService, 'retrieveLastPurchaseLink').and.callFake(() => undefined);
      spyOn(self.controller.purchasesService, 'getPurchase');
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).not.toHaveBeenCalled();
      expect(self.controller.purchase).not.toBeDefined();
    });
    it('should not try to parse the billing address if it is not a credit card payment', () => {
      spyOn(self.controller.purchasesService, 'getPurchase').and.callThrough();
      self.mockPurchase.paymentMeans.self.type = 'elasticpath.bankaccountpurchases.payment-means-bank-account';
      self.controller.loadLastPurchase();
      expect(self.controller.purchasesService.getPurchase).toHaveBeenCalledWith('/purchases/crugive/iiydanbt=');
      expect(self.controller.purchase).toEqual({
        donorDetails: {
          'mailing-address': {
            'street-address': '123 Mailing St'
          }
        },
        paymentMeans: {
          self: {
            type: "elasticpath.bankaccountpurchases.payment-means-bank-account"
          },
          'billing-address': {
            address: {
              'street-address': '123 Billing St'
            }
          }
        }
      });
      expect(self.controller.mailingAddress).toEqual({'street-address': '123 Mailing St'});
      expect(self.controller.billingAddress).toBeUndefined();
    });
  });
  describe('loadEmail', () => {
    it('should load the user\'s email', () => {
      self.controller.loadEmail();
      expect(self.controller.email).toEqual('someperson@someaddress.com');
    });
  });
});