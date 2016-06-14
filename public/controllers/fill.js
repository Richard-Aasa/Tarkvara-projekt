(function() {
    'use strict';

    angular
        .module('app')
        .controller('FillController', ['$scope','QuestionnaireService','$interval', '$mdDialog', function($scope, QuestionnaireService, $interval, $mdDialog) {
			
			$scope.questionnaires = [];
			$scope.questionnaire = {};
			
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
                }, {
                    title: "kolmas",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }, {
                    title: "ssd",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }, {
                    title: "hgfh",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }, {
                    title: "khj",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }, {
                    title: "kollöklömas",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }, {
                    title: "u8",
                    type: "Tühi lünk",
                    variants: "mida asdf",
                    maxPoints: 122
                }],
                totalTime: 30
            };

            $scope.loading = true;
            $scope.activeQuestion = {};
            //$scope.activeQuestion = $scope.questionnaire[0].questions[0];
            $scope.arrayOfItems = [];
			$scope.allQuestionsFilled = false;
			$scope.filledQuestion = [];
						
			QuestionnaireService.query()
			/*	.$promise.then(
					function(data) {
                        $scope.questionnaires = data;
                        $scope.loading = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
            $scope.questionnaire = $scope.questionnaires[0];
			console.log($scope.questionnaire);*/

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
              $scope.activeQuestion = item;
			  
			  if(!$scope.activeQuestion){
				  return;
			  }
			  
              $scope.measureTime($scope.activeQuestion.title, $scope.questionStartTime, $scope.questionEndTime);
              $scope.questionStartTime = Date.now();
              if($scope.arrayOfItems == null){
				  $scope.arrayOfItems = [];
			  }
	
            };
			//htmlis nupule järgmine vajutades läheb tööle submit funktsioon, mis paneb kirja kasutaja sisestatud andmed küsimustikus ja laeb järgmise küsimuse. lisaks ka see kontrollib kas kõik küsimused on täidetud.
			$scope.submit = function(answer, question){
				
				
				var index = $scope.questionnaire.questions.indexOf(question);
				console.log(index);
				
				if($scope.questionnaire.questions[index].type == "Tühi lünk" && $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)]){
					answer = $scope.filledQuestion[$scope.questionnaire.questions.indexOf($scope.activeQuestion)].variants;
				}
				
				var len = $scope.questionnaire.questions.length;
				var vastused = {
					id: index+"mongoID",
					type: $scope.questionnaire.questions[index].type,
					variants: answer
				};
				console.log(answer);
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
				console.log(answer);
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
              //console.log($scope.allQuestionsTime);
            };
			
			$scope.save = function(){
				//suhtleb serveriga
				console.log($scope.filledQuestion);
				/*var newStat = new StatisticsService({
					
				});*/
				
			}
		}]);
}());
