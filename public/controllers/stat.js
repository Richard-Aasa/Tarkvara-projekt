(function() {
    'use strict';

    angular
        .module('app')
        .controller('StatController', ['$scope', '$resource', 'StatisticsService', 'UserService', '$mdDialog', function($scope, $resource, StatisticsService, UserService, $mdDialog) {

            $scope.loading1 = true;
            $scope.loading2 = true;
            $scope.loading3 = true;
            $scope.show = false;
            $scope.questionnaires = [];
            $scope.questionnaire = {};
            $scope.currentIndex = 0;
            $scope.allStatistics = [];
            $scope.users = [];
            $scope.statistics = [];
            $scope.dataOfUserTimes = [];
            $scope.both1 = [];
            $scope.both2 = [];
            var QuestionnaireByAuthor = $resource('/questionnaire/author/:author', {
                author: '@author'
            });
            QuestionnaireByAuthor.query({
                author: $scope.service.currentUser._id
            }).$promise.then(
                function(data) {
                    data.sort(function(a, b) {
                        var textA = a.title.toUpperCase();
                        var textB = b.title.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                    $scope.questionnaires = data;
                    $scope.loading1 = false;
                },
                function(error) {
                    console.log(error);
                }
            );
            StatisticsService.query()
                .$promise.then(
                    function(data) {
                        console.log(data);
                        $scope.allStatistics = data;
                        $scope.loading2 = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );

            UserService.query()
                .$promise.then(
                    function(data) {
                        console.log(data);
                        $scope.users = data;
                        $scope.loading3 = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );

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
                var activeUser;
                console.log($scope.users);
                for (var i = 0; i < statistics.length; i++) {
                    for (var k = 0; k < $scope.users.length; k++) {
                        if ($scope.users[k]._id == statistics[i].user) {
                            activeUser = $scope.users[k].name;
                        }
                    }
                    /*var userIndex = $scope.users.indexOf(statistics[i].user);
					var randObject = $scope.users.indexOf($scope.users[0]);
                    console.log(randObject);
					console.log($scope.users[0]);
					console.log(statistics[i].user);*/
                    var check = false;
                    for (var j = 0; j < allNames.length; j++) {
                        if (allNames[j] == activeUser) {
                            allResults[j] = $scope.sumPoints(statistics, i);
                            check = true;
                            break;
                        }
                    }
                    if (check === false) {
                        allNames.push(activeUser);
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
                    temp.name = $scope.questionnaire.questions[i].title;
                    temp.data = [];
                    for (var j = 0; j < statistics.length; j++) {
                        var check = false;
                        //console.log(statistics[j].questions[i].totalTime);
                        for (var k = 0; k < tempNames.length; k++) {
                            try {
                                if (tempNames[k] === statistics[j].user) {
                                    temp.data[k] = statistics[j].questions[i].totalTime / 1000;
                                    check = true;
                                    break;
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        if (check === false) {
                            try {
                                temp.data.push(statistics[j].questions[i].totalTime / 1000);
                            } catch (err) {
                                console.log(err);
                            }
                        }
                        tempNames.push(statistics[j].user);
                    }
                    allTimes.push(temp);
                }
                return allTimes;
            };

            $scope.addResultsChartThree = function(data) {
                var allTimes = [];
                var allNames = [];
                for (var i = 0; i < data.length; i++) {
                    allTimes.push(data[i].data);
                    allNames.push(data[i].name);
                }
                var sortedTimes = [];
                for (var j = 0; j < allTimes.length; j++) {
                    var temp = [];
                    allTimes[j].sort(function(a, b) {
                        return a - b;
                    });
                    temp.push(Math.min.apply(null, allTimes[j]));
                    temp.push(ss.quantile(allTimes[j], 0.25));
                    temp.push(ss.quantile(allTimes[j], 0.5));
                    temp.push(ss.quantile(allTimes[j], 0.75));
                    temp.push(Math.max.apply(null, allTimes[j]));
                    sortedTimes.push(temp);
                }
                var allResults = [sortedTimes, allNames];
                return allResults;
            };

            $scope.view = function(index) {
                $scope.statistics = [];
                $scope.questionnaire = $scope.questionnaires[index];
                $scope.currentIndex = index;
                var exists = false;
                for (var i = 0; i < $scope.allStatistics.length; i++) {
                    if ($scope.allStatistics[i].questionnaire == $scope.questionnaire._id) {
                        $scope.statistics.push($scope.allStatistics[i]);
                        exists = true;
                    }
                }
                if (exists === false) {
                    alert("Seda küsimustikku pole veel keegi täitnud");
                    return;
                } else {
                    $scope.show = true;
                }
                $scope.both1 = $scope.addResultsChartOne($scope.statistics);

                $scope.chartUserPoints = {
                    options: {
                        chart: {
                            type: 'bar'
                        },
                        colors: [
                            '#88c474', '#37474f', '#c95d5d'
                        ]
                    },
                    title: {
                        text: 'Õpilaste punktid'
                    },
                    xAxis: {
                        categories: $scope.both1[0]
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
                        name: 'Punktid',
                        showInLegend: false,
                        data: $scope.both1[1]
                    }]
                };

                $scope.both2 = $scope.addResultsChartOne($scope.statistics);

                $scope.dataOfUserTimes = $scope.addResultsChartTwo($scope.statistics);
                $scope.chartUserTime = {
                    options: {
                        chart: {
                            type: 'bar'
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal'
                            }
                        },
                        colors: [
                            '#88c474', '#37474f', '#c95d5d'
                        ],
                    },
                    title: {
                        text: 'Õpilaste ajakulu'
                    },
                    xAxis: {
                        categories: $scope.both2[0]
                    },
                    yAxis: {
                        allowDecimals: false,
                        reversedStacks: false,
                        title: {
                            text: null
                        },
                        min: 0,
                        max: $scope.questionnaire.totalTime * 60
                    },
                    series: $scope.dataOfUserTimes
                };

                $scope.dataChartThree = $scope.addResultsChartThree($scope.dataOfUserTimes);

                console.log($scope.dataChartThree[1]);
                $scope.chartQuestionTime = {
                    options: {
                        chart: {
                            type: 'boxplot',
                            inverted: true
                        },
                        colors: [
                            '#88c474', '#37474f', '#c95d5d'
                        ]
                    },
                    title: {
                        text: 'Küsimuste ajakulu'
                    },
                    xAxis: {
                        categories: $scope.dataChartThree[1],
                        title: {
                            text: null
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        },
                        min: 0
                    },
                    series: [{
                        showInLegend: false,
                        data: $scope.dataChartThree[0],
                        tooltip: {
                            headerFormat: '<b>{point.key}</b><br/>'
                        },
                    }]
                };
            };


        }]);
}());
