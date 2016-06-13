(function() {
    'use strict';

    angular
        .module('app')
        .controller('StatController', ['$scope', '$mdDialog', function($scope, $mdDialog) {

            $scope.loading = true;
            $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  


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
