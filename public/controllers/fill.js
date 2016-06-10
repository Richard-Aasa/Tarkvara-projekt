(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillController', ['$scope', '$mdDialog', function($scope, $mdDialog) {
            $scope.questionnaire = {
                title: "asd",
                questions: [{
                    title: "esimene",
                    type: "Valik",
                    variants: [{
                        answer: "vasts",
                        points: 123,
                        bool: true
                    }, {
                        answer: "asd",
                        points: 1234,
                        bool: false
                    }],
                    maxPoints: 12
                }, {
                    title: "teine",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }]
            };
            $scope.loading = true;
            $scope.activeQuestion = {};

            $scope.view = function(item){
              $scope.activeQuestion = item;
              console.log($scope.activeQuestion);
            };

            $scope.save = function(item){
              
            };

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
