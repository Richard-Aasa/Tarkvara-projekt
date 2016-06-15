(function() {
	'use strict';

	angular
        .module('app')
        .controller('FillQuestionnaireController', ['$scope','QuestionnaireService','AuthenticateService','$interval', '$mdDialog', function($scope, QuestionnaireService, AuthenticateService, $interval, $mdDialog) {
			$scope.questionnaires = [];
			$scope.loading = true;
			
			QuestionnaireService.query()
                .$promise.then(
                    function(data) {
                        $scope.questionnaires = data;
                        $scope.loading = false;
						console.log($scope.questionnaires);
                    },
                    function(error) {
                        console.log(error);
                    }
                );
		}]);
}());
