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
            }
            $scope.remVariant = function(question, variant) {
                $scope.question.maxPoints -= variant.points;
                $scope.question.variants.splice(question.variants.indexOf(variant), 1);
            }
			//kustuta andmebaasist tegemisel!!!
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
							if($scope.question.type == "Valik"){
								if($scope.question.variants.length>1){
									showToast('Küsimus edukalt salvestatud: ' + question.title);
									console.log(data);																
									$scope.questions.push($scope.question);
									$scope.question = {};
								}else{
									showToast('Tüübi "Valik" puhul peab kasutama vähemalt kahte vastuse varianti.');
								}
							}else if($scope.question.type == "tyhihulk"){
								if($scope.question.variants.length == 1){
									showToast('Küsimus edukalt salvestatud: ' + question.title);
									console.log(data);																
									$scope.questions.push($scope.question);
									$scope.question = {};
								}else{
									showToast('Tüübi "Tühi lünk" puhul peab kasutama ainult ühte vastuse varianti.');
								}
							}
						},
						function(error) {
							showToast(error.status + ' ' + error.statusText);
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
