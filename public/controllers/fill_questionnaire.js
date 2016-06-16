(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillQuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', '$interval', '$mdDialog', '$location', function($scope, QuestionnaireService, AuthenticateService, $interval, $mdDialog, $location) {
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

            $scope.confirm = function(address, $event) {
                var confirm = $mdDialog.confirm()
                    .title('Kas olete kindel?')
                    .textContent('Edasi liikudes hakkab aeg käima ja algab küsimustiku täitmine.')
                    .ariaLabel('Kas olete kindel')
                    .targetEvent($event)
                    .ok('Jah, alustan')
                    .cancel('Ei, mõtlesin ümber');
                $mdDialog.show(confirm).then(function() {
                    $location.path("/fill/" + address);

                });
            };
        }]);
}());
