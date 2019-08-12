export default {
  self: {
    type: 'elasticpath.profiles.profile',
    uri: '/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=selfservicepaymentmethods:element',
    href: 'https://give-stage2.cru.org/cortex/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=?zoom=selfservicepaymentmethods:element'
  },
  links: [{
    rel: 'addresses',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/addresses/crugive',
    href: 'https://give-stage2.cru.org/cortex/addresses/crugive'
  }, {
    rel: 'addspousedetails',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails',
    href: 'https://give-stage2.cru.org/cortex/donordetails/profiles/crugive/gnrdkojsge4dsljxhazwmljugmztillcgu3gkljqgm3tkytdmm3dmzrxme=/spousedetails'
  }, {
    rel: 'emails',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/emails/crugive',
    href: 'https://give-stage2.cru.org/cortex/emails/crugive'
  }, {
    rel: 'givingdashboard',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/giving/crugive',
    href: 'https://give-stage2.cru.org/cortex/giving/crugive'
  }, {
    rel: 'paymentmethods',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/paymentmethods/crugive',
    href: 'https://give-stage2.cru.org/cortex/paymentmethods/crugive'
  }, {
    rel: 'phonenumbers',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/phonenumbers/crugive',
    href: 'https://give-stage2.cru.org/cortex/phonenumbers/crugive'
  }, {
    rel: 'purchases',
    type: 'elasticpath.collections.links',
    uri: '/purchases/crugive',
    href: 'https://give-stage2.cru.org/cortex/purchases/crugive'
  }, {
    rel: 'selfservicepaymentmethods',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/selfservicepaymentmethods/crugive',
    href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive'
  }, {
    rel: 'wishlists',
    rev: 'profile',
    type: 'elasticpath.collections.links',
    uri: '/wishlists/crugive',
    href: 'https://give-stage2.cru.org/cortex/wishlists/crugive'
  }],
  _selfservicepaymentmethods: [{
    _element: [{
      self: {
        type: 'cru.creditcards.named-credit-card',
        uri: '/selfservicepaymentmethods/crugive/giydgnrxgm=',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive/giydgnrxgm='
      },
      links: [{
        rel: 'list',
        uri: '/selfservicepaymentmethods/crugive',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive'
      }, {
        rel: 'recurringgifts',
        uri: '/donations/recurring/crugive/paymentmethods/giydgnrxgm=',
        href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydgnrxgm='
      }],
      address: {
        'country-name': 'US',
        'extended-address': '',
        locality: 'Sacramento',
        'postal-code': '12345',
        region: 'CA',
        'street-address': '123 First St'
      },
      'card-number': '1111',
      'card-type': 'Visa',
      'cardholder-name': 'Test Card',
      description: 'Visa - 1111',
      'expiry-month': '11',
      'expiry-year': '2019'
    }, {
      self: {
        type: 'elasticpath.bankaccounts.bank-account',
        uri: '/selfservicepaymentmethods/crugive/giydcnzyga=',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive/giydcnzyga='
      },
      links: [{
        rel: 'list',
        uri: '/selfservicepaymentmethods/crugive',
        href: 'https://give-stage2.cru.org/cortex/selfservicepaymentmethods/crugive'
      }, {
        rel: 'recurringgifts',
        uri: '/donations/recurring/crugive/paymentmethods/giydcnzyga=',
        href: 'https://give-stage2.cru.org/cortex/donations/recurring/crugive/paymentmethods/giydcnzyga='
      }],
      'account-type': 'Savings',
      'bank-name': '2nd Bank',
      description: '2nd Bank - 3456',
      'display-account-number': '3456',
      'encrypted-account-number': '',
      'routing-number': '021000021'
    }]
  }],
  'family-name': 'Lname',
  'given-name': 'Fname'
}
