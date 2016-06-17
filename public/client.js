// See fail tegeleb kliendi poolse routimisega.
// Kuna tegemist on SPA-ga (Single-Page Application)
// on vaja loogikat mis muudaks lehe sisu, selleks see fail ongi.
(function() {
  'use strict';

  angular
    .module('app', ['ngRoute', 'ngResource', 'ngMaterial', 'ngMessages', 'ngAnimate', 'highcharts-ng'])
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
          .when('/fill/:id', {
            templateUrl: '/views/fill.html',
            controller: 'FillController'
          })
          .when('/home', {
            templateUrl: '/views/home.html',
            controller: 'HomeController'
          })
          .when('/stat', {
            templateUrl: '/views/stat.html',
            controller: 'StatController'
          })
          .when('/fill_questionnaire', {
            templateUrl: '/views/fill_questionnaire.html',
            controller: 'FillQuestionnaireController'
          })
          .otherwise({
            redirectTo: '/home'
          });


        //Theme
                $mdThemingProvider.theme('default')
                  .primaryPalette('blue-grey')
                  .accentPalette('blue-grey', {
                    'default' : '100'
                  });
      }
    ]);
}());
