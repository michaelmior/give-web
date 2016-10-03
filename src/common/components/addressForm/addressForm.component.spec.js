import angular from 'angular';
import 'angular-mocks';
import find from 'lodash/find';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import countriesResponse from 'common/services/api/fixtures/cortex-countries.fixture.js';

import module from './addressForm.component';

describe('addressForm', function() {
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
      spyOn(self.controller, 'loadCountries');
      self.controller.$onInit();
      expect(self.controller.loadCountries).toHaveBeenCalled();
    });
  });

  describe('loadCountries', () => {
    beforeEach(() => {
      spyOn(self.controller.geographiesService, 'getCountries').and.callFake(() => Observable.of(['country1', 'country2']));
      spyOn(self.controller, 'refreshRegions');
    });

    it('should get the list of countries', () => {
      self.controller.loadCountries();
      expect(self.controller.countries).toEqual(['country1', 'country2']);
      expect(self.controller.refreshRegions).not.toHaveBeenCalled();
    });
    it('should also call refreshRegions if a country is defined', () => {
      self.controller.address = {
        country: 'US'
      };
      self.controller.loadCountries();
      expect(self.controller.countries).toEqual(['country1', 'country2']);
      expect(self.controller.refreshRegions).toHaveBeenCalled();
    });
  });

  describe('refreshRegions', () => {
    it('should get the list of regions of a given country', () => {
      self.controller.countries = countriesResponse._element;
      spyOn(self.controller.geographiesService, 'getRegions').and.callFake(() => Observable.of(['region1', 'region2']));
      self.controller.refreshRegions('US');
      expect(self.controller.geographiesService.getRegions).toHaveBeenCalledWith(find(countriesResponse._element, { name: 'US' }));
      expect(self.controller.regions).toEqual(['region1', 'region2']);
    });
    it('should do nothing if the country doesn\'t exist in the loaded list of countries', () => {
      self.controller.countries = countriesResponse._element;
      spyOn(self.controller.geographiesService, 'getRegions');
      self.controller.refreshRegions('USA');
      expect(self.controller.geographiesService.getRegions).not.toHaveBeenCalled();
      expect(self.controller.regions).toBeUndefined();
    });
  });
});