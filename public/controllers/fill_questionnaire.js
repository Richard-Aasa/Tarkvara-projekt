(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillQuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', '$resource', '$interval', '$mdDialog', '$location', function($scope, QuestionnaireService, AuthenticateService, $resource, $interval, $mdDialog, $location) {
            $scope.questionnaires = [];
            $scope.loading = true;
            $scope.results = [];
            $scope.service = AuthenticateService;


            QuestionnaireService.query()
                .$promise.then(
                    function(data) {
                        $scope.questionnaires = data;
                    },
                    function(error) {
                        console.log(error);
                    }
                );

            var StatsByUser = $resource('/statistics/user/:user', {
                user: '@user'
            });

            StatsByUser.query({
                user: $scope.service.currentUser._id
            }).$promise.then(
                function(data) {
                    data.sort(function(a, b) {
                        return a.fillDate - b.fillDate;
                    });
                    $scope.results = data;
                    $scope.loading = false;
                },
                function(error) {
                    console.log(error);
                }
            );
            $scope.exists = function(index) {
                for (var i = $scope.results.length - 1; i >= 0; i--) {
                    if ($scope.results[i].questionnaire == $scope.questionnaires[index]._id) {
                        return false;
                    }
                }
                return true
            }
            var getResultObject = function(index) {
                for (var i = $scope.results.length - 1; i >= 0; i--) {
                    if ($scope.results[i].questionnaire == $scope.questionnaires[index]._id) {
                        return $scope.results[i];
                    }
                }
            }
            $scope.seeResults = function(index, $event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/fill_results.html',
                    locals: {
                        results: getResultObject(index),
                        questionnaire: $scope.questionnaires[index],
                        userName: $scope.service.currentUser.name
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, results, questionnaire, userName) {
                    $scope.resultObject = results;
                    $scope.questionnaire = questionnaire;
                    $scope.userName = userName;
                    $scope.return = function() {
                        $mdDialog.hide();
                    };
                };
            };
            $scope.confirm = function(address, $event) {
                var confirm = $mdDialog.confirm()
                    .title('Kas olete kindel?')
                    .textContent('Edasi liikudes hakkab aeg käima ja algab küsimustiku täitmine.')
                    .ariaLabel('Kas olete kindel')
                    .targetEvent($event)
                    .ok('Jah, alustan')
                    .cancel('Ei, mõtlesin ümber');
                $mdDialog.show(confirm).then(function() {
                    $location.path("/fill/" + address);
                });
            };
        }]);
}());
