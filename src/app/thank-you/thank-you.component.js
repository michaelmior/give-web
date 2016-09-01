import 'babel/external-helpers';
import angular from 'angular';

import accountBenefits from './account-benefits/account-benefits.component';
import help from '../checkout/help/help.component';

import orderService from 'common/services/api/order.service';
import purchasesService from 'common/services/api/purchases.service';

import template from './thank-you.tpl';

let componentName = 'thankYou';

class ThankYouController{

  /* @ngInject */
  constructor(orderService, purchasesService, $log){
    this.orderService = orderService;
    this.purchasesService = purchasesService;
    this.$log = $log;
  }

  $onInit(){
    this.loadLastPurchase();
  }

  loadLastPurchase(){
    let lastPurchaseLink = this.orderService.retrieveLastPurchaseLink();
    if(!lastPurchaseLink){
      // TODO: should we redirect away or show an error message?
      return;
    }
    this.purchasesService.getPurchase(lastPurchaseLink)
      .subscribe((data) => {
        this.purchase = data;
        this.$log.info('Loaded purchase info:', data);
      });
  }

}

export default angular
  .module(componentName, [
    template.name,
    accountBenefits.name,
    help.name,
    orderService.name,
    purchasesService.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });
