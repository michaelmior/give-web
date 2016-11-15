import angular from 'angular';
import 'angular-mocks';
import module from './searchResults.component';
import ministries from './searchResults.ministries';

describe( 'searchResults', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl;

  beforeEach( inject( function ( _$componentController_ ) {
    $ctrl = _$componentController_( module.name,
      {$window: {location: '/search-results.html'}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'requestSearch', () => {
    it( 'request search onInit', () => {
      spyOn( $ctrl, 'requestSearch' );

      $ctrl.$onInit();
      expect( $ctrl.requestSearch ).toHaveBeenCalled( );
    } );

    it( 'changes type', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve',
        type: ''
      };
      $ctrl.requestSearch('people');
      expect( $ctrl.searchParams.type ).toEqual( 'people' );
    } );

    it( 'pulls ministry list', () => {
      $ctrl.$onInit();
      $ctrl.requestSearch('ministries');
      expect( $ctrl.searchResults ).toEqual( ministries );
    } );

    it( 'do not request search if params are undefined', () => {
      spyOn( $ctrl.designationsService, 'productSearch' );

      $ctrl.$onInit();
      $ctrl.searchParams = {
        type: 'people'
      };
      $ctrl.requestSearch();

      expect( $ctrl.designationsService.productSearch ).not.toHaveBeenCalled( );
    } );
  } );

  describe( 'exploreSearch', () => {
    it( 'navigates to cru.org search page', () => {
      $ctrl.$onInit();

      $ctrl.searchParams = {
        keyword: 'steve'
      };
      $ctrl.exploreSearch();
      expect( $ctrl.$window.location ).toEqual( 'https://www.cru.org/content/cru/us/en/search.steve.html' );
    } );
  } );

} );
