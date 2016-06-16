(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', '$mdToast', '$mdDialog', function($scope, QuestionnaireService, AuthenticateService, $mdToast, $mdDialog) {
            $scope.questionnaires = [];
            $scope.activeQuestionnaire = {};
            $scope.originalQuestionnaire = $scope.activeQuestionnaire;
            $scope.activeQuestion = {};
            $scope.currentQuestionIndex = {};
            $scope.currentIndex = 0;
            $scope.service = AuthenticateService;
            $scope.loading = true;

            QuestionnaireService.query()
                .$promise.then(
                    function(data) {
                        $scope.questionnaires = data;
                        $scope.activeQuestionnaire = angular.copy($scope.questionnaires[0]);
                        $scope.originalQuestionnaire = angular.copy($scope.questionnaires[0]);
                        $scope.loading = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
            $scope.save = function(questionnaire) {
                var newQuestionnaire = new QuestionnaireService({
                    title: questionnaire.title,
                    author: $scope.service.currentUser.name,
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
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };

            $scope.update = function(questionnaire) {
                questionnaire.saved = Date.now();
                $scope.originalQuestionnaire = questionnaire;
                questionnaire.$update().then(
                    function(data) {
                        showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
                        $scope.questionnaires[$scope.currentIndex] = angular.copy(questionnaire);
                    },
                    function(error) {
                        showToast(error.status + ' ' + error.statusText);
                    }
                );
            };

            $scope.delete = function(questionnaire) {
                $scope.questionnaires.splice($scope.currentIndex, 1);
                $scope.activeQuestionnaire = {};
                questionnaire.$delete()
                    .then(
                        function(data) {
                            showToast('Küsimustik edukalt kustutatud: ' + questionnaire.title);
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
                    $scope.activeQuestion = {};
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

            var commitViewChange = function(questionnaire) {
                $scope.activeQuestion = {};
                $scope.originalQuestionnaire = angular.copy(questionnaire);
                $scope.currentIndex = $scope.questionnaires.indexOf(questionnaire);
                $scope.activeQuestionnaire = angular.copy(questionnaire);
            }

            $scope.view = function(questionnaire, $event) {
              if(JSON.stringify($scope.originalQuestionnaire) !== JSON.stringify(questionnaire)) {
                if (JSON.stringify($scope.activeQuestionnaire) === JSON.stringify($scope.originalQuestionnaire)) {
                    commitViewChange(questionnaire);

                } else {
                  console.log($scope.activeQuestionnaire);
                  console.log($scope.originalQuestionnaire);
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
                        questionnaires: $scope.questionnaires,
                        save: $scope.save
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, questionnaires, save) {
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
