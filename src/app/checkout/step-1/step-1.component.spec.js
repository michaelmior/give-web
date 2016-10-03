import angular from 'angular';
import 'angular-mocks';

import module from './step-1.component';

describe('checkout', function() {
  describe('step 1', function() {
    beforeEach(angular.mock.module(module.name));
    var self = {};

    beforeEach(inject(function($componentController) {
      self.controller = $componentController(module.name, {}, {
        changeStep: jasmine.createSpy('changeStep')
      });
    }));

    describe('onSubmit', () => {
      it('should change step if submitted successfully', () => {
        spyOn(self.controller.$window, 'scrollTo');
        self.controller.onSubmit(true);
        expect(self.controller.changeStep).toHaveBeenCalledWith({newStep: 'payment'});
        expect(self.controller.$window.scrollTo).not.toHaveBeenCalled();
      });
      it('should scroll to top if submitted with error', () => {
        self.controller.submitted = true;
        spyOn(self.controller.$window, 'scrollTo');
        self.controller.onSubmit(false);
        expect(self.controller.changeStep).not.toHaveBeenCalled();
        expect(self.controller.$window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(self.controller.submitted).toEqual(false);
      });
    });
  });
});