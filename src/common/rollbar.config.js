import { rollbarAccessToken } from 'common/app.constants';
import rollbar from 'rollbar-browser';
import stacktrace from 'stacktrace-js';
import map from 'lodash/map';
import defaults from 'lodash/defaults';
import get from 'lodash/get';

let Rollbar;

/* @ngInject */
function rollbarConfig(envServiceProvider, $provide) {
  let rollbarConfig = {
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: false,
    environment: envServiceProvider.get(),
    enabled: !envServiceProvider.is('development'), // Disable rollbar in development environment
    transform: transformRollbarPayload,
    hostWhiteList: ['give.cru.org', 'give-stage2.cru.org', 'stage.cru.org', 'dev.aws.cru.org', 'devauth.aws.cru.org', 'devpub.aws.cru.org', 'uatauth.aws.cru.org', 'uatpub.aws.cru.org'],
    scrubFields: ['password', 'cvv', 'cvv2', 'security-code'],
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
          guess_uncaught_frames: true,
          code_version: process.env.TRAVIS_COMMIT // eslint-disable-line
        }
      }
    }
  };
  Rollbar = rollbar.init(rollbarConfig);

  /* @ngInject */
  $provide.decorator('$log', $delegate => {
    // Add rollbar functionality to each $log method
    angular.forEach(['log', 'debug', 'info', 'warn', 'error'], ngLogLevel => {
      let rollbarLogLevel = ngLogLevel === 'warn' ? 'warning' : ngLogLevel;

      let originalFunction = $delegate[ngLogLevel]; // Call below to keep angular $log functionality

      $delegate[ngLogLevel] = (...args) => {
        originalFunction.apply(null, args);

        let origin = args[0] && args[0].message ? '$ExceptionHandler' : '$log';
        let stackFramesPromise, message;

        if(origin === '$ExceptionHandler'){
          message = args[0].message;

          // Parse the exception to get the stack
          stackFramesPromise = stacktrace.fromError(args[0], {offline: true});
        }else{
          // Join $log arguments
          message = args
            .map(arg => angular.toJson(arg))
            .join(', ');

          // Log came from app so we get the stacktrace from this file
          stackFramesPromise = stacktrace.get({offline: true});
        }

        stackFramesPromise
          .then(stackFrames => {
            // For logs, ignore first stack frame which is this file
            origin === '$log' && stackFrames.shift();
            // Send combined message and stack trace to rollbar
            Rollbar[rollbarLogLevel](message, {stackTrace: stackFrames, origin: origin});
          })
          .catch(error => {
            // Send message without stack trace to rollbar
            Rollbar[rollbarLogLevel](message, {origin: origin});
            // Send warning about the issue loading stackframes
            Rollbar.warning('Error loading stackframes: ' + error);
          });
      };

      defaults($delegate[ngLogLevel], originalFunction); // copy properties of original $log function which specs use
    });

    return $delegate;
  });

}

function formatStacktraceForRollbar(stackFrames){
  return map(stackFrames, frame => {
    return {
      method: frame.functionName,
      lineno: frame.lineNumber,
      colno: frame.columnNumber,
      filename: frame.fileName
    };
  });
}

function transformRollbarPayload(payload){
  if(get(payload, 'data.body.message.extra.stackTrace')) {
    // Convert message format to trace format
    payload.data.body.trace = {
      frames: formatStacktraceForRollbar(payload.data.body.message.extra.stackTrace),
      exception: {
        message: payload.data.body.message.body,
        class: payload.data.body.message.extra.origin
      }
    };
    delete payload.data.body.message;
  }
  return payload;
}

function updateRollbarPerson(session){
  let person = {};
  if(session){
    person = {
      id: session.sub,
      username: session.first_name + ' ' + session.last_name,
      email: session.email
    };
  }

  Rollbar.configure({
    payload: {
      person: person
    }
  });
}

export {
  rollbarConfig as default,
  updateRollbarPerson,
  rollbar, // For mocking during testing
  stacktrace, // For mocking during testing,
  formatStacktraceForRollbar, // To test this function separately
  transformRollbarPayload // To test this function separately
};
