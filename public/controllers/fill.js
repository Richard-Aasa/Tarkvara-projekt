(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillController', ['$scope', '$routeParams', 'QuestionnaireService', 'StatisticsService', 'AuthenticateService', '$interval', '$mdToast', '$mdDialog', function($scope, $routeParams, QuestionnaireService, StatisticsService, AuthenticateService, $interval, $mdToast, $mdDialog) {
            $scope.service = AuthenticateService;
            $scope.loading = true;
            $scope.allQuestionsFilled = false;
            $scope.confirm = false;
            $scope.filledQuestion = [];
            $scope.submittedQuestion = [];
            $scope.answers = [];
            $scope.currentIndex = 0;

            // Saab kätte parameetrid addressi ribalt
            var questionnaireId = $routeParams.id;

            // Saab kätte küsimustiku, kui käes, algab timer, valitakse aktiivne küsimus, algväärtustatakse küsimustik ja vastused
            QuestionnaireService.get({
                id: questionnaireId
            }).$promise.then(
                function(response) {
                    $scope.questionnaire = response;
                    for (var question in $scope.questionnaire.questions) {
                        $scope.filledQuestion.push({
                            totalTime: 0,
                            points: 0,
                            correct: false
                        });
                    }
                    $scope.questionnaireStartTime = Date.now();
                    $scope.questionnaireEndTime = $scope.questionnaireStartTime + ($scope.questionnaire.totalTime * 60000);
                    $scope.activeQuestion = $scope.questionnaire.questions[0];
                    $scope.questionStartTime = Date.now();
                    var stop = $interval(function() {
                        $scope.questionnaireLeftTime = $scope.questionnaireEndTime - Date.now();
                        if ($scope.questionnaireLeftTime <= 0) {
                            $interval.cancel(stop);
                            $scope.save();
                        } else if ($scope.confirm) {
                            $interval.cancel(stop);
                        }
                    }, 100);
                    $scope.loading = false;
                },
                function(error) {
                    console.log(error);
                }
            );


            // Mõõdab aega, mis tervele testile kulub, st countdown, kui countdown = 0, siis lõpetab testi ja salvestab olemasoleva info andmebaasi
            // http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
            $scope.displayRemainingTime = function(millisec) {
                var seconds = (millisec / 1000).toFixed(0);
                var minutes = Math.floor(seconds / 60);
                var hours = "";
                if (minutes > 59) {
                    hours = Math.floor(minutes / 60);
                    hours = (hours >= 10) ? hours : "0" + hours;
                    minutes = minutes - (hours * 60);
                    minutes = (minutes >= 10) ? minutes : "0" + minutes;
                }
                seconds = Math.floor(seconds % 60);
                seconds = (seconds >= 10) ? seconds : "0" + seconds;
                if (hours !== "") {
                    return hours + ":" + minutes + ":" + seconds;
                }
                return minutes + ":" + seconds;
            };

            // Lisab statistika objekti kulunud aja
            var measureTime = function(question, start, end) {
                var index = $scope.questionnaire.questions.indexOf(question);
                $scope.filledQuestion[index].totalTime += end - start;
            }


            // Uue küsimuse selekteerimine
            $scope.view = function(item) {
                // Lisa praegusele elemendile aega juurde
                measureTime($scope.activeQuestion, $scope.questionStartTime, Date.now());
                // Muuda aktiivne element ja alusta timer vahetuse hetkest
                $scope.currentIndex = $scope.questionnaire.questions.indexOf(item);
                $scope.activeQuestion = item;
                $scope.questionStartTime = Date.now();
            };

            // HTML nupule "Vasta küsimusele" vajutades läheb tööle submit funktsioon, mis paneb kirja kasutaja sisestatud andmed küsimustikus ja laeb järgmise küsimuse. lisaks ka see kontrollib kas kõik küsimused on täidetud.
            $scope.submit = function(question) {
                var index = $scope.questionnaire.questions.indexOf(question);

                // Funktsioon mis loob vastuse elemendi vastavalt lahtrite sisule
                var setFilledQuestion = function(bool) {
                    $scope.filledQuestion[index].correct = bool;
                    if (bool) {
                        $scope.filledQuestion[index].points = question.maxPoints;
                    } else {
                        $scope.filledQuestion[index].points = 0;
                    }
                }

                // Kui tühi lünk, vaata kas vastus on õige ja täida siis vastuse objekt
                if (question.type == "Tühi lünk") {
                    if (typeof $scope.answers[index] !== "undefined" && $scope.answers[index] !== null) {
                        if ($scope.questionnaire.questions[index].variants[0].toLowerCase() == $scope.answers[index].toLowerCase()) {
                            setFilledQuestion(true);
                        } else {
                            setFilledQuestion(false);
                        }
                    } else {
                        // Peab 'null' panema sest 'undefined' ei suurenda massiivi aga 'null' suurendab
                        $scope.answers[index] = null;
                        setFilledQuestion(false);
                    }

                    // Sama loogika ainult seekord valik tüüpi küsimustele
                } else if (question.type == "Valik") {
                    if (typeof $scope.answers[index] === "undefined") {
                      setFilledQuestion(false);
                    } else {
                      for (var i = 0; i < question.variants.length; i++) {
                          if (typeof $scope.answers[index].answer[i] === "undefined") {
                            $scope.answers[index].answer[i] = false;
                          }
                          // Kui leidub vähemalt üks valikvastuse väärtus, mille korral on valik vale, on terve küsimus vastatud valesti
                          if ($scope.answers[index].answer[i] !== question.variants[i].bool) {
                              setFilledQuestion(false);
                              break;
                          } else {
                              setFilledQuestion(true);
                          }
                      }
                    }
                }

                // Kontroll selleks, et näha mis küsimustele on vastatud
                $scope.submittedQuestion[index] = true;

                // Kõikidele küsimustele on korra vastatud
                $scope.allQuestionsFilled = true;
                $scope.questionnaire.questions.forEach(function(currentValue,iterator) {
                  if (!$scope.submittedQuestion[iterator]) {
                    $scope.allQuestionsFilled = false;
                  }
                });

                // Kuvame uue küsimuse
                if (index < $scope.questionnaire.questions.length - 1) {
                    $scope.view($scope.questionnaire.questions[index + 1]);
                }

            };

            $scope.save = function() {
                measureTime($scope.activeQuestion, $scope.questionStartTime, Date.now());

                // Suhtleb serveriga
                var totalPoints = 0;
                var allTime = 0;

                for (var i = 0; i < $scope.filledQuestion.length; i++) {
                    totalPoints += $scope.filledQuestion[i].points;
                    allTime += $scope.filledQuestion[i].totalTime;

                }
                var newStat = new StatisticsService({
                    questionnaire: questionnaireId,
                    user: $scope.service.currentUser._id,
                    questions: $scope.filledQuestion,
                    userTime: allTime,
                    userPoints: totalPoints
                });
                newStat.$save()
                    .then(
                        function(data) {
                            $scope.confirm = true;
                            $scope.resultsDialog(data);
                        },
                        function(error) {
                            showToast('Midagi läks valesti.');
                            console.log(error.status + ' ' + error.statusText);
                        }
                    );
            };

            $scope.resultsDialog = function(data, $event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    templateUrl: 'views/fill_results.html',
                    locals: {
                        questionnaire: $scope.questionnaire,
                        userName: $scope.service.currentUser.name,
                        displayRemainingTime : $scope.displayRemainingTime
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, $location, questionnaire, userName, displayRemainingTime) {
                    $scope.resultObject = data;
                    $scope.resultObject.userTime = displayRemainingTime($scope.resultObject.userTime);
                    $scope.questionnaire = questionnaire;
                    $scope.userName = userName;
                    $scope.return = function() {
                        $mdDialog.hide();
                        $location.path('/fill_questionnaire');
                    };
                }
            };

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
