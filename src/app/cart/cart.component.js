import 'babel/external-helpers';
import angular from 'angular';

import appConfig from 'common/app.config';

import cartService from 'common/services/api/cart.service';

import template from './cart.tpl';

let componentName = 'cart';

class CartController{

  constructor(cartService) {
    this.cartService = cartService;

    this.loadCart();
  }

  loadCart(){
    this.cartService.get()
      .subscribe((data) => {
        this.cartData = data;
      });
  }

  removeItem(uri){
    this.cartService.deleteItem(atob(uri))
      .subscribe(() => {
        this.loadCart();
      });
  }

  editItem(){
    //trigger designation modal
  }

}

export default angular
  .module(componentName, [
    template.name,
    appConfig.name,
    cartService.name
  ])
  .component(componentName, {
    controller: CartController,
    templateUrl: template.name
  });
