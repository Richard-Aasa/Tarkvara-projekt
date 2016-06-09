// Sellisel kujul näeb algne kontroller välja
(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionController', ['$scope', 'QuestionService', '$mdToast', '$mdDialog', function($scope, QuestionService, $mdToast, $mdDialog) {
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
                            $scope.questions.push(question);
                            $scope.question = {};
                            $scope.question.type = question.type;
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
            $scope.update = function(question) {
              $mdDialog.hide();
              var index = $scope.questions.indexOf(question);

              if (question.id) {
                      return question.$update();
              } else {
                  return question.$create();
              }
            }
            $scope.clear = function() {
                $scope.question.variants = [];
                $scope.question.maxPoints = 0;
            };
            $scope.edit = function($event, question) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/question_edit.html',
                    locals: {
                        question: question,
                        questions: $scope.questions,
                        update: $scope.update
                    },
                    controller: DialogController
                });
                function DialogController($scope, $mdDialog, question, questions, update) {
                  $scope.question = question;
                  $scope.questions = questions;
                  $scope.modify = function(item) {
                      $mdDialog.hide();
                      update(item);
                  }
                }
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
