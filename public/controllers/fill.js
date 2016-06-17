(function() {
  'use strict';

  angular
    .module('app')
    .controller('FillController', ['$scope', '$routeParams', 'QuestionnaireService', 'StatisticsService', 'AuthenticateService', '$interval', '$mdToast', '$mdDialog', '$location', function($scope, $routeParams, QuestionnaireService, StatisticsService, AuthenticateService, $interval, $mdToast, $mdDialog, $location) {
      $scope.questionnaire = {};
      $scope.resultObject = {};
      $scope.activeQuestion = {};
      $scope.service = AuthenticateService;
      $scope.loading = true;

      var questionnaireId = $routeParams.id;
      //serverist laeb sisse andmeid siin, kui tahad mõnda fill lehte näha siis hetkel on üks töötav lehekülg siuke http://localhost:3000/#/fill/5760fe03770de90984b36410 see pikk number on ühe questionnaire _id
      QuestionnaireService.get({
        id: questionnaireId
      }, function() {}).$promise.then(
        function(response) {
          $scope.questionnaire = response;
          $scope.questionnaireStartTime = Date.now();
          $scope.questionnaireEndTime = $scope.questionnaireStartTime + ($scope.questionnaire.totalTime * 60000);
          $scope.activeQuestion = $scope.questionnaire.questions[0];
          $scope.loading = false;
        },
        function(error) {
          console.log(error);
        }
      );

      $scope.arrayOfItems = [];
      $scope.allQuestionsFilled = false;
      $scope.filledQuestion = [];
      var insertedServerQuestions = [];

      //tervet küsimustikku puudutav aeg
      $scope.questionnaireLeftTime = 9000000000000;
      //üht konkreetset küsimust puudutav aeg
      $scope.questionStartTime = Date.now();
      $scope.questionEndTime = 0;
      //küsimustele kulunud aja massiiv
      $scope.allQuestionsTime = [];


      //mõõdab aega, mis tervele testile kulub, st countdown, kui countdown = 0, siis lõpetab testi ja salvestab olemasoleva info andmebaasi
      var stop = $interval(function() {
        $scope.questionnaireLeftTime = $scope.questionnaireEndTime - Date.now();
        if ($scope.questionnaireLeftTime <= 0) {
          if ($scope.filledQuestion.length > 0) {
            $interval.cancel(stop);
            $scope.save();
          } else {
            $interval.cancel(stop);
            $location.path('/fill_questionnaire');
          }
        }
      }, 100);

      //http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
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

      $scope.view = function(item) {
        $scope.questionEndTime = Date.now();
        $scope.measureTime($scope.activeQuestion._id, $scope.questionStartTime, $scope.questionEndTime);
        $scope.activeQuestion = item;
        $scope.questionStartTime = Date.now();
        if ($scope.arrayOfItems !== null) {
          $scope.arrayOfItems = [];
        }

      };
      //htmlis nupule järgmine vajutades läheb tööle submit funktsioon, mis paneb kirja kasutaja sisestatud andmed küsimustikus ja laeb järgmise küsimuse. lisaks ka see kontrollib kas kõik küsimused on täidetud.
      $scope.submit = function(answer, question) {
        var index = $scope.questionnaire.questions.indexOf(question);
        var len = $scope.questionnaire.questions.length;
        var varLen = $scope.questionnaire.questions[index].variants.length;
        var isAnswerCorrect = false;
        var aqPoints;

        if ($scope.questionnaire.questions[index].type == "Tühi lünk" && $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)]) {
          answer = $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)].variants;
        }
        //see jupp siis kontrollib kas sisestatud vastused on õiged
        for (var i = 0; i < varLen; i++) {
          if (varLen > 1) {
            if ($scope.questionnaire.questions[index].variants[i].bool == answer[i]) {
              isAnswerCorrect = true;
            } else {
              isAnswerCorrect = false;
              break;
            }
          } else {
            if (typeof answer != "undefined") {
              if ($scope.questionnaire.questions[index].variants[0].toLowerCase() == answer.toLowerCase()) {
                isAnswerCorrect = true;
              } else {
                isAnswerCorrect = false;
              }
            }
          }
        }
        if (isAnswerCorrect === true) {
          aqPoints = $scope.questionnaire.questions[index].maxPoints;
        } else {
          aqPoints = 0;
        }

        var vastused = {
          id: $scope.questionnaire.questions[index]._id,
          type: $scope.questionnaire.questions[index].type,
          variants: answer,
          correct: isAnswerCorrect,
          points: aqPoints
        };
        var check = false;

        if ($scope.filledQuestion[index]) {
          $scope.filledQuestion[index] = vastused;
          check = true;
        }

        if (check === false) {
          $scope.filledQuestion[index] = vastused;
        }
        //kontrolli veel kas sellisele küsimusele on juba vastatud.
        $('.listItem')[index].className += " hall";

        var real_len = 0;

        for (i = 0; i < $scope.filledQuestion.length; i++) {
          if ($scope.filledQuestion[i]) {
            real_len++;
          }
        }

        if (real_len != len) {
          $scope.view($scope.questionnaire.questions[index + 1]);
        } else {
          $scope.allQuestionsFilled = true;
        }
      };
      //mõõdab üehele küsimusele kulunud aega ja lisab kõik massiivi
      $scope.measureTime = function(questionId, start, end) {
        var questionTotalTime = {};
        questionTotalTime._id = questionId;
        questionTotalTime.totalTime = end - start;
        var check = false;
        for (var i = 0; i < $scope.allQuestionsTime.length; i++) {
          if ($scope.allQuestionsTime[i]._id == questionTotalTime._id) {
            $scope.allQuestionsTime[i].totalTime += questionTotalTime.totalTime;
            check = true;
            break;
          }
        }
        if (check === false) {
          $scope.allQuestionsTime.push(questionTotalTime);

        }
        console.log($scope.allQuestionsTime);
      };

      $scope.save = function() {
        $scope.questionEndTime = Date.now();
        $scope.measureTime($scope.activeQuestion._id, $scope.questionStartTime, $scope.questionEndTime);
        //suhtleb serveriga
        //oleks vaja lisada funktsioon mis arvutab kokku punktid, aja jms
        var totalPoints = 0;
        var allTime = 0;

        for (var i = 0; i < $scope.allQuestionsTime.length; i++) {

          var questionVars = {
            //_id: $scope.allQuestionsTime[i]._id,
            totalTime: $scope.allQuestionsTime[i].totalTime,
            points: $scope.filledQuestion[i].points,
            correct: $scope.filledQuestion[i].correct
          };
          console.log($scope.allQuestionsTime[i]);
          totalPoints += $scope.filledQuestion[i].points;
          allTime += $scope.allQuestionsTime[i].totalTime;
          insertedServerQuestions.push(questionVars);
        }

        $scope.resultObject = {
          questionnaire: questionnaireId,
          user: $scope.service.currentUser.name,
          questions: insertedServerQuestions,
          userTime: allTime,
          userPoints: totalPoints
        };

        var newStat = new StatisticsService({
          questionnaire: questionnaireId,
          user: $scope.service.currentUser._id,
          questions: insertedServerQuestions,
          userTime: allTime,
          userPoints: totalPoints
        });

        newStat.$save()
          .then(
            function(data) {
              //showToast('Küsimustik täidetud: ' + $scope.questionnaire.title);
              $interval.cancel(stop);
              $scope.resultsDialog();
            },
            function(error) {
              showToast('Midagi läks valesti.');
              console.log(error.status + ' ' + error.statusText);
            }
          );
      };

      $scope.resultsDialog = function() {
        $mdDialog.show({
          parent: angular.element(document.body),
          //targetEvent: $event,
          templateUrl: 'views/fill_results.html',
          locals: {
            results: $scope.resultObject,
            questionnaire: $scope.questionnaire,
            userName: $scope.service.currentUser.name
          },
          controller: DialogController
        });

        function DialogController($scope, $mdDialog, results, questionnaire, userName) {

          $scope.resultObject = results;
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
