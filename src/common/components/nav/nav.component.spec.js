import angular from 'angular';
import 'angular-mocks';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import module from './nav.component';

import navStructure from 'common/components/nav/fixtures/nav.fixture';
const iPhoneUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';

import {giftAddedEvent, cartUpdatedEvent} from 'common/components/nav/navCart/navCart.component';
import {SignOutEvent} from 'common/services/session/session.service';

describe( 'nav', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $httpBackend, $document;

  beforeEach( inject( function ( _$componentController_, _$document_, _$httpBackend_ ) {
    $ctrl = _$componentController_( module.name,
      {
        $window: {
          location: {
            pathname: '/cart.html'
          },
          navigator: {
            userAgent: iPhoneUserAgent
          },
          scrollTo:  jasmine.createSpy( 'scrollTo' )
        }
      } );
    $httpBackend = _$httpBackend_;
    $document = _$document_;
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  it( 'to retrieve json nav feed', () => {
    $httpBackend.expectGET( $ctrl.navFeed ).respond( 200, navStructure );
    $ctrl.getNav().subscribe( ( structure ) => {
      expect( structure ).toBeDefined();
    } );
    $httpBackend.flush();
  } );

  it( 'to show menu', () => {
    $ctrl.toggleMenu( true );
    expect( $ctrl.mobileNavOpen ).toEqual( true );
    expect( $ctrl.desktopSearch ).toEqual( true );
    expect( $document[0].body.className ).toContain( 'body-scroll-lock' );
  } );

  it( 'to hide menu', () => {
    $ctrl.toggleMenu( false );
    expect( $ctrl.mobileNavOpen ).toEqual( false );
    expect( $ctrl.desktopSearch ).toEqual( false );
    expect( $document[0].body.className ).not.toContain( 'body-scroll-lock' );
  } );

  it( 'to redirect on search', () => {
    $ctrl.cruSearch( 'hello' );
    expect( $ctrl.$window.location ).toContain( 'search.html?q=hello' );
  } );

  it( 'to load mobile nav on small screens', () => {
    $ctrl.setMenuTemplate();
    expect( $ctrl.templateUrl ).toContain( 'mobile' );
  } );

  it( 'to build sub nav structure', () => {
    $httpBackend.expectGET( $ctrl.navFeed ).respond( 200, navStructure );
    $ctrl.getNav().subscribe( ( structure ) => {
      let subMenuStructure = $ctrl.makeSubNav( structure.main, ['communities', 'campus'] );

      expect( subMenuStructure.length ).toEqual( 2 );
      expect( subMenuStructure[0].path ).toContain( '/communities' );
    } );
    $httpBackend.flush();
  } );

  it( 'to build sub nav structure with missing path', () => {
    $httpBackend.expectGET( $ctrl.navFeed ).respond( 200, navStructure );
    $ctrl.getNav().subscribe( ( structure ) => {
      let subMenuStructure = $ctrl.makeSubNav( structure.main, ['page', 'that', 'does not', 'exist'] );

      expect( subMenuStructure.length ).toEqual( 0 );
    } );
    $httpBackend.flush();
  } );

  it( 'to build Give sub nav structure', () => {
    $httpBackend.expectGET( $ctrl.navFeed ).respond( 200, navStructure );
    $ctrl.$window.location.hostname = 'give.cru.org';

    $ctrl.$onInit();
    $httpBackend.flush();

    expect( $ctrl.subMenuStructure[0].title ).toEqual( 'Give' );
  } );

  describe( '$onInit()', () => {
    let spy;
    beforeEach( () => {
      spyOn( $ctrl, 'getNav' ).and.returnValue( Observable.of( [] ) );
      spyOn( $ctrl.$rootScope, '$on' );
      spy = jasmine.createSpy( '$on' );
      spyOn( $ctrl.$rootScope, '$new' ).and.returnValue( {$on: spy} );
      spyOn( $ctrl, 'giftAddedToCart' );
      spyOn( $ctrl, 'signedOut' );
    } );

    it( 'getNav', () => {
      $ctrl.$onInit();
      expect( $ctrl.getNav ).toHaveBeenCalled();
      expect( $ctrl.$rootScope.$on ).toHaveBeenCalledWith( giftAddedEvent, jasmine.any( Function ) );
      $ctrl.$rootScope.$on.calls.argsFor( 0 )[1]();
      expect( $ctrl.giftAddedToCart ).toHaveBeenCalled();
      expect( $ctrl.$rootScope.$new ).toHaveBeenCalled();
      expect( spy ).toHaveBeenCalledWith( SignOutEvent, jasmine.any( Function ) );
      spy.calls.argsFor( 0 )[1]();
      expect( $ctrl.signedOut ).toHaveBeenCalled();
    } );

    it('should log an error on failure', () => {
      $ctrl.getNav.and.returnValue( Observable.throw( 'some error' ) );
      $ctrl.$onInit();
      expect($ctrl.$log.error.logs[0]).toEqual(['Error loading the nav.', 'some error']);
    });
  } );

  describe( 'giftAddedToCart()', () => {
    beforeEach( () => {
      $ctrl.cartOpen = false;
    } );

    it( 'scrolls to top and opens nav cart when giftAdded', () => {
      $ctrl.giftAddedToCart();
      expect( $ctrl.$window.scrollTo ).toHaveBeenCalledWith( 0, 0 );
      expect( $ctrl.cartOpen ).toEqual( true );
    } );
  } );

  describe( 'cartOpened()', () => {
    beforeEach( () => {
      spyOn( $ctrl.$rootScope, '$emit' );
    } );

    it( 'should send event to load cart if nav cart hasn\'t been opened before', () => {
      $ctrl.cartOpened();
      expect( $ctrl.cartOpenedPreviously ).toEqual( true );
      expect($ctrl.$rootScope.$emit).toHaveBeenCalledWith(cartUpdatedEvent);
    } );

    it( 'should not send event to load cart if nav cart has been opened before', () => {
      $ctrl.cartOpenedPreviously = true;
      $ctrl.cartOpened();
      expect( $ctrl.cartOpenedPreviously ).toEqual( true );
      expect($ctrl.$rootScope.$emit).not.toHaveBeenCalled();
    } );
  } );
} );

describe( 'nav signInButton', function () {
  beforeEach( angular.mock.module( module.name ) );
  let $ctrl, $rootScope;

  beforeEach( inject( function ( _$componentController_, _$rootScope_ ) {
    $rootScope = _$rootScope_;
    $ctrl = _$componentController_( module.name,
      {$window: {location: jasmine.createSpyObj( 'location', ['reload'] )}}
    );
  } ) );

  it( 'to be defined', function () {
    expect( $ctrl ).toBeDefined();
  } );

  describe( 'isSignedIn', () => {
    describe( 'with \'REGISTERED\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'REGISTERED' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has true value', () => {
        expect( $ctrl.isSignedIn ).toEqual( true );
      } );
    } );

    describe( 'with \'GUEST\' cortex-session', () => {
      beforeEach( () => {
        spyOn( $ctrl.sessionService, 'getRole' ).and.returnValue( 'GUEST' );
        $ctrl.$onInit();
      } );

      afterEach( () => {
        $ctrl.$onDestroy();
      } );

      it( 'has false value', () => {
        expect( $ctrl.isSignedIn ).toEqual( false );
      } );
    } );
  } );

  describe( 'signIn', () => {
    let deferred;
    beforeEach( inject( function ( _$q_ ) {
      deferred = _$q_.defer();
      spyOn( $ctrl.sessionModalService, 'signIn' ).and.callFake( () => deferred.promise );
      $ctrl.signIn();
    } ) );

    it( 'opens signIn Modal', () => {
      expect( $ctrl.sessionModalService.signIn ).toHaveBeenCalled();
    } );

    it( 'reloads window on success', () => {
      spyOn( $ctrl, '$timeout' ).and.callThrough();
      deferred.resolve();
      $rootScope.$digest();
      expect( $ctrl.$timeout ).toHaveBeenCalled();
      $ctrl.$timeout.flush();
      expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
    } );

    it( 'does nothing on failure', () => {
      deferred.reject();
      $rootScope.$digest();
      expect( $ctrl.$window.location.reload ).not.toHaveBeenCalled();
    } );
  } );

  describe( 'signOut', () => {
    it( 'calls downgradeToGuest()', () => {
      let modalSpy = jasmine.createSpyObj('modal', ['close']);
      spyOn( $ctrl.sessionService, 'downgradeToGuest' ).and.returnValue( Observable.of( {} ) );
      spyOn($ctrl.$uibModal, 'open').and.returnValue(modalSpy);
      $ctrl.signOut();
      expect( $ctrl.$uibModal.open ).toHaveBeenCalled();
      expect( $ctrl.sessionService.downgradeToGuest ).toHaveBeenCalled();
      expect( modalSpy.close ).toHaveBeenCalled();
    } );
  } );

  describe( 'signedOut( event )', () => {
    beforeEach( () => {
      spyOn( $ctrl, '$timeout' ).and.callThrough();
    } );

    describe( 'default prevented', () => {
      it( 'does nothing', () => {
        $ctrl.signedOut( {defaultPrevented: true} );
        expect( $ctrl.$timeout ).not.toHaveBeenCalled();
      } );
    } );

    describe( 'default not prevented', () => {
      it( 'reloads', () => {
        $ctrl.signedOut( {defaultPrevented: false} );
        expect( $ctrl.$timeout ).toHaveBeenCalledWith( jasmine.any( Function ) );
        $ctrl.$timeout.flush();
        expect( $ctrl.$window.location.reload ).toHaveBeenCalled();
      } );
    } );
  } );

  describe( 'openGlobalWebsitesModal', () => {
    it( 'should open the global websites modal', () => {
      spyOn($ctrl.$uibModal, 'open');
      $ctrl.openGlobalWebsitesModal();
      expect( $ctrl.$uibModal.open ).toHaveBeenCalledWith( {
        component: 'globalWebsitesModal',
        backdrop: 'static',
        windowTemplateUrl: jasmine.any(String),
        windowClass: 'globalWebsites--is-open',
        resolve: {
          menuStructure: $ctrl.menuStructure
        }
      } );
    } );
  } );
} );
