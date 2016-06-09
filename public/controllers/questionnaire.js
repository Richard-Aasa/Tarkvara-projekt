(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionnaireController', ['$scope', 'QuestionnaireService', '$mdToast', '$mdDialog', function($scope, QuestionnaireService, $mdToast, $mdDialog) {
            $scope.questionnaires = [];
            $scope.questionnaire = {};
			$scope.activeQuestionnaire = {};
            $scope.loading = true;

            // WORKS

            QuestionnaireService.query()
                .$promise.then(
                    function(data) {
                        console.log(data);
                        $scope.questionnaires = data;
                        $scope.loading = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );

			var pointCounter = function(questionnaire) {

				for(var question in questionnaire.questions){
					$scope.questionnaire.totalPoints += question.maxPoints;
				}

			};

            $scope.save = function(questionnaire) {
				pointCounter(questionnaire);
                var newQuestionnaire = new QuestionnaireService({
					title: questionnaire.title,
					author: "test",
					questions: questionnaire.questions,
					totalTime: questionnaire.totalTime,
					totalPoints: questionnaire.totalPoints,
					saved: questionnaire.saved,
					published: questionnaire.published,
					archieved: questionnaire.archived
                });

                newQuestionnaire.$save()
                    .then(
                        function(data) {
                            showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
                            $scope.questionnaires.push(questionnaire);
                            $scope.questionnaire = {};
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            };

			$scope.modify = function(questionnaire) {
				//$scope.modify.
			};

			$scope.view = function(questionnaire) {
				$scope.activeQuestionnaire = questionnaire;
				$scope.addQuestion = function(question) {
					$scope.questionnaire.questions.push(angular.copy(question));
					$scope.questionnaire.totalPoints += question.maxPoints;
				};
				$scope.remQuestion = function(question) {
					$scope.questionnaire.questions.splice($scope.questionnaire.questions.indexOf(question), 1);
					$scope.questionnaire.totalPoints -= question.maxPoints;
				};
			};

			$scope.create = function($event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/questionnaire_create.html',
                    locals: {
                        questionnaire: $scope.questionnaire,
                        questionnaires: $scope.questionnaires,
						save: $scope.save
                    },
                    controller: DialogController
                });
                function DialogController($scope, $mdDialog, questionnaire, questionnaires, save) {
					$scope.questionnaire = questionnaire;
					$scope.questionnaires = questionnaires;
					$scope.question = {};
					$scope.questionnaire.questions = [];
					$scope.question.variants = [];
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
                      console.log(item);
                      save(item);
                  };
                }
            };
            $scope.update = function(questionnaire) {
              $mdDialog.hide();
              var index = $scope.questionnaires.indexOf(question);

              if (questionnaire.id) {
                      return questionnaire.$update();
              } else {
                  return questionnaire.$create();
              }
            };
            /*$scope.clear = function() {
                $scope.question.variants = [];
                $scope.question.maxPoints = 0;
            };*/

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
