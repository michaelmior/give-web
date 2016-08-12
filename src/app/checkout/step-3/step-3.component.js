import angular from 'angular';

import cartService from 'common/services/api/cart.service';
import orderService from 'common/services/api/order.service';

import template from './step-3.tpl';

let componentName = 'checkoutStep3';

class Step3Controller{

  /* @ngInject */
  constructor(cartService, orderService){
    this.cartService = cartService;
    this.orderService = orderService;

    this.init();
  }

  init(){
    this.cartService.getDonorDetails()
      .subscribe((data) => {
        this.donorDetails = data;
      });

    // Load current payment method from /paymentmethods/orders/crugive/
  }
}

export default angular
  .module(componentName, [
    template.name,
    cartService.name,
    orderService.name
  ])
  .component(componentName, {
    controller: Step3Controller,
    templateUrl: template.name,
    bindings: {
      changeStep: '&',
      cartData: '<'
    }
  });
