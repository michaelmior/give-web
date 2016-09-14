import angular from 'angular';
import 'angular-cookies';
import 'angular-environment';
import jwtDecode from 'jwt-decode';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';

import appConfig from 'common/app.config';

let serviceName = 'sessionService';
export let Roles = {
  public:     'PUBLIC',
  identified: 'IDENTIFIED',
  registered: 'REGISTERED'
};

/*@ngInject*/
function session( $cookies, $rootScope, $http, $timeout, envService ) {
  var session = {},
    sessionSubject = new BehaviorSubject( session ),
    sessionTimeout;

  // Set initial session on load
  updateCurrentSession( $cookies.get( 'cortex-session' ) );

  // Watch cortex-session cookie for changes and update existing session variable
  // This only detects changes made by $http or other angular services, not the browser expiring the cookie.
  // eslint-disable-next-line angular/on-watch
  $rootScope.$watch( () => $cookies.get( 'cortex-session' ), updateCurrentSession );

  // Return sessionService public interface
  return {
    session:        session,
    sessionSubject: sessionSubject,
    getRole:        currentRole,
    signIn:         signIn,
    signOut:        signOut,
    signUp:         signUp,
    forgotPassword: forgotPassword,
    resetPassword:  resetPassword
  };

  /* Public Methods */
  function signIn( username, password ) {
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/login' ),
        data:            {
          username: username,
          password: password
        },
        withCredentials: true
      } ) )
      .map( ( response ) => response.data );
  }

  function signOut() {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Logout
    return $http( {
      method:          'DELETE',
      url:             casApiUrl( '/logout' ),
      withCredentials: true
    } );
  }

  function signUp( email, password, first_name, last_name ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Create-User
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/register' ),
        withCredentials: true,
        data:            {
          email:     email,
          password:  password,
          firstName: first_name,
          lastName:  last_name
        }
      } ) )
      .map( ( response ) => response.data );
  }

  function forgotPassword( email, passwordResetUrl ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Send-Forgot-Password-Email
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/send_forgot_password_email' ),
        withCredentials: true,
        data:            {
          email:            email,
          passwordResetUrl: passwordResetUrl
        }
      } ) )
      .map( ( response ) => response.data );
  }

  function resetPassword( email, password, resetKey ) {
    // https://github.com/CruGlobal/cortex_gateway/wiki/Set-Password-By-Reset-Key
    return Observable
      .from( $http( {
        method:          'POST',
        url:             casApiUrl( '/reset_password' ),
        withCredentials: true,
        data:            {
          email:    email,
          password: password,
          resetKey: resetKey
        }
      } ) )
      .map( ( response ) => response.data );
  }

  /* Private Methods */
  function updateCurrentSession( encoded_value ) {
    let cortexSession = {};
    if ( angular.isDefined( encoded_value ) ) {
      cortexSession = jwtDecode( encoded_value );
    }
    // Set expiration timeout
    setSessionTimeout();
    // Copy new session into current session object
    angular.copy( cortexSession, session );
    // Update sessionSubject with new value
    sessionSubject.next( session );
  }

  function setSessionTimeout() {
    let encodedSession = $cookies.get( 'give-session' );
    // Cancel current session timeout
    if ( angular.isDefined( sessionTimeout ) ) {
      $timeout.cancel( sessionTimeout );
      sessionTimeout = undefined;
    }
    // Decode give-session cookie and set timeout based on expiration
    if ( angular.isDefined( encodedSession ) ) {
      let giveSession = jwtDecode( encodedSession ),
        timeout = new Date( giveSession.exp * 1000 ) - Date.now();
      if ( timeout > 0 ) {
        sessionTimeout = $timeout( timeout );
        sessionTimeout.then( () => {
          updateCurrentSession( $cookies.get( 'cortex-session' ) );
        } );
      }
    }
  }

  function currentRole() {
    if ( angular.isDefined( session.token_hash ) ) {
      if ( session.token_hash.role === Roles.public ) {
        return Roles.public;
      }
      // Expired cookies are undefined
      if ( angular.isUndefined( $cookies.get( 'give-session' ) ) ) {
        return Roles.identified;
      }
      return session.token_hash.role;
    }
    return Roles.public;
  }

  function casApiUrl( path ) {
    var apiUrl = envService.read( 'apiUrl' ) + '/cas';
    return apiUrl + path;
  }
}

export default angular
  .module( serviceName, [
    'ngCookies',
    'environment',
    appConfig.name
  ] )
  .factory( serviceName, session );