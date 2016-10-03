import angular from 'angular';
import paymentMethodDisplay from 'common/components/paymentMethods/paymentMethodDisplay.component';
import template from './recipientDetail.tpl';

let componentName = 'recipientDetail';

class RecipientDetail {

  /* @ngInject */
  constructor() {
  }
}
export default angular
  .module( componentName, [
    paymentMethodDisplay.name,
    template.name
  ] )
  .directive( componentName, () => {
    return {
      templateUrl:      template.name,
      restrict:         'A',
      scope:            false,
      bindToController: {
        gift: `<${componentName}`
      },
      controllerAs:     '$ctrl',
      controller:       RecipientDetail
    };
  } );