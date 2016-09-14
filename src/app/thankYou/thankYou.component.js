import 'babel/external-helpers';
import angular from 'angular';

import accountBenefits from './accountBenefits/accountBenefits.component';
import help from '../checkout/help/help.component';
import displayAddressComponent from 'common/components/display-address/display-address.component';

import capitalizeFilter from 'common/filters/capitalize.filter';

import orderService from 'common/services/api/order.service';
import purchasesService from 'common/services/api/purchases.service';
import profileService from 'common/services/api/profile.service';

import template from './thankYou.tpl';

let componentName = 'thankYou';

class ThankYouController{

  /* @ngInject */
  constructor(orderService, purchasesService, profileService, $log){
    this.orderService = orderService;
    this.purchasesService = purchasesService;
    this.profileService = profileService;
    this.$log = $log;
  }

  $onInit(){
    this.loadLastPurchase();
    this.loadEmail();
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
        this.mailingAddress = this.orderService.formatAddressForTemplate(this.purchase.donorDetails['mailing-address']);
        if(this.purchase.paymentMeans.self.type === 'elasticpath.purchases.purchase.paymentmeans'){ //only credit card type has billing address
          this.billingAddress = this.orderService.formatAddressForTemplate(this.purchase.paymentMeans['billing-address'].address);
        }
      });
  }

  loadEmail(){
    this.profileService.getEmail()
      .subscribe((data) => {
        this.email = data;
      });
  }

}

export default angular
  .module(componentName, [
    template.name,
    accountBenefits.name,
    help.name,
    displayAddressComponent.name,
    capitalizeFilter.name,
    orderService.name,
    purchasesService.name,
    profileService.name
  ])
  .component(componentName, {
    controller: ThankYouController,
    templateUrl: template.name
  });