// See fail tegeleb kliendi poolse routimisega.
// Kuna tegemist on SPA-ga (Single-Page Application)
// on vaja loogikat mis muudaks lehe sisu, selleks see fail ongi.
(function() {
  'use strict';

  angular
    .module('app', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages'])
    .config(['$routeProvider', '$locationProvider', '$resourceProvider', '$mdThemingProvider',
      function($routeProvider, $locationProvider, $resourceProvider, $mdThemingProvider) {

        $routeProvider
          //localhost:3000/#/ siia otsa rakendub see .when, et kui url on /test/question/ siis laetakse seda vaadet
          .when('/question', {
            templateUrl: '/views/question.html',
            controller: 'QuestionController'
          })
          .when('/questionnaire', {
            templateUrl: '/views/questionnaire.html',
            controller: 'QuestionnaireController'
          })
          .when('/fill', {
            templateUrl: '/views/fill.html',
            controller: 'FillController'
          })
          .when('/home', {
            templateUrl: '/views/home.html',
            controller: 'HomeController'
          })
          .otherwise({
            redirectTo: '/'
          });

        //Theme
        angular.module('myApp', ['ngMaterial'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('pink', {
      'default': '400', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    })
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('purple', {
      'default': '200' // use shade 200 for default, and keep all other shades the same
    });
});
      }
    ]);
}());
