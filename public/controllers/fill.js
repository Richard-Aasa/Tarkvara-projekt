(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillController', ['$scope','$interval', '$mdDialog', function($scope, $interval, $mdDialog) {
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
                    }, {
                        answer: "asdasdasd",
                        points: 12343,
                        bool: false
                    }],
                    maxPoints: 12
                }, {
                    title: "teine",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }],
                totalTime: 30
            };

            $scope.loading = true;
            $scope.activeQuestion = {};
            $scope.arrayOfItems = [];
            //tervet küsimustikku puudutav aeg
            $scope.questionnaireStartTime = Date.now();
            $scope.questionnaireEndTime = $scope.questionnaireStartTime + ($scope.questionnaire.totalTime * 60000);
            $scope.questionnaireLeftTime = 0;
            //üht konkreetset küsimust puudutav aeg
            $scope.questionStartTime = 0;
            $scope.questionEndTime = 0;
            $scope.allQuestionsTime = [];

            $interval(function () {
              $scope.questionnaireLeftTime = $scope.questionnaireEndTime - Date.now();
            }, 100);

            //http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
            $scope.displayRemainingTime = function(millisec) {
              var seconds = (millisec / 1000).toFixed(0);
              var minutes = Math.floor(seconds / 60);
              var hours = "";
              if(minutes > 59){
                hours = Math.floor(minutes / 60);
                hours = (hours >= 10) ? hours : "0" + hours;
                minutes = minutes - (hours * 60);
                minutes = (minutes >= 10) ? minutes : "0" + minutes;
              }
              seconds = Math.floor(seconds % 60);
              seconds = (seconds >= 10) ? seconds : "0" + seconds;
              if(hours !== ""){
                return hours + ":" + minutes + ":" + seconds;
              }
              return minutes + ":" + seconds;
            };

            $scope.view = function(item){
              $scope.questionEndTime = Date.now();
              $scope.measureTime($scope.activeQuestion.title, $scope.questionStartTime, $scope.questionEndTime);
              $scope.activeQuestion = item;
              $scope.questionStartTime = Date.now();
              $scope.arrayOfItems = [];
            };

            $scope.submit = function(answer, question){
              var totalTime = "";
              var points = 0;
              var correct = true;
              if(question.type == "Valik"){
                for(var i = 0; i < answer.length; i++){
                  if(question.variants[i].bool != answer[i]){
                    correct = false;
                    points = 0;
                    break;
                  }
                }
              }else{
                if(question.variants != answer){
                  correct = false;
                }
              }
              //siin kohas tuleb see info lükata andmebaasi
              console.log(correct);
            };

            //mõõdab üehele küsimusele kulunud aega
            $scope.measureTime = function(question, start, end){
              var questionTotalTime = {};
              questionTotalTime.title = question;
              questionTotalTime.time = end - start;
              //for(var i = 0; i < $scope.allQuestionsTime; i++){
              //  if($scope.allQuestionsTime[i]. == )
              //}
              $scope.allQuestionsTime.push(questionTotalTime);
              var asd = $scope.allQuestionsTime[3];
              console.log(asd);
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
