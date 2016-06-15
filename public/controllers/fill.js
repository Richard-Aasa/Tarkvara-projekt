(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillController', ['$scope','$routeParams','QuestionnaireService','StatisticsService','AuthenticateService','$interval', '$mdDialog', function($scope, $routeParams, QuestionnaireService, StatisticsService, AuthenticateService, $interval, $mdDialog) {
			$scope.questionnaire = {};
			$scope.service = AuthenticateService;
			var questionnaireId = $routeParams.id;
			//serverist laeb sisse andmeid siin, kui tahad mõnda fill lehte näha siis hetkel on üks töötav lehekülg siuke http://localhost:3000/#/fill/5760fe03770de90984b36410 see pikk number on ühe questionnaire _id
			QuestionnaireService.get({id: questionnaireId}, function() {
				}).$promise.then(
				function(response){
					console.log(response);
					$scope.questionnaire = response;
					$scope.questionnaireStartTime = Date.now();
					$scope.questionnaireEndTime = $scope.questionnaireStartTime + ($scope.questionnaire.totalTime * 60000);
				},
				function(error) {
                        console.log(error);
                }
			);
            $scope.loading = true;
            $scope.activeQuestion = {};
            //$scope.activeQuestion = $scope.questionnaire.questions[0];
            $scope.arrayOfItems = [];
			$scope.allQuestionsFilled = false;
			$scope.filledQuestion = [];
			var insertedServerQuestions = [];

            //tervet küsimustikku puudutav aeg
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
              $scope.activeQuestion = item;
			  
			  if(!$scope.activeQuestion){
				  return;
			  }
			  
              $scope.measureTime($scope.activeQuestion._id, $scope.questionStartTime, $scope.questionEndTime);
              $scope.questionStartTime = Date.now();
              if($scope.arrayOfItems == null){
				  $scope.arrayOfItems = [];
			  }
	
            };
			//htmlis nupule järgmine vajutades läheb tööle submit funktsioon, mis paneb kirja kasutaja sisestatud andmed küsimustikus ja laeb järgmise küsimuse. lisaks ka see kontrollib kas kõik küsimused on täidetud.
			$scope.submit = function(answer, question){
				
				
				var index = $scope.questionnaire.questions.indexOf(question);
				console.log(question);
				var len = $scope.questionnaire.questions.length;
				var varLen = $scope.questionnaire.questions[index].variants.length;
				var isAnswerCorrect = false;
				
				if($scope.questionnaire.questions[index].type == "Tühi lünk" && $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)]){
					answer = $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)].variants;
				}
				//see jupp siis kontrollib kas sisestatud vastused on õiged
				for(var i=0; i<varLen; i++){
					if(varLen > 1){
						if($scope.questionnaire.questions[index].variants[i].bool == answer[i]){
							isAnswerCorrect = true;
						}else{
							isAnswerCorrect = false;
							break;
						}
					}else{
						if(typeof answer != "undefined"){
							if($scope.questionnaire.questions[index].variants[0].toLowerCase() == answer.toLowerCase()){
								isAnswerCorrect = true;
							}							
						}
					}
				}
				
				var vastused = {
					id: index+"mongoID",
					type: $scope.questionnaire.questions[index].type,
					variants: answer,
					correct: isAnswerCorrect
				};
				var check = false;
				
				if($scope.filledQuestion[index]){
					$scope.filledQuestion[index] = vastused;
					check = true;
				}
				
				if(check == false){
					$scope.filledQuestion[index] = vastused;
				}
				//kontrolli veel kas sellisele küsimusele on juba vastatud.				
				console.log($scope.filledQuestion);
				$('.listItem')[index].className += " passedLi";
				
				var real_len = 0;
				
				for(var i = 0; i < $scope.filledQuestion.length; i++){
					if($scope.filledQuestion[i]){
						real_len++;
					}
				}
				
				if(real_len!=len){
					$scope.view($scope.questionnaire.questions[index+1]);
				}else{
					$scope.allQuestionsFilled = true;
				}
			}
            //mõõdab üehele küsimusele kulunud aega ja lisab kõik massiivi
            $scope.measureTime = function(questionId, start, end){
              var questionTotalTime = {};
              questionTotalTime._id = questionId;
              questionTotalTime.time = end - start;
              var check = false;
              for(var i = 0; i < $scope.allQuestionsTime.length; i++){
                if($scope.allQuestionsTime[i]._id == questionTotalTime._id){
                  $scope.allQuestionsTime[i].totalTime += questionTotalTime.time;
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
				//oleks vaja lisada funktsioon mis arvutab kokku punktid, aja jms
				for(var i = 0; i < $scope.allQuestionsTime.length; i++){
					var questionVars = {
						_id: 0,
						totalTime: { type: Number, required: true },
						points: { type: Number, required: true },
						correct: Boolean
					};
					
					insertedServerQuestions.push(questionVars);
				}
				
				console.log($scope.filledQuestion);
				var newStat = new StatisticsService({
                    questionnaire: questionnaireId,
                    user: $scope.service.currentUser._id,
					questions: insertedServerQuestions,
					userTime: {type: Number, required: true},
					userPoints: {type: Number, required: true}
                });

                newStat.$save()
                    .then(
                        function(data) {
                            showToast('Küsimustik täidetud: ' + questionnaire.title);
                        },
                        function(error) {
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );				
			}
		}]);
}());
