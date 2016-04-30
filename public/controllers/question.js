// Sellisel kujul näeb algne kontroller välja
(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionController', ['$scope', 'QuestionService', '$mdToast', function($scope, QuestionService, $mdToast) {
            $scope.questions = [];
            $scope.question = {};
            $scope.question.variants = [];
            $scope.question.maxPoints = 0;
            $scope.loading = true;

            // WORKS
            QuestionService.query()
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
            };
            $scope.remVariant = function(question, variant) {
                $scope.question.maxPoints -= variant.points;
                $scope.question.variants.splice(question.variants.indexOf(variant), 1);
            };

            $scope.save = function(question) {

                var newQuestion = new QuestionService({
                    title: question.title,
                    type: question.type,
                    variants: question.variants,
                    maxPoints: question.maxPoints
                });

                newQuestion.$save()
                    .then(
                        function(data) {
                            showToast('Küsimus edukalt salvestatud: ' + question.title);
                            $scope.questions.push($scope.question);
                            $scope.question = {};
                            $scope.question.variants = [];
                            $scope.question.maxPoints = 0;
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };
            $scope.delete = function(question) {
                var index = $scope.questions.indexOf(question);
                $scope.questions.splice(index, 1);
                question.$delete()
                    .then(
                        function(data) {
                            showToast('Küsimus edukalt kustutatud: ' + question.title);
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };
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
