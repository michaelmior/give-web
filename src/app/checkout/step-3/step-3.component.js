import angular from 'angular';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(cartService){
    this.cartService = cartService;

    this.init();
  }

  init(){
    this.cartService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });
  }
}

export default angular
  .module(componentName, [
    template.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&',
      cartData: '<'
    }
  });
