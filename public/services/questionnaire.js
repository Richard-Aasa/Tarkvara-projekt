(function() {
    'use strict';

    angular.
    module('app').factory('QuestionnaireService', ['$resource', function($resource) {
		//See jupp tagastab serveri poolt laetud antud id-ga küsimuse
		//REST api
        return $resource('/questionnaire/:id', { id: '@_id' }, {
          'update': { method:'PUT' }
        });
    }]);
}());
