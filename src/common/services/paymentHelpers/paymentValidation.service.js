import angular from 'angular';
import _ from 'lodash';
import appConfig from 'common/app.config';
import toString from 'lodash/toString';
import capitalize from 'lodash/capitalize';

import ccpService from './ccp.service';

let serviceName = 'paymentValidationService';

class PaymentValidation {

  /*@ngInject*/
  constructor(ccpService){
    this.ccpService = ccpService;

    this.loadCcp();
  }

  loadCcp(){
    this.ccpService.get()
      .subscribe((ccp) => {
        this.ccp = ccp;
      });
  }

  validateRoutingNumber(){
    return (routingNumber) => {
      routingNumber = toString(routingNumber);
      let digits = routingNumber.split('');
      let multipliers = [3, 7, 1, 3, 7, 1, 3, 7, 1];

      let sum = _(_.zip(digits, multipliers))
        .map((array) => {
          return array[0] * array[1];
        })
        .sum();
      return sum % 10 === 0;
    };
  }

  validateCardNumber(){
    return (cardNumber) => {
      cardNumber = toString(cardNumber);
      return (new this.ccp.CardNumber(cardNumber)).validate() === null;
    };
  }

  getCardNumberErrorMessage(cardNumber) {
    cardNumber = this.stripNonDigits(toString(cardNumber));
    return capitalize((new this.ccp.CardNumber(cardNumber)).validate());
  }

  validateCardSecurityCode(){
    return (securityCode) => {
      securityCode = toString(securityCode);
      return (new this.ccp.CardSecurityCode(securityCode)).validate() === null;
    };
  }

  stripNonDigits(number){
    return number.replace(/\D/g, '');
  }

}

export default angular
  .module(serviceName, [
    appConfig.name,
    ccpService.name
  ])
  .service(serviceName, PaymentValidation);