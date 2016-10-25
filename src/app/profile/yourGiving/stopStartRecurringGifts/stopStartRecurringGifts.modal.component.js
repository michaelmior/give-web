import angular from 'angular';
import template from './stopStartRecurringGifts.modal.tpl';

import stopStartStep0 from './step0/stopStartStep0.component';
import stopGift from './stopGift/stopGift.component';

let componentName = 'stopStartRecurringGiftsModal';

class StopStartRecurringGiftsModalController {

  /* @ngInject */
  constructor() {
  }

  $onInit() {
    this.changeState( 'step-0' );
  }

  changeState( state ) {
    if ( state !== 'setp-0' ) this.giftAction = state;
    this.state = state;
  }

  setLoading( loading ) {
    this.isLoading = !!loading;
  }
}

export default angular
  .module( componentName, [
    template.name,
    stopStartStep0.name,
    stopGift.name
  ] )
  .component( componentName, {
    controller:  StopStartRecurringGiftsModalController,
    templateUrl: template.name,
    bindings:    {
      close:   '&',
      dismiss: '&'
    }
  } );
