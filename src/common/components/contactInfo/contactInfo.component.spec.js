import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import module from './contactInfo.component.js';

describe('contactInfo', function() {
  beforeEach(angular.mock.module(module.name));
  var self = {};

  beforeEach(inject(function($componentController) {
    self.controller = $componentController(module.name, {}, {
      detailsForm: {
        $valid: false,
        $setSubmitted: jasmine.createSpy('$setSubmitted')
      },
      onSubmit: jasmine.createSpy('onSubmit')
    });
  }));

  describe('$onInit', () => {
    it('load the necessary data', () => {
      spyOn(self.controller, 'loadDonorDetails');
      self.controller.$onInit();
      expect(self.controller.loadDonorDetails).toHaveBeenCalled();
    });
    it('if not a public user, it should hide the title', () => {
      spyOn(self.controller, 'loadDonorDetails');
      spyOn(self.controller.sessionService, 'getRole').and.returnValue('REGISTERED');
      self.controller.$onInit();
      expect(self.controller.showTitle).toEqual(false);
    });
    it('if a public user, it should show the title', () => {
      spyOn(self.controller, 'loadDonorDetails');
      spyOn(self.controller.sessionService, 'getRole').and.returnValue('PUBLIC');
      self.controller.$onInit();
      expect(self.controller.showTitle).toEqual(true);
    });
  });

  describe('$onChanges', () => {
    it('should call submitDetails when submitted changes true', () => {
      spyOn(self.controller, 'submitDetails');
      self.controller.$onChanges({
        submitted: {
          currentValue: true
        }
      });
      expect(self.controller.submitDetails).toHaveBeenCalled();
    });
  });

  describe('loadDonorDetails', () => {
    it('should get the donor\'s details', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': 'Organization' }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Organization' });
      expect(self.controller.nameFieldsDisabled).toEqual(false);
      expect(self.controller.spouseNameFieldsDisabled).toEqual(false);
    });
    it('should disable name fields if they are already set', () => {
      let donorDetails = {
        'donor-type': 'Organization',
        name: {
          'given-name': 'Joe',
          'family-name': 'Smith'
        },
        'spouse-name': {
          'given-name': 'Julie',
          'family-name': 'Smith'
        }
      };
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of(donorDetails));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual(donorDetails);
      expect(self.controller.nameFieldsDisabled).toEqual(true);
      expect(self.controller.spouseNameFieldsDisabled).toEqual(true);
    });
    it('should set the donor type if it is an empty string', () => {
      spyOn(self.controller.orderService, 'getDonorDetails').and.callFake(() => Observable.of({ 'donor-type': '' }));
      self.controller.loadDonorDetails();
      expect(self.controller.orderService.getDonorDetails).toHaveBeenCalled();
      expect(self.controller.donorDetails).toEqual({ 'donor-type': 'Household' });
    });
  });

  describe('submitDetails', () => {
    it('should call onSubmit binding if there are errors', () => {
      self.controller.detailsForm.$valid = false;
      spyOn(self.controller.orderService, 'updateDonorDetails');
      spyOn(self.controller.orderService, 'addEmail');
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).not.toHaveBeenCalled();
      expect(self.controller.orderService.addEmail).not.toHaveBeenCalled();
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
    it('should save donor details and email', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.of('donor details success'));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.of('email success'));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: true});
    });
    it('should handle an error saving donor details or email', () => {
      self.controller.detailsForm.$valid = true;
      self.controller.donorDetails = {
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      };
      spyOn(self.controller.orderService, 'updateDonorDetails').and.returnValue(Observable.throw({ data: 'donor details error' }));
      spyOn(self.controller.orderService, 'addEmail').and.returnValue(Observable.throw({ data: 'email error' }));
      self.controller.submitDetails();
      expect(self.controller.detailsForm.$setSubmitted).toHaveBeenCalled();
      expect(self.controller.orderService.updateDonorDetails).toHaveBeenCalledWith({
        'given-name': 'Fname',
        email: 'someone@asdf.com'
      });
      expect(self.controller.orderService.addEmail).toHaveBeenCalledWith('someone@asdf.com');
      expect(self.controller.$log.warn.logs[0]).toEqual(['Error saving donor contact info', { data: 'donor details error' }]);
      expect(self.controller.submissionError).toEqual('donor details error');
      expect(self.controller.onSubmit).toHaveBeenCalledWith({success: false});
    });
  });
});