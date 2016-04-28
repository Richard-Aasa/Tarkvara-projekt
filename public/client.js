// See fail tegeleb kliendi poolse routimisega.
// Kuna tegemist on SPA-ga (Single-Page Application)
// on vaja loogikat mis muudaks lehe sisu, selleks see fail ongi.
(function() {
    'use strict';

    angular
    .module('app', ['ngRoute','ngResource', 'ngMaterial'])
    .config(['$routeProvider','$locationProvider','$resourceProvider',
    function($routeProvider,$locationProvider,$resourceProvider) {

        $routeProvider
        .when('/', {
            templateUrl: '/js/home/home.html',
            controller: 'HomeController'
        })
        .when('/topic/:id', {
            templateUrl: '/js/topic/topic.html',
            controller: 'TopicController'
        })
        .otherwise({redirectTo: '/'});

    }]);
}());
