(function() {
    'use strict';

    angular
        .module('app')
        .directive('hcChart', function() {
            return {
                restrict: 'E',
                template: '<div></div>',
                scope: {
                    options: '='
                },
                link: function(scope, element) {
                    Highcharts.chart(element[0], scope.options);
                }
            };
        })
        .controller('StatController', ['$scope', '$mdDialog', function($scope, $mdDialog) {

            $scope.loading = false;

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

            //statistika ühe küsimuse kohta, nt küsimuse id on 1
            $scope.statistics = [{
                questionnaire: 1,
                user: 2,
                fillDate: "14-06-2016",
                questions: [{
                    totalTime: 20,
                    points: 2,
                    correct: true
                }, {
                    totalTime: 10,
                    points: 5,
                    correct: false
                }, {
                    totalTime: 30,
                    points: 5,
                    correct: true
                }],
                userTime: 60,
                userPoints: 40
            },
            {
                questionnaire: 1,
                user: 3,
                fillDate: "14-06-2016",
                questions: [{
                    totalTime: 20,
                    points: 1,
                    correct: true
                }, {
                    totalTime: 10,
                    points: 5,
                    correct: false
                }, {
                    totalTime: 30,
                    points: 7,
                    correct: true
                }],
                userTime: 60,
                userPoints: 40
            },
            {
                questionnaire: 1,
                user: 4,
                fillDate: "14-06-2016",
                questions: [{
                    totalTime: 20,
                    points: 3,
                    correct: true
                }, {
                    totalTime: 10,
                    points: 5,
                    correct: false
                }, {
                    totalTime: 30,
                    points: 7,
                    correct: true
                }],
                userTime: 60,
                userPoints: 40
            }];

            $scope.questionnaire = {
                title: "Ajalugu",
                questions: [{
                    title: "Kes on kass?",
                    type: "Tühi lünk",
                    maxPoints: 10
                }, {
                    title: "Kes on koer?",
                    type: "Tühi lünk",
                    maxPoints: 10
                }, {
                    title: "Kes on kana?",
                    type: "Tühi lünk",
                    maxPoints: 10
                }],
                totalTime: 30,
                totalPoints: 30
            };

            //funktsioon, mis paneb kõik kasutajad ühte massiivi
            $scope.addNames = function(statistics){
              var allNames = [];
              for(var i = 0; i < statistics.length; i++){
                allNames.push(statistics[i].user);
              }
              return allNames;
            };

            //funktsioon, mis paneb kõik tulemused ühte massiivi
            $scope.addResults = function(statistics){
              var allResults = [];
              for(var i = 0; i < statistics.length; i++){
                var tempResult = 0;
                for(var j = 0; j < statistics[i].questions.length; j++){
                  tempResult += statistics[i].questions[j].points;
                }
                allResults.push(tempResult);
              }
              return allResults;
            };

            //diagramm, mis kuvab kõikide kasutajate punktid, mis nad said terve küsimustiku eest
            $scope.chartOptions = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: "Punktid kokku"
                },
                xAxis: {
                    categories: $scope.addNames($scope.statistics)
                },
                yAxis: {
                    allowDecimals: false,
                    title: {
                        text: null
                    },
                    min: 0,
                    max: $scope.questionnaire.totalPoints
                },
                series: [{
                    data: $scope.addResults($scope.statistics)
                }]
            };






        }]);
}());
