// See fail tegeleb kliendi poolse routimisega.
// Kuna tegemist on SPA-ga (Single-Page Application)
// on vaja loogikat mis muudaks lehe sisu, selleks see fail ongi.
(function() {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngResource', 'ngMaterial'])
        .config(['$routeProvider', '$locationProvider', '$resourceProvider',
            function($routeProvider, $locationProvider, $resourceProvider) {

                $routeProvider
                    .when('/', {
                        templateUrl: '/views/home.html',
                        controller: 'HomeController'
                    })
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
                    .otherwise({
                        redirectTo: '/'
                    });
					
					//testing

            }
        ]);
}());
