// Sellisel kujul näeb algne kontroller välja
(function() {
    'use strict';

    angular
        .module('app')
        .controller('QuestionController', ['$scope', Question, '$mdToast', function($scope, Question, $mdToast) {

            // // Küsime ligipääsu serveripoolsele routile "questions"
            // // NB! Kõik kliendipoolsed addressid mis ei "lae" uut vaadet algavad localhost:3000/#/kamarajura
            // // Niiet /#/test/create on AngularJS route ja /questions on otseviide serverile andmete saamiseks
            // $http.get('/questions').success(function(response) {
            //
            //     // Minnes addressile /#/test/create, küsib see kontroller
            //     // serverilt vastust addressilt /questions. Server vastab
            //     // ja saadab tagasi objektide massiivi. success() meetod
            //     // võtab vastuse ja see mida server saatis on callback funktsioonis
            //     // 'response' parameetris.
            //
            //     // Lõpuks ütleme, et kui kontroller on laetud, teeme
            //     // muutuja "questions" avalikuks ja anname sellele serveri vastuse väärtuseks.
            //     // Kui me seda ei tee, ei saa me /public/views/test.html failis kasutada ng-repeat="x in questions"
            //     // attribuuti, kuna "questions" ei oleks defineeritud
            //     $scope.questions = response;
            // });
            // $http.get('/types').success(function(response) {
            //     $scope.types = response;
            // });
            $scope.loading = true;
            Question.query()
                .$promise.then(
                    function(data) {
                        console.log(data);
                        $scope.questions = data;
                        $scope.loading = false;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
            $scope.question = {};
            $scope.question.maxPoints = 0;
            $scope.question.variants = [];
            $scope.addVariant = function(question, variant) {
                // Peab kopeerima, muidu viitab eksisteerivale sisendile
                // NB! C keeles = tähendab koopia tegemist
                // Angularis = tähendab otseviitamist
                // ehk näiteks:
                /*
                  var a = 5;
                  var c = a;
                  c = 10;
                  console.log(a) - annab vastuse 10
                */
                $scope.question.variants.push(angular.copy(variant));
                $scope.question.maxPoints += variant.points;
            }
            $scope.remVariant = function(question, variant) {
                $scope.question.maxPoints -= variant.points;
                $scope.question.variants.splice(question.variants.indexOf(variant), 1);
            }
            $scope.addQuestion = function() {
                var newQuestion = new Question($scope.question);
                newQuestion.$save()
                    .then(
                        function(data) {
                            showToast('Successfully saved ' + data.name);
                            $scope.questions.push(data);
                        },
                        function(error) {
                            console.log(error);
                            showToast(error.status + ' ' + error.statusText);
                        }
                    );
            }
        }]);

}());
