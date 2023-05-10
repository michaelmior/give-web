import angular from 'angular'
import 'angular-gettext'
import profileService from 'common/services/api/profile.service'
import verificationService from 'common/services/api/verification.service'
import userMatchIdentity from './userMatchIdentity/userMatchIdentity.component'
import userMatchQuestion from './userMatchQuestion/userMatchQuestion.component'
import analyticsFactory from 'app/analytics/analytics.factory'
import template from './userMatchModal.tpl.html'
import find from 'lodash/find'
import failedVerificationModal from 'common/components/failedVerificationModal/failedVerificationModal.component'

const componentName = 'userMatchModal'

class UserMatchModalController {
  /* @ngInject */
  constructor ($log, $window, gettext, profileService, verificationService, analyticsFactory) {
    this.$log = $log
    this.$window = $window
    this.gettext = gettext
    this.profileService = profileService
    this.verificationService = verificationService
    this.analyticsFactory = analyticsFactory
    this.stepCount = 8 // intro, name, 5 questions, and success
  }

  $onInit () {
    this.setLoading({ loading: true })
    this.loadingDonorDetailsError = false
    this.skippedQuestions = false
    this.modalTitle = this.gettext('Activate your Account')
    this.profileService.getDonorDetails().subscribe((donorDetails) => {
      if (angular.isDefined(donorDetails['registration-state'])) {
        if (donorDetails['registration-state'] === 'COMPLETED') {
          this.skippedQuestions = true
          this.changeMatchState('success')
        } else if (donorDetails['registration-state'] === 'NEW') {
          // Do donor matching if
          this.postDonorMatch()
        } else {
          this.changeMatchState('intro')
        }
      }
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingDonorDetailsError = true
      this.$log.error('Error loading donorDetails.', error)
    })
  }

  getCurrentStep () {
    if (this.matchState === 'intro') {
      return 0
    } else if (this.matchState === 'identity') {
      return 1
    } else if (this.matchState === 'question') {
      return this.questionIndex + 1 // questionIndex is 1-indexed, otherwise this would be + 2
    } else if (this.matchState === 'success') {
      return 7
    } else {
      return 0
    }
  }

  postDonorMatch () {
    this.setLoading({ loading: true })
    this.verificationService.postDonorMatches().subscribe(() => {
      // Donor match success, get contacts
      this.changeMatchState('intro')
    }, () => {
      // Donor Match failed, user match not required
      this.skippedQuestions = true
      this.changeMatchState('success')
    })
  }

  getContacts () {
    if (this.contacts) {
      // The user picked a contact then went back, so don't load the contacts again because there
      // probably won't even be any
      this.changeMatchState('identity')
      return
    }

    this.setLoading({ loading: true })
    this.verificationService.getContacts().subscribe((contacts) => {
      if (find(contacts, { selected: true })) {
        this.onActivate()
      } else {
        this.contacts = contacts
        this.changeMatchState('identity')
      }
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingDonorDetailsError = true
      this.$log.error('Error loading verification contacts.', error)
    })
  }

  changeMatchState (state) {
    switch (state) {
      case 'success':
        this.modalTitle = this.gettext('Success!')
        this.onSuccess()
        break
      default:
        this.modalTitle = this.gettext('Activate Your Account')
    }
    this.matchState = state
    this.setLoading({ loading: false })
  }

  onSelectContact (contact) {
    this.setLoading({ loading: true })
    this.selectContactError = false
    if (angular.isDefined(contact)) {
      this.verificationService.selectContact(contact).subscribe(() => {
        this.onActivate()
        this.firstName = contact.name.split(' ')[0]
      },
      error => {
        this.setLoading({ loading: false })
        this.selectContactError = true
        this.$log.error('Error selecting verification contact.', error)
      })
    } else {
      this.verificationService.thatIsNotMe().subscribe(() => {
        this.skippedQuestions = true
        this.changeMatchState('success')
      },
      error => {
        this.setLoading({ loading: false })
        this.selectContactError = true
        this.$log.error('Error selecting \'that-is-not-me\' verification contact', error)
      })
    }
  }

  onActivate () {
    this.setLoading({ loading: true })
    this.loadingQuestionsError = false
    this.verificationService.getQuestions().subscribe((questions) => {
      this.questions = questions
      this.questionIndex = 1
      this.questionCount = this.questions.length
      this.changeMatchState('question')
    },
    error => {
      this.setLoading({ loading: false })
      this.loadingQuestionsError = true
      this.$log.error('Error loading verification questions.', error)
    })
  }

  onQuestionAnswer (question, answer) {
    question.answer = answer
    if (this.questionIndex < this.questions.length) {
      this.questionIndex++
      this.changeMatchState('question')
    } else {
      const answers = this.questions.map(({ key, answer }) => ({ key, answer }))
      this.verificationService.submitAnswers(answers).subscribe(() => {
        this.changeMatchState('success')
      },
      error => {
        this.setLoading({ loading: false })
        this.$log.debug('Failed verification questions', error)
        this.changeMatchState('failure')
      })
    }
  }

  onFailure () {
    this.$window.location = '/'
  }

  back () {
    if (this.questionIndex === 1) {
      this.changeMatchState('identity')
    } else {
      this.questionIndex--
    }
  }

  continueCheckout () {
    this.$window.location = '/checkout.html'
  }

  gotoOpportunities () {
    this.$window.location = '/'
  }

  gotoDashboard () {
    this.$window.location = '/your-giving.html'
  }
}

export default angular
  .module(componentName, [
    'gettext',
    verificationService.name,
    profileService.name,
    userMatchIdentity.name,
    userMatchQuestion.name,
    analyticsFactory.name,
    failedVerificationModal.name
  ])
  .component(componentName, {
    controller: UserMatchModalController,
    templateUrl: template,
    bindings: {
      cartCount: '<',
      firstName: '=',
      modalTitle: '=',
      setLoading: '&',
      onStateChange: '&',
      onSuccess: '&'
    }
  })
