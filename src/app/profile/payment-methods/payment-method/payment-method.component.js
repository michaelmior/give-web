import angular from 'angular';
import template from './payment-method.tpl';
import displayAddressComponent from 'common/components/display-address/display-address.component';
import recurringGiftsComponent from '../recurring-gifts/recurring-gifts.component';
import paymentMethodFormModal from 'common/components/paymentMethods/paymentMethodForm/paymentMethodForm.modal.component';
import deletePaymentMethodModal from 'common/components/paymentMethods/deletePaymentMethod/deletePaymentMethod.modal.component.js';
import giveModalWindowTemplate from 'common/templates/giveModalWindow.tpl';
import profileService from 'common/services/api/profile.service';

let componentName = 'paymentMethod';

class PaymentMethodController{

  /* @ngInject */
  constructor(envService, $uibModal, profileService){
    this.isCollapsed = true;
    this.$uibModal = $uibModal;
    this.profileService = profileService;
    this.imgDomain = envService.read('imgDomain');
    this.submissionError = {error: ''};
  }

  $onInit(){
    this.loadDonorDetails();
  }

  loadDonorDetails() {
    this.profileService.getDonorDetails()
      .subscribe((data) => {
        this.mailingAddress = data.mailingAddress;
      });
  }

  getExpiration(){
    return `${this.model['expiry-month']}/${this.model['expiry-year']}`;
  }

  isCard(){
    return this.model['card-number'] ? true : false;
  }

  editPaymentMethod() {
    this.editPaymentMethodModal = this.$uibModal.open({
      component: 'paymentMethodFormModal',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: this.model,
        mailingAddress: this.mailingAddress,
        submissionError: this.submissionError,
        onSubmit: () => params => this.onSubmit(params)
      }
    });
  }

  onSubmit(e){
    if(e.success && e.data) {
      this.profileService.updatePaymentMethod(this.model, e.data)
        .subscribe(() => {
            let editedData = e.data.creditCard || e.data.bankAccount;
            this.submissionError.loading = false;
            this.editPaymentMethodModal.close();
            for(let key in editedData){
              this.model[key] = editedData[key];
            }
          },
          error => {
            this.submissionError.loading = false;
            this.submissionError.error = error.data;
          }
        );
    } else {
      this.submissionError.loading = false;
    }
  }

  deletePaymentMethod(){
    this.deletePaymentMethodModal = this.$uibModal.open({
      component: 'deletePaymentMethodModal',
      backdrop: 'static',
      windowTemplateUrl: giveModalWindowTemplate.name,
      resolve: {
        paymentMethod: () => this.model,
        paymentMethodsList: () => this.paymentMethodsList
      }
    });
    this.deletePaymentMethodModal.result.then(() => {
      this.onDelete();
    });
  }

  $onDestroy(){
    if(this.deletePaymentMethodModal) {
      this.deletePaymentMethodModal.dismiss();
    }
    if(this.editPaymentMethodModal){
      this.editPaymentMethodModal.dismiss();
    }
  }

}

export default angular
  .module(componentName, [
    template.name,
    displayAddressComponent.name,
    recurringGiftsComponent.name,
    paymentMethodFormModal.name,
    deletePaymentMethodModal.name,
    giveModalWindowTemplate.name,
    profileService.name
  ])
  .component(componentName, {
    controller: PaymentMethodController,
    templateUrl: template.name,
    bindings: {
      model: '<',
      paymentMethodsList: '<',
      onDelete: '&'
    }
  });