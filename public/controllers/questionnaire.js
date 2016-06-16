(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', '$mdToast', '$mdDialog', '$resource', function($scope, QuestionnaireService, AuthenticateService, $mdToast, $mdDialog, $resource) {
            $scope.questionnaires = [];
            $scope.activeQuestionnaire = null;
            $scope.originalQuestionnaire = null;
            $scope.activeQuestion = {};
            $scope.currentQuestionIndex = {};
            $scope.currentIndex = 0;
            $scope.service = AuthenticateService;
            $scope.loading = true;
            $scope.loadingInner = true;
            $scope.isEditable = false;

            var QuestionnaireByAuthor = $resource('/questionnaire/author/:author', {
                author: '@author'
            });
            QuestionnaireByAuthor.query({
                author: $scope.service.currentUser._id
            }).$promise.then(
              function(data) {
                data.sort(function(a, b) {
                  var textA = a.title.toUpperCase();
                  var textB = b.title.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                $scope.questionnaires = data;
                commitViewChange($scope.questionnaires[0]);
                $scope.loading = false;
              },
              function(error) {
                console.log(error);
              }
            );

            $scope.save = function(questionnaire) {
                var newQuestionnaire = new QuestionnaireService({
                    title: questionnaire.title,
                    author: questionnaire.author,
                    questions: questionnaire.questions,
                    totalTime: questionnaire.totalTime,
                    totalPoints: questionnaire.totalPoints,
                    createdDate: questionnaire.createdDate,
                    saved: questionnaire.saved,
                    published: questionnaire.published,
                    archieved: questionnaire.archived
                });

                newQuestionnaire.$save()
                    .then(
                        function(data) {
                            showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
                            $scope.questionnaires.push(questionnaire);
                            $scope.questionnaires.sort(function(a, b) {
                                var textA = a.title.toUpperCase();
                                var textB = b.title.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                            commitViewChange(questionnaire);
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };

            $scope.update = function(questionnaire) {
                questionnaire.saved = Date.now();
                var serviceQuestionnaire = new QuestionnaireService(questionnaire);
                serviceQuestionnaire.$update().then(
                    function(data) {
                        showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
                        $scope.questionnaires[$scope.currentIndex] = angular.copy(questionnaire);
                        $scope.originalQuestionnaire = questionnaire;
                    },
                    function(error) {
                        showToast(error.status + ' ' + error.statusText);
                    }
                );
            };

            $scope.delete = function(questionnaire) {
                $scope.questionnaires.splice($scope.currentIndex, 1);
                var serviceQuestionnaire = new QuestionnaireService(questionnaire);
                serviceQuestionnaire.$delete()
                    .then(
                        function(data) {
                            showToast('Küsimustik edukalt kustutatud: ' + questionnaire.title);
                            commitViewChange($scope.questionnaires[0]);
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };

            $scope.remove = function($event) {
                var confirm = $mdDialog.confirm()
                    .title('Kas olete kindel?')
                    .textContent('Kas kustutame küsimustiku ära? Seda enam tagasi ei saa.')
                    .ariaLabel('Kas olete kindel')
                    .targetEvent($event)
                    .ok('Jah, kustuta')
                    .cancel('Ei, mõtlesin ümber');
                $mdDialog.show(confirm).then(function() {
                    $scope.delete($scope.activeQuestionnaire);
                });
            };

            $scope.addQuestion = function(question) {
                $scope.activeQuestionnaire.questions.push(angular.copy(question));
                $scope.activeQuestionnaire.totalPoints += question.maxPoints;
            };

            $scope.editQuestion = function(question) {
                $scope.activeQuestionnaire.totalPoints -= $scope.activeQuestionnaire.questions[$scope.currentQuestionIndex].maxPoints;
                $scope.activeQuestionnaire.questions[$scope.currentQuestionIndex] = angular.copy(question);
                $scope.activeQuestionnaire.totalPoints += question.maxPoints;
            };

            $scope.remQuestion = function(question) {
                $scope.activeQuestionnaire.questions.splice($scope.activeQuestionnaire.questions.indexOf(question), 1);
                $scope.activeQuestionnaire.totalPoints -= question.maxPoints;
            };

            $scope.addVariant = function(question, variant) {
                question.variants.push(angular.copy(variant));
                question.maxPoints += variant.points;
            };

            $scope.remVariant = function(question, variant) {
                question.maxPoints -= variant.points;
                question.variants.splice(question.variants.indexOf(variant), 1);
            };

            var StatExists = $resource('/statistics/questionnaire/:questionnaire', {
                questionnaire: '@questionnaire'
            });

            var commitViewChange = function(questionnaire) {
              $scope.activeQuestion = null;
              $scope.currentQuestionIndex = null;
              $scope.activeQuestionnaire = angular.copy(questionnaire);
              $scope.originalQuestionnaire = angular.copy($scope.activeQuestionnaire);
              $scope.currentIndex = $scope.questionnaires.indexOf(questionnaire);
              $scope.loadingInner = true;
              StatExists.query({
                  questionnaire: questionnaire._id
              }).$promise.then(
                function(success) {
                  $scope.loadingInner = false;
                  if(success.length > 0) {
                    $scope.isEditable = true;
                  } else {
                    $scope.isEditable = false;
                  }
                });
            };

            $scope.view = function(questionnaire, $event) {
                if (JSON.stringify($scope.originalQuestionnaire) !== JSON.stringify(questionnaire)) {
                    if (JSON.stringify($scope.activeQuestionnaire) === JSON.stringify($scope.originalQuestionnaire)) {
                        commitViewChange(questionnaire);
                    } else {
                        var confirm = $mdDialog.confirm()
                            .title('Kas olete kindel?')
                            .textContent('Teil on muudatused mis on salvestamata, kas kustutame või tahate jääda lehele?')
                            .ariaLabel('Kas olete kindel')
                            .targetEvent($event)
                            .ok('Jah, kustuta')
                            .cancel('Ei, ära kustuta');
                        $mdDialog.show(confirm).then(function() {
                            commitViewChange(questionnaire);
                        });
                    }
                }
            };

            $scope.viewQuestion = function(question) {
                $scope.currentQuestionIndex = $scope.activeQuestionnaire.questions.indexOf(question);
                $scope.activeQuestion = angular.copy(question);
            };

            $scope.create = function($event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/questionnaire_create.html',
                    locals: {
                        author: $scope.service.currentUser,
                        questionnaires: $scope.questionnaires,
                        save: $scope.save
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, questionnaires, save, author) {
                    $scope.questionnaire = {};
                    $scope.questionnaires = questionnaires;
                    $scope.question = {};
                    $scope.questionnaire.questions = [];
                    $scope.question.variants = [];
                    $scope.questionnaire.totalPoints = 0;
                    $scope.question.maxPoints = 0;

                    $scope.addVariant = function(question, variant) {
                        $scope.question.variants.push(angular.copy(variant));
                        $scope.question.maxPoints += variant.points;
                    };

                    $scope.remVariant = function(question, variant) {
                        $scope.question.maxPoints -= variant.points;
                        $scope.question.variants.splice(question.variants.indexOf(variant), 1);
                    };

                    $scope.clear = function() {
                        $scope.question.variants = [];
                        $scope.question.maxPoints = 0;
                    };

                    $scope.addQuestion = function(question) {
                        $scope.questionnaire.questions.push(angular.copy(question));
                        $scope.questionnaire.totalPoints += question.maxPoints;
                    };

                    $scope.remQuestion = function(question) {
                        $scope.questionnaire.questions.splice($scope.questionnaire.questions.indexOf(question), 1);
                        $scope.questionnaire.totalPoints -= question.maxPoints;
                    };

                    $scope.create = function(item) {
                        $mdDialog.hide();
                        item.author = author._id;
                        item.createdDate = Date.now();
                        item.saved = Date.now();
                        save(item);
                    };

                    $scope.close = function() {
                        $mdDialog.hide();
                    };
                }
            };

            $scope.clear = function(question) {
                question.variants = [];
                question.maxPoints = 0;
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
