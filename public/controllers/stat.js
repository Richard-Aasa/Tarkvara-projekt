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
                user: 8,
                fillDate: "14-06-2016",
                questions: [{
                    totalTime: 1,
                    points: 1,
                    correct: true
                }, {
                    totalTime: 1,
                    points: 1,
                    correct: false
                }, {
                    totalTime: 1,
                    points: 1,
                    correct: true
                },
                ],
                userTime: 60,
                userPoints: 40
            }, {
                questionnaire: 1,
                user: 7,
                fillDate: "14-06-2016",
                questions: [{
                    totalTime: 3,
                    points: 10,
                    correct: true
                }, {
                    totalTime: 10,
                    points: 5,
                    correct: false
                }, {
                    totalTime: 8,
                    points: 7,
                    correct: true
                }],
                userTime: 60,
                userPoints: 40
            }, {
                questionnaire: 1,
                user: 7,
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
                totalTime: 200,
                totalPoints: 30
            };

            //abifunktsioon punktide kokkulisamiseks
            $scope.sumPoints = function(statistics, i) {
                var tempResult = 0;
                for (var k = 0; k < statistics[i].questions.length; k++) {
                    tempResult += statistics[i].questions[k].points;
                }
                return tempResult;
            };

            //funktsioon, mis paneb kõik kasutajad ühte massiivi ja mis paneb kõik nende tulemused ühte massiivi
            //kui üks kasutaja on teinud testi mitu korda, siis pannakse massivi ta ainult üks kord
            //ja sellisel juhul pannakse massiivi samuti kasutaja viimane tulemus
            $scope.addResultsChartOne = function(statistics) {
                var allNames = [];
                var allResults = [];
                for (var i = 0; i < statistics.length; i++) {
                    var check = false;
                    for (var j = 0; j < allNames.length; j++) {
                        if (allNames[j] === statistics[i].user) {
                            allResults[j] = $scope.sumPoints(statistics, i);
                            check = true;
                            break;
                        }
                    }
                    if (check === false) {
                        allNames.push(statistics[i].user);
                        allResults.push($scope.sumPoints(statistics, i));
                    }
                }
                var both = [allNames, allResults];
                return both;
            };

            $scope.addResultsChartTwo = function(statistics) {
                var allTimes = [];
                for (var i = 0; i < statistics[0].questions.length; i++) {
                    var temp = {};
                    var tempNames = [];
                    temp.name = (i + 1).toString() + " küsimus";
                    temp.data = [];
                    for (var j = 0; j < statistics.length; j++) {
                        var check = false;
                        for (var k = 0; k < tempNames.length; k++) {
                            if (tempNames[k] === statistics[j].user) {
                                temp.data[k] = statistics[j].questions[i].totalTime;
                                check = true;
                                break;
                            }
                        }
                        if (check === false) {
                            temp.data.push(statistics[j].questions[i].totalTime);
                        }
                        tempNames.push(statistics[j].user);
                        //if (statistics[j].questions[i] !== undefined)
                    }
                    allTimes.push(temp);
                }
                return allTimes;
            };

            //diagramm, mis kuvab kõikide kasutajate punktid, mis nad said terve küsimustiku eest
            $scope.chartPoints = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: "Punktid kokku"
                },
                xAxis: {
                    categories: $scope.addResultsChartOne($scope.statistics)[0]
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
                    data: $scope.addResultsChartOne($scope.statistics)[1]
                }]
            };

            $scope.chartTime = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: "Aeg kokku"
                },
                xAxis: {
                    categories: $scope.addResultsChartOne($scope.statistics)[0]
                },
                yAxis: {
                    allowDecimals: false,
                    reversedStacks: false,
                    title: {
                        text: null
                    },
                    min: 0,
                    max: $scope.questionnaire.totalTime
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                series: $scope.addResultsChartTwo($scope.statistics)
            };

        }]);
}());
