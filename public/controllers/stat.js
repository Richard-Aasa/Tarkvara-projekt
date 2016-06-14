(function() {
    'use strict';

    angular
        .module('app')
        .controller('StatController', ['$scope', '$mdDialog', function($scope, $mdDialog) {

            $scope.loading = true;
            



            // WORKS

            // QuestionnaireService.query()
            //     .$promise.then(
            //         function(data) {
            //             console.log(data);
            //             $scope.questionnaire = data;
            //             $scope.loading = false;
            //         },
            //         function(error) {
            //             console.log(error);
            //         }
            //     );



        }]);
}());
