import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';

import module from './existingPaymentMethods.component';

describe('checkout', () => {
  describe('step 2', () => {
    describe('existing payment methods', () => {
      beforeEach(angular.mock.module(module.name));
      var self = {};

      beforeEach(inject(($componentController, $timeout) => {
        self.$timeout = $timeout;

        self.controller = $componentController(module.name, {}, {
          onLoad: jasmine.createSpy('onLoad'),
          onSubmit: jasmine.createSpy('onSubmit')
        });
      }));

      describe('$onInit', () => {
        it('should call loadPaymentMethods', () => {
          spyOn(self.controller, 'loadPaymentMethods');
          self.controller.$onInit();
          expect(self.controller.loadPaymentMethods).toHaveBeenCalled();
        });
      });

      describe('$onDestroy', () => {
        it('should close the addNewPaymentMethodModal if opened', () => {
          self.controller.addNewPaymentMethodModal = {
            close: jasmine.createSpy('close')
          };
          self.controller.$onDestroy();
          expect(self.controller.addNewPaymentMethodModal.close).toHaveBeenCalled();
        });
      });

      describe('loadPaymentMethods', () => {
        it('should finish with no existing payment methods if the session role is not REGISTERED', () => {
          spyOn(self.controller.sessionService, 'getRole').and.callFake(() => 'IDENTIFIED');
          self.controller.loadPaymentMethods();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: true, hasExistingPaymentMethods: false});
        });
        it('should load existing payment methods successfully if any exist', () => {
          spyOn(self.controller.sessionService, 'getRole').and.callFake(() => 'REGISTERED');
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.of(['first payment method']));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toEqual(['first payment method']);
          expect(self.controller.selectDefaultPaymentMethod).toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: true, hasExistingPaymentMethods: true});
        });
        it('should try load existing payment methods even if none exist', () => {
          spyOn(self.controller.sessionService, 'getRole').and.callFake(() => 'REGISTERED');
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.of([]));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toBeUndefined();
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: true, hasExistingPaymentMethods: false});
        });
        it('should handle a failure loading payment methods', () => {
          spyOn(self.controller.sessionService, 'getRole').and.callFake(() => 'REGISTERED');
          spyOn(self.controller.orderService, 'getExistingPaymentMethods').and.callFake(() => Observable.throw('some error'));
          spyOn(self.controller, 'selectDefaultPaymentMethod');
          self.controller.loadPaymentMethods();
          expect(self.controller.paymentMethods).toBeUndefined();
          expect(self.controller.selectDefaultPaymentMethod).not.toHaveBeenCalled();
          expect(self.controller.onLoad).toHaveBeenCalledWith({success: false, error: 'some error'});
        });
      });

      describe('selectDefaultPaymentMethod', () => {
        it('should choose the payment method that is marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri',
              chosen: true
            }
          ];
          self.controller.selectDefaultPaymentMethod();
          expect(self.controller.selectedPaymentMethod).toEqual('second uri');
        });
        it('should choose the first payment method if none are marked chosen in cortex', () => {
          self.controller.paymentMethods = [
            {
              selectAction: 'first uri'
            },
            {
              selectAction: 'second uri'
            }
          ];
          self.controller.selectDefaultPaymentMethod();
          expect(self.controller.selectedPaymentMethod).toEqual('first uri');
        });
      });

      describe('openAddNewPaymentMethodModal', () => {
        it('should open the addNewPaymentMethod modal', () => {
          spyOn(self.controller.$uibModal, 'open').and.callThrough();
          self.controller.openAddNewPaymentMethodModal();
          expect(self.controller.$uibModal.open).toHaveBeenCalled();
          expect(self.controller.addNewPaymentMethodModal).toBeDefined();
          expect(self.controller.$uibModal.open.calls.first().args[0].resolve.onSubmit()).toEqual(self.controller.onSubmit);
        });
        it('should call onSubmit to clear submissionErrors when the modal closes', () => {
          spyOn(self.controller.$uibModal, 'open').and.returnValue({ result: Observable.throw('').toPromise() });
          self.controller.openAddNewPaymentMethodModal();
          self.$timeout(() => {
            expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false, error: ''});
          }, 0);
        });
      });

      describe('$onChanges', () => {
        it('should call selectPayment when called with a mock change object', () => {
          spyOn(self.controller, 'selectPayment');
          self.controller.$onChanges({
            submitted: {
              currentValue: true
            }
          });
          expect(self.controller.selectPayment).toHaveBeenCalled();
        });
        it('should not call selectPayment when submitted hasn\'t changed to true', () => {
          spyOn(self.controller, 'selectPayment');
          self.controller.$onChanges({
            submitted: {
              currentValue: false
            }
          });
          expect(self.controller.selectPayment).not.toHaveBeenCalled();
        });
      });

      describe('selectPayment', () => {
        beforeEach(() => {
          spyOn(self.controller.orderService, 'selectPaymentMethod');
          spyOn(self.controller.orderService, 'storeCardSecurityCode');
        });

        it('should save the selected payment', () => {
          self.controller.selectedPaymentMethod = { self: { type: 'elasticpath.bankaccounts.bank-account' } };
          self.controller.orderService.selectPaymentMethod.and.returnValue(Observable.of('success'));
          self.controller.selectPayment();
          expect(self.controller.orderService.selectPaymentMethod).toHaveBeenCalledWith(self.controller.selectedPaymentMethod);
          expect(self.controller.onSubmit).toHaveBeenCalledWith({success: true});
          expect(self.controller.orderService.storeCardSecurityCode).toHaveBeenCalledWith('existing payment method');
        });
        it('should handle a failed request to save the selected payment', () => {
          self.controller.orderService.selectPaymentMethod.and.returnValue(Observable.throw('some error'));
          self.controller.selectPayment();
          expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false, error: 'some error'});
          expect(self.controller.orderService.storeCardSecurityCode).not.toHaveBeenCalled();
          expect(self.controller.$log.error.logs[0]).toEqual(['Error selecting payment method', 'some error']);
        });
      });
    });
  });
});
