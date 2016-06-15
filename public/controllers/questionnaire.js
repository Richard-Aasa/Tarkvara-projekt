(function() {
  'use strict';

  angular
    .module('app')
    .controller('QuestionnaireController', ['$scope', 'QuestionnaireService', 'AuthenticateService', '$mdToast', '$mdDialog', function($scope, QuestionnaireService, AuthenticateService, $mdToast, $mdDialog) {
      $scope.questionnaires = [];
      $scope.questionnaire = {};
      $scope.activeQuestionnaire = {};
      $scope.activeQuestion = {};
      $scope.currentQuestionIndex = {};
      $scope.currentIndex = 0;
      $scope.service = AuthenticateService;
      $scope.loading = true;
      $scope.newQuestion = {};

      QuestionnaireService.query()
        .$promise.then(
          function(data) {
            $scope.questionnaires = data;
            $scope.loading = false;
          },
          function(error) {
            console.log(error);
          }
        );

      // Loeb küsimustiku punktid kokku
      var pointCounter = function(questionnaire) {
        questionnaire.totalPoints = 0;
        for (var question in questionnaire.questions) {
          questionnaire.totalPoints += question.maxPoints;
        }
      };

      // Korras!
      $scope.save = function(questionnaire) {
        pointCounter(questionnaire);

        var newQuestionnaire = new QuestionnaireService({
          title: questionnaire.title,
          author: $scope.service.currentUser.name,
          questions: questionnaire.questions,
          totalTime: questionnaire.totalTime,
          totalPoints: questionnaire.totalPoints,
          saved: questionnaire.saved,
          published: questionnaire.published,
          archieved: questionnaire.archived
        });

        newQuestionnaire.$save()
          .then(
            function(data) {
              showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
              $scope.questionnaires.push(questionnaire);
              $scope.questionnaire = {};
            },
            function(error) {
              showToast(error.status + ' ' + error.statusText);
            }
          );
      };

      // Korras!
      $scope.update = function(questionnaire) {

        questionnaire.$update().then(
          function(data) {
            showToast('Küsimustik edukalt salvestatud: ' + questionnaire.title);
            $scope.questionnaires[$scope.currentIndex] = angular.copy(questionnaire);
          },
          function(error) {
            showToast(error.status + ' ' + error.statusText);
          }
        );
      };

      // Korras!
      $scope.delete = function(questionnaire) {
        $scope.questionnaires.splice($scope.currentIndex, 1);
        $scope.activeQuestionnaire = {};
        questionnaire.$delete()
          .then(
            function(data) {
              showToast('Küsimustik edukalt kustutatud: ' + questionnaire.title);
            },
            function(error) {
              showToast(error.status + ' ' + error.statusText);
            }
          );
      };

      //Korras!
      $scope.addQuestion = function(question) {
        // Deep-copy on vajalik, vastasel juhul on kõik küsimused samad angular'i data-binding tõttu
        $scope.activeQuestionnaire.questions.push(angular.copy(question));
        $scope.activeQuestionnaire.totalPoints += question.maxPoints;
      };

      $scope.editQuestion = function(question) {
        $scope.activeQuestionnaire.totalPoints -= $scope.activeQuestionnaire.questions[$scope.currentQuestionIndex].maxPoints;
        $scope.activeQuestionnaire.questions[$scope.currentQuestionIndex] = angular.copy(question);
        $scope.activeQuestionnaire.totalPoints += question.maxPoints;
      };

      //Korras!
      $scope.remQuestion = function(question) {
        $scope.activeQuestionnaire.questions.splice($scope.activeQuestionnaire.questions.indexOf(question), 1);
        $scope.activeQuestionnaire.totalPoints -= question.maxPoints;
      };
      $scope.addVariant = function(question, variant) {
        console.log(question.variants);
        console.log(variant);
        question.variants.push(angular.copy(variant));
        question.maxPoints += variant.points;
      };

      $scope.remVariant = function(question, variant) {
        question.maxPoints -= variant.points;
        question.variants.splice(question.variants.indexOf(variant), 1);
      };
      $scope.view = function(questionnaire, $event) {
        var confirm = $mdDialog.confirm()
          .title('Kas olete kindel?')
          .textContent('Teil on muudatused mis on salvestamata, kas olete kindel, et tahate salvestamata liikuda järgmisele küsimustikule?')
          .ariaLabel('Kas olete kindel')
          .targetEvent($event)
          .ok('Jah, kustuta muudatused')
          .cancel('Ei, lase mul salvestada/muuta');
        $mdDialog.show(confirm).then(function() {
          $scope.activeQuestion = {};
          $scope.currentIndex = $scope.questionnaires.indexOf(questionnaire);
          $scope.activeQuestionnaire = angular.copy(questionnaire);
        }, function() {

        });
      };


      $scope.remove = function($event) {
        var confirm = $mdDialog.confirm()
          .title('Kas olete kindel?')
          .textContent('Kas kustutame küsimustiku ära? Seda enam tagasi ei saa.')
          .ariaLabel('Kas olete kindel')
          .targetEvent($event)
          .ok('Jah, kustuta')
          .cancel('Ei, mõtlesin ümber');
        $mdDialog.show(confirm).then(function() {
          $scope.delete($scope.activeQuestionnaire);
          $scope.activeQuestion = {};
        }, function() {

        });



      };



      $scope.viewQuestion = function(question) {
        $scope.currentQuestionIndex = $scope.activeQuestionnaire.questions.indexOf(question);
        $scope.activeQuestion = angular.copy(question);
      };

      //Korras! Uue küsimustiku loomise dialoog
      $scope.create = function($event) {
        $mdDialog.show({
          parent: angular.element(document.body),
          targetEvent: $event,
          templateUrl: 'views/questionnaire_create.html',
          locals: {
            questionnaire: $scope.questionnaire,
            questionnaires: $scope.questionnaires,
            save: $scope.save
          },
          //Antud $mdDialog kasutab DialogController kontrollerit
          controller: DialogController
        });

        //NB! Siin on defineeritud uus kontroller. Uusi funktsioone mis kasutavad $scope vms parameetrit luuakse uute kontrollerite sisse, mitte suvaliste funktsioonide sisse!
        // Sisult on kontroller lihtsalt .js funktsioon, aga erinevus seisneb selles, et kontroller on otse seotud spetsiifiliste HTML elementide / vaadete külge
        function DialogController($scope, $mdDialog, questionnaire, questionnaires, save) {
          $scope.questionnaire = questionnaire;
          $scope.questionnaires = questionnaires;
          $scope.question = {};
          $scope.questionnaire.questions = [];
          $scope.question.variants = [];
          $scope.question.maxPoints = 0;
          $scope.addVariant = function(question, variant) {
            $scope.question.variants.push(angular.copy(variant));
            $scope.question.maxPoints += variant.points;
          };
          $scope.remVariant = function(question, variant) {
            $scope.question.maxPoints -= variant.points;
            $scope.question.variants.splice(question.variants.indexOf(variant), 1);
          };
          $scope.clear = function() {
            $scope.question.variants = [];
            $scope.question.maxPoints = 0;
          };
          $scope.addQuestion = function(question) {
            $scope.questionnaire.questions.push(angular.copy(question));
            $scope.questionnaire.totalPoints += question.maxPoints;
          };
          $scope.remQuestion = function(question) {
            $scope.questionnaire.questions.splice($scope.questionnaire.questions.indexOf(question), 1);
            $scope.questionnaire.totalPoints -= question.maxPoints;
          };
          $scope.create = function(item) {
            $mdDialog.hide();
            save(item);
          };
          $scope.close = function() {
            $mdDialog.hide();
          };
        }
      };

      $scope.clear = function(question) {
        question.variants = [];
        question.maxPoints = 0;
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
