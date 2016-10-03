import angular from 'angular';
import 'angular-mocks';
import module from './recipientView.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe( 'your giving', function () {
  describe( 'recipient view', () => {
    beforeEach( angular.mock.module( module.name ) );
    let $ctrl;

    beforeEach( inject( ( _$componentController_ ) => {
      $ctrl = _$componentController_( module.name, {}, {
        filter:     'recent',
        setLoading: jasmine.createSpy( 'setLoading' )
      } );
    } ) );

    it( 'to be defined', function () {
      expect( $ctrl ).toBeDefined();
      expect( $ctrl.donationsService ).toBeDefined();
    } );

    describe( '$onChanges( changes )', () => {
      beforeEach( () => {
        spyOn( $ctrl, 'loadRecipients' );
      } );

      it( 'loads recipients based on filter=\'recent\'', () => {
        $ctrl.$onChanges( {filter: {currentValue: 'recent'}} );
        expect( $ctrl.loadRecipients ).toHaveBeenCalledWith( undefined );
      } );

      it( 'loads recipients based on filter=2016', () => {
        $ctrl.$onChanges( {filter: {currentValue: 2016}} );
        expect( $ctrl.loadRecipients ).toHaveBeenCalledWith( 2016 );
      } );

      it( 'does not load if filter is undefined', () => {
        $ctrl.$onChanges( {} );
        expect( $ctrl.loadRecipients ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'loadRecipients(year)', () => {
      let subscriberSpy;
      beforeEach( () => {
        subscriberSpy = jasmine.createSpyObj( 'subscriber', ['unsubscribe'] );
        spyOn( $ctrl.donationsService, 'getRecipients' );
      } );

      it( 'loads recent recipients', () => {
        $ctrl.donationsService.getRecipients.and.callFake( () => Observable.of( ['a', 'b'] ) );
        $ctrl.subscriber = subscriberSpy;
        $ctrl.loadRecipients();
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( subscriberSpy.unsubscribe ).toHaveBeenCalled();
        expect( $ctrl.donationsService.getRecipients ).toHaveBeenCalledWith( undefined );
        expect( $ctrl.recipients ).toEqual( ['a', 'b'] );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      } );

      it( 'loads recipients by year', () => {
        $ctrl.donationsService.getRecipients.and.callFake( () => Observable.of( ['c', 'd'] ) );
        $ctrl.loadRecipients( 2016 );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( subscriberSpy.unsubscribe ).not.toHaveBeenCalled();
        expect( $ctrl.donationsService.getRecipients ).toHaveBeenCalledWith( 2016 );
        expect( $ctrl.recipients ).toEqual( ['c', 'd'] );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      } );

      it( 'sets loading false on error ', () => {
        $ctrl.donationsService.getRecipients.and.callFake( () => Observable.throw( 'error' ) );
        $ctrl.loadRecipients( 2016 );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: true} );
        expect( $ctrl.recipients ).toEqual( [] );
        expect( $ctrl.setLoading ).toHaveBeenCalledWith( {loading: false} );
      } );
    } );
  } );
} );