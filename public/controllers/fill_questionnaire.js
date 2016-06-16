(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillQuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', 'StatisticsUserService', '$interval', '$mdDialog', '$location', function($scope, QuestionnaireService, AuthenticateService, StatisticsUserService, $interval, $mdDialog, $location) {
            $scope.questionnaires = [];
            $scope.loading = false;
            $scope.results = [];
            $scope.service = AuthenticateService;
            QuestionnaireService.query()
                .$promise.then(
                    function(data) {
                        $scope.questionnaires = data;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
            StatisticsUserService.get({
                user: $scope.service.currentUser._id
            }, function() {}).$promise.then(
                function(response) {
                    $scope.results = response;
                    $scope.loading = false;
                    console.log(response);
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
