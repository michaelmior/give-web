import angular from 'angular';
import 'angular-mocks';

import module from './stopStartRecurringGifts.modal.component';

describe( 'stopStartRecurringGiftsModal', () => {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, bindings;

  beforeEach( inject( ( $componentController ) => {
    bindings = jasmine.createSpyObj( 'bindings', ['dismiss', 'close'] );
    $ctrl = $componentController( module.name, {}, bindings );
  } ) );

  it( 'is defined', () => {
    expect( $ctrl ).toBeDefined();
  } );

  describe( '$onInit()', () => {
    it( 'initializes the component', () => {
      spyOn( $ctrl, 'changeState' );
      $ctrl.$onInit();
      expect( $ctrl.changeState ).toHaveBeenCalledWith( 'step-0' );
    } );
  } );

  describe( 'changeState( state )', () => {
    beforeEach( () => {
      $ctrl.state = 'step-0';
    } );

    it( 'changes state', () => {
      $ctrl.changeState( 'stop' );
      expect( $ctrl.state ).toEqual( 'stop' );
      expect( $ctrl.giftAction ).toEqual( 'stop' );
    } );

    it( 'changes state to \'step-0\'', () => {
      $ctrl.changeState( 'step-0' );
      expect( $ctrl.state ).toEqual( 'step-0' );
    } );

    it( 'redirects to payment methods page', () => {
      $ctrl.$window = {
        location: ''
      };
      $ctrl.changeState( 'change' );
      expect( $ctrl.$window.location ).toEqual( '/profile/payment-methods.html' );
    } );
  } );

  describe( 'setLoading( loading )', () => {
    it( 'sets isLoading to true', () => {
      $ctrl.setLoading( true );
      expect( $ctrl.isLoading ).toEqual( true );
    } );
    it( 'sets isLoading to false', () => {
      $ctrl.setLoading( false );
      expect( $ctrl.isLoading ).toEqual( false );
    } );
  } );
} );
