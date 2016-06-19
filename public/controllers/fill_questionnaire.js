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
                        data.sort(function(a, b) {
                            var textA = a.title.toUpperCase();
                            var textB = b.title.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        });
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

            // http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
            $scope.displayRemainingTime = function(millisec) {
                var seconds = (millisec / 1000).toFixed(0);
                var minutes = Math.floor(seconds / 60);
                var hours = "";
                if (minutes > 59) {
                    hours = Math.floor(minutes / 60);
                    hours = (hours >= 10) ? hours : "0" + hours;
                    minutes = minutes - (hours * 60);
                    minutes = (minutes >= 10) ? minutes : "0" + minutes;
                }
                seconds = Math.floor(seconds % 60);
                seconds = (seconds >= 10) ? seconds : "0" + seconds;
                if (hours !== "") {
                    return hours + ":" + minutes + ":" + seconds;
                }
                return minutes + ":" + seconds;
            };
            $scope.seeResults = function(index, $event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/fill_results.html',
                    locals: {
                        results: getResultObject(index),
                        displayRemainingTime : $scope.displayRemainingTime,
                        questionnaire: $scope.questionnaires[index],
                        userName: $scope.service.currentUser.name
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, results, questionnaire, userName, displayRemainingTime) {
                    $scope.resultObject = results;
                    $scope.resultObject.userTime = displayRemainingTime($scope.resultObject.userTime);
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
