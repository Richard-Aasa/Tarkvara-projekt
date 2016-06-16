(function() {
    'use strict';
    angular
        .module('app')
        // Navigatsiooni controller
        .controller('MainController', function($scope, $timeout, $mdSidenav, $mdDialog, AuthenticateService, $location) {
            $scope.toggleLeft = buildDelayedToggler('left');
            $scope.service = AuthenticateService;
            $scope.changeView = function(view){
              $location.path(view); // path not hash
            }
            /**
             * Supplies a function that will continue to operate until the
             * time is up.
             */
             function debounce(func, wait, context) {
                   var timer;
                   return function debounced() {
                     var context = $scope,
                         args = Array.prototype.slice.call(arguments);
                     $timeout.cancel(timer);
                     timer = $timeout(function() {
                       timer = undefined;
                       func.apply(context, args);
                     }, wait || 10);
                   };
                 }
            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
             function buildDelayedToggler(navID) {
               return debounce(function() {
                 // Component lookup should always be available since we are not using `ng-if`
                 $mdSidenav(navID)
                   .toggle();
               }, 200);
             }

             function buildToggler(navID) {
               return function() {
                 // Component lookup should always be available since we are not using `ng-if`
                 $mdSidenav(navID)
                   .toggle();
               }
             }
             $scope.close = function() {
               $mdDialog.hide();
             }
             $scope.register = function($event) {
               $mdDialog.show({
                   parent: angular.element(document.body),
                   targetEvent: $event,
                   templateUrl: 'views/register.html',
                   locals: {
                     service: $scope.service,
                     close: $scope.close
                   },
                   controller: RegisterController
               });

               function RegisterController($scope, $mdDialog, $http, service, close) {
                 $scope.user = {
                   username: '',
                   password: '',
                   name: '',
                   phone: ''
                 };
                 $scope.userForm = {};
                 $scope.alert = '';
                 $scope.close = close;
                 $scope.register = function(user) {
                   $http.post('/auth/register', user).
                   success(function(data) {
                     $scope.alert = data.alert;
                     if (data.user) {
                       service.login(user);
                       close();
                     }
                   }).
                   error(function() {
                     $scope.alert = 'Registreerumine ei õnnestunud!';
                   });
                 }
               }
             }

             $scope.login = function($event) {
               $mdDialog.show({
                   parent: angular.element(document.body),
                   targetEvent: $event,
                   templateUrl: 'views/login.html',
                   locals: {
                       service: $scope.service,
                       close: $scope.close
                   },
                   controller: LoginController
               });

               function LoginController($scope, $mdDialog, $http, $location, service, close) {
                 $scope.user = {
                   username: '',
                   password: '',
                   name: '',
                   phone: ''
                 };
                 $scope.userForm = {};
                 $scope.alert = '';
                 $scope.close = close;
                 $scope.login = function(user) {
                   $http.post('/auth/login', user).
                   success(function(data) {
                     service.errors = data.alert;
                     $scope.alert = service.errors;
                     service.currentUser = data;
                     if(!service.errors) {
                       close();
                       if(service.currentUser.teacher){
                         $location.path('/questionnaire');
                       } else {
                         $location.path('/fill_questionnaire');
                       }

                     }
                   }).
                   error(function() {
                     service.errors = "Vale kasutaja või parool!";
                     $scope.alert = service.errors;
                   });
                 }
             }
          }
        })
        .controller('LeftNavCtrl', function($scope, $timeout, $mdSidenav, $location) {
            $scope.close = function() {
                $mdSidenav('left').close();
            }
            $scope.changeView = function(view){
              $mdSidenav('left').close();
              $location.path(view); // path not hash
            }
        });
}());
