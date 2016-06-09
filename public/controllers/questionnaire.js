(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionnaireController', ['$scope', 'QuestionnaireService', '$mdToast', '$mdDialog', function($scope, QuestionnaireService, $mdToast, $mdDialog) {
            $scope.questionnaires = [];
            $scope.questionnaire = {};
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

			var pointCounter = function() {
				var points = 0;
				for(question in $scope.questionnaire.questions){
					points += $scope.questionaire.questions.maxPoints;
				}
				return points;
			};

            $scope.save = function(questionnaire) {

				var points = pointCounter(questionnaire);
                var newQuestionnaire = new QuestionnaireService({
					title: questionnaire.title,
					author: "test",
					questions: questionnaire.questions,
					totalTime: questionnaire.totalTime,
					totalPoints: points,
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
					$scope.addVariant = function(variant) {
						$scope.question.variants.push(angular.copy(variant));
							$scope.question.maxPoints += variant.points;
					};
					$scope.remVariant = function(variant) {
						$scope.question.maxPoints -= variant.points;
						$scope.question.variants.splice($scope.question.variants.indexOf(variant), 1);
					};
				  $scope.clear = function() {
					$scope.question.variants = [];
					$scope.question.maxPoints = 0;
				  };
				  $scope.addQuestion = function(question) {
					  $scope.questionnaire.totalPoints += question.maxPoints;
					  $scope.questionnaire.questions.push(question);
				  };
				  $scope.remQuestion = function(question) {
					  $scope.questionnaire.totalPoints -= question.maxPoints;
					  $scope.questionnaire.questions.splice($scope.questionnaire.questions.indexOf(question), 1);
				  };
                  $scope.create = function(item) {
                      $mdDialog.hide();
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
