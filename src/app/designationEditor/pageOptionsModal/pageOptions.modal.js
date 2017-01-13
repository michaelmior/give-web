import angular from 'angular';
import transform from 'lodash/transform';
import sortBy from 'lodash/sortBy';

let controllerName = 'pageOptionsCtrl';

class ModalInstanceCtrl {

  /* @ngInject */
  constructor( parentDesignationNumber, organizationId, suggestedAmounts ) {
    this.parentDesignationNumber = parentDesignationNumber;
    this.organizationId = organizationId;

    this.suggestedAmounts = transform(suggestedAmounts, (result, value, key) => {
      if(key === 'jcr:primaryType'){ return; }
      result.push({
        amount: Number(value.amount),
        description: value.description,
        order: Number(key)
      });
    }, []);
    this.suggestedAmounts = sortBy(this.suggestedAmounts, 'order');
  }

  transformSuggestedAmounts(){
    return transform(this.suggestedAmounts, (result, value, i) => {
      delete value.order;
      result[i+1] = value;
    }, {});
  }
}


export default angular
  .module( controllerName, [
  ] )
  .controller( controllerName, ModalInstanceCtrl );
