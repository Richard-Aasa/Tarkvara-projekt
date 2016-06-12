(function() {
    'use strict';

    angular.
    module('app').factory('AuthenticateService', function($http, $timeout, $q, $location) {
        var service = {
            // Information about the current user
            currentUser: null,
            // Any errors for login/register form
            errors: null,

            login: function(user) {
                return $http.post('/auth/login', user).
                success(function(data) {
                  service.currentUser = data;
                  service.errors = data.alert;
                }).
                error(function() {
                  service.errors = "Vale kasutaja või parool!"
                });
                return login
            },

            logout: function() {
                $http.get('/auth/logout').
                success(function() {
                    service.currentUser = null;
                    $location.path('/');
                });
            },

            // Ask the backend to see if a user is already authenticated -
            // this may be from a previous session.
            requestCurrentUser: function() {
                if (service.isAuthenticated()) {
                    console.log("init1");
                    return $q.when(service.currentUser);
                } else {
                    return $http.get('/auth/user').success(function(user) {
                        service.currentUser = user;
                        return service.currentUser;
                    });
                }
            },

            // Is the current user authenticated?
            isAuthenticated: function() {
                return service.currentUser !== null;
            },

            // Is the current user teacher?
            isTeacher: function() {
                service.requestCurrentUser();
                if(!(service.isAuthenticated() && service.currentUser.teacher)){
                  $location.path('/');
                }
            }

        };
        return service;
    });
}());
