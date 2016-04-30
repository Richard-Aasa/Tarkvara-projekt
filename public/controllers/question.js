// Sellisel kujul näeb algne kontroller välja
(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionController', ['$scope', 'Question', '$mdToast', function($scope, Question, $mdToast) {
            $scope.questions = [];
            $scope.question = {};
            $scope.question.maxPoints = 0;
            $scope.question.variants = [];
            $scope.loading = true;
            Question.query()
                .$promise.then(
                    function(data) {
                        console.log(data);
                        $scope.questions = data;
                        $scope.loading = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );

            $scope.addVariant = function(question, variant) {
                $scope.question.variants.push(angular.copy(variant));
                $scope.question.maxPoints += variant.points;
            }
            $scope.remVariant = function(question, variant) {
                $scope.question.maxPoints -= variant.points;
                $scope.question.variants.splice(question.variants.indexOf(variant), 1);
            }
            $scope.addQuestion = function() {
                var newQuestion = new Question($scope.question);
                newQuestion.$save()
                    .then(
                        function(data) {
                            showToast('Successfully saved ' + data.name);
                            $scope.questions.push(data);
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                            console.log($scope.question);
                        }
                    );
            }
            var showToast = function(message) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(message)
                    .position('top right')
                    .hideDelay(3000)
                );
            };
        }]);

}());
