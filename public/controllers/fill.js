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
            $scope.activeQuestion = $scope.questionnaire.questions[1];
            $scope.arrayOfItems = [];
			$scope.allQuestionsFilled = false;
			$scope.filledQuestion = [{
				id: 0,
				type: "Valik",
				variants: null},{
				id: 0,
				type: "Tühi lünk",
				variants: null
				}];
            //tervet küsimustikku puudutav aeg
            $scope.questionnaireStartTime = Date.now();
            $scope.questionnaireEndTime = $scope.questionnaireStartTime + ($scope.questionnaire.totalTime * 60000);
            $scope.questionnaireLeftTime = 0;
            //üht konkreetset küsimust puudutav aeg
            $scope.questionStartTime = Date.now();
            $scope.questionEndTime = 0;
            //küsimustele kulunud aja massiiv
            $scope.allQuestionsTime = [];

            //mõõdab aega, mis tervele testile kulub, st countdown, kui countdown = 0, siis lõpetab testi ja salvestab olemasoleva info andmebaasi
            $interval(function () {
              $scope.questionnaireLeftTime = $scope.questionnaireEndTime - Date.now();
              if($scope.questionnaireLeftTime <= 0){
                //siia tuleb panna andmebaasi salvestamise käsklus
                //ja testi lõpetamise käsklus
              }
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
				var index = $scope.questionnaire.questions.indexOf(question);
				var len = $scope.questionnaire.questions.length;
				//$scope.filledQuestion[index].variants = [];

				$scope.filledQuestion[index].variants = answer;
				$scope.filledQuestion[index].id = index;
				$('.listItem')[index].className += " passedLi";
				//console.log($scope.filledQuestion);
				if(len!=index+1){
					$scope.view($scope.questionnaire.questions[index+1]);
				}else{
					$scope.allQuestionsFilled = true;
				}
				//console.log(index);
			}

            /*$scope.submit = function(answer, question){
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
            };*/

            //mõõdab üehele küsimusele kulunud aega ja lisab kõik massiivi
            $scope.measureTime = function(question, start, end){
              var questionTotalTime = {};
              questionTotalTime.title = question;
              questionTotalTime.time = end - start;
              var check = false;
              for(var i = 0; i < $scope.allQuestionsTime.length; i++){
                if($scope.allQuestionsTime[i].title == questionTotalTime.title){
                  $scope.allQuestionsTime[i].time += questionTotalTime.time;
                  check = true;
                  break;
                }
              }
              if(check === false){
                $scope.allQuestionsTime.push(questionTotalTime);
              }
              console.log($scope.allQuestionsTime);
            };

			$scope.save = function(){
				//suhtleb serveriga
				console.log($scope.filledQuestion);
				var newStat = new StatisticsService({

				});

			}

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
