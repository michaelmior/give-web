import angular from 'angular'
import modalStateService from 'common/services/modalState.service'
import sessionModalComponent from './sessionModal.component'
import sessionModalWindowTemplate from './sessionModalWindow.tpl.html'
import analyticsFactory from 'app/analytics/analytics.factory'
import uibModal from 'angular-ui-bootstrap/src/modal'

const serviceName = 'sessionModalService'

const SessionModalService = /* @ngInject */ function ($uibModal, $log, modalStateService, analyticsFactory) {
  let currentModal

  function openModal (type, options, replace) {
    if (angular.isDefined(currentModal)) {
      if (replace === true) {
        currentModal.dismiss('replaced')
      } else {
        if (currentModal.type !== 'reset-password') {
          $log.error('Attempted to open more than 1 modal')
        }
        return false
      }
    }
    type = angular.isDefined(type) ? type : 'sign-in'
    options = angular.isObject(options) ? options : {}
    const modalOptions = angular.merge({}, {
      component: sessionModalComponent.name,
      size: 'sm',
      windowTemplateUrl: sessionModalWindowTemplate,
      resolve: {
        state: () => type
      }
    }, options)
    currentModal = $uibModal.open(modalOptions)
    currentModal.type = type
    currentModal.result
      .finally(() => {
        // Clear the modal name when modals close
        modalStateService.name(null)

        // Destroy current modal
        currentModal = undefined
      })

    if (options.dismissAnalyticsEvent) {
      currentModal.result
        .then(angular.noop, () => {
          analyticsFactory.track(options.dismissAnalyticsEvent)
          switch (type) {
            case 'sign-in':
            case 'sign-up':
              analyticsFactory.trackGTM('ga-sign-in-exit')
              break
            case 'user-match':
              analyticsFactory.trackGTM('ga-registration-exit')
              break
            default:
              break
          }
        })
    }

    if (options.openAnalyticsEvent) {
      currentModal.opened.then(() => {
        analyticsFactory.track(options.openAnalyticsEvent)
        switch (type) {
          case 'sign-in':
          case 'sign-up':
            analyticsFactory.trackGTM('ga-sign-in')
            break
          case 'user-match':
            analyticsFactory.trackGTM('ga-registration-match-is-this-you')
            break
          default:
            break
        }
      }, angular.noop)
    }

    return currentModal
  }

  return {
    open: openModal,
    currentModal: () => currentModal,
    signIn: (lastPurchaseId) => openModal('sign-in', {
      resolve: { lastPurchaseId: () => lastPurchaseId },
      openAnalyticsEvent: 'aa-sign-in',
      dismissAnalyticsEvent: 'aa-sign-in-exit'
    }).result,
    signUp: () => openModal('sign-up').result,
    forgotPassword: () => openModal('forgot-password').result,
    resetPassword: () => openModal('reset-password', { backdrop: 'static' }).result,
    userMatch: () => openModal('user-match', {
      backdrop: 'static',
      openAnalyticsEvent: 'aa-registration-match-is-this-you',
      dismissAnalyticsEvent: 'aa-registration-exit'
    }).result,
    contactInfo: () => openModal('contact-info', { size: '', backdrop: 'static' }).result,
    accountBenefits: (lastPurchaseId) => openModal('account-benefits', { resolve: { lastPurchaseId: () => lastPurchaseId } }).result,
    registerAccount: () => openModal('register-account', { backdrop: 'static', keyboard: false }).result
  }
}

export default angular
  .module(serviceName, [
    uibModal,
    modalStateService.name,
    sessionModalComponent.name,
    analyticsFactory.name
  ])
  .factory(serviceName, SessionModalService)
  .config(function (modalStateServiceProvider) {
    modalStateServiceProvider.registerModal(
      'reset-password',
      /* @ngInject */
      function (sessionModalService) {
        sessionModalService.resetPassword()
      })
  })
