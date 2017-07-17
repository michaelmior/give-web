# give-web
## Angular front-end components for use in AEM on [give.cru.org](https://give.cru.org)

[![Build Status](https://travis-ci.org/CruGlobal/give-web.svg?branch=master)](https://travis-ci.org/CruGlobal/give-web)
[![codecov](https://codecov.io/gh/CruGlobal/give-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/give-web)

## Usage

### Importing JS and HTML templates

To use the `searchResults` component, include this code on your page:
```html
<search-results ng-app="searchResults"></search-results>

<script src="https://cru-givestage.s3.amazonaws.com/app.js"></script>
```

For other components, replace all instances of `checkout` with the name of another component. Current components are `cart`, `checkout`, `thankYou`, `productConfig`, `signIn`, `searchResults`, `homeSignIn`, `yourGiving`, `profile`, `receipts`, `paymentMethods`, `designationEditor`, and `brandedCheckout`. The element name needs to be kebab case and the ng-app module name needs to be camel case.

### Importing CSS

Import the following:
```html
<link rel="stylesheet" href="https://cru-givestage.s3.amazonaws.com/give.min.css">
<link rel="stylesheet" href="https://cru-givestage.s3.amazonaws.com/nav.min.css">
```
This currently includes all cru.org styling from cru.scss.

### Branded checkout
Add the following code to your page where appropriate:
```html
<link rel="stylesheet" href="https://give-static.cru.org/branded-checkout.min.css">
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css">

<branded-checkout
    ng-app="brandedCheckout"
    code="<designation number>"
    campaign-code="<campaign code>"
    amount="<amount>"
    frequency="<frequency>"
    day="<day>"
    on-order-completed="$event.$window.onOrderCompleted($event.purchase)">
</branded-checkout>

<script src="https://give-static.cru.org/app.js"></script>
<script>
  window.onOrderCompleted = function (purchaseData) {
    console.log('Order completed successfully', purchaseData);
  };
</script>
```
The `<branded-checkout>` element is where the branded checkout Angular app will be loaded. It accepts the following attributes:
- `ng-app="brandedCheckout"` - tells Angular which module to load - **Required** - you could bootstrap Angular manually or include this `brandedCheckout` module in your own custom Angular module instead if desired
- `code` - the designation number you would like donors to give to - **Required**
- `campaign-code` - the campaign code you would like to use - *Optional*
- `amount` - defaults the gift's amount - *Optional*
- `frequency` - defaults the gift's frequency - *Optional* - can be one of the following values:
  - `single` - single gift - this is the default so it doesn't need to be specified
  - `monthly` - monthly recurring gift
  - `quarterly` - quarterly recurring gift
  - `annually` - annually recurring gift
- `day` - for recuring gifts this defaults the gift's day of the month - *Optional* - can be `1` to `28`
- `on-order-completed` - an Angular expression that is executed when the order was submitted successfully - *Optional* -  provides 2 variables:
  - `$event.$window` - Provides access to the browser's global `window` object. This allows you to call a custom callback function like `onOrderCompleted` in the example.
  - `$event.purchase` - contains the order's details that are loaded for the thank you page

## Development

### Installing yarn
Use yarn for faster installs and to update the yarn lock file: https://yarnpkg.com/en/docs/install

### Install & Run

1. `yarn` or `npm install`
2. `yarn start` or `npm start`
3. Browse to [`http://localhost:9000`](http://localhost:9000)
Note: For session cookies to work correctly, add an entry to your hosts file for `localhost.cru.org` pointing to `127.0.0.1` and use [`http://localhost.cru.org:9000`](http://localhost.cru.org:9000) for development

### Development Tasks

- `yarn run test` or `npm run test` to run karma tests
- `yarn run lint` or `npm run lint` to run eslint
- `yarn run build` or `npm run build` to generate minified output files. These files are output to `/dist`. `common.js` must be included before any of the other JS files.
- `yarn run build:analyze` or `npm run build:analyze` to open a visualization of bundle sizes after building

### Adding dependencies

- Use `yarn add <package-name>` or `npm install <package-name> --save` to install app dependencies
- Use `yarn add <package-name> -dev` `npm install <package-name> --save-dev` to install tooling dependencies

### Making queries to Cortex
Use the `cortexApiService` which provides convenience methods for sending requests to Cortex. For more documentation see the [cortexApiService docs](docs/cortexApiService.md).
