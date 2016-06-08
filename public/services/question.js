(function() {
    'use strict';

    angular.
    module('app').factory('QuestionService', ['$resource', function($resource) {
		//See jupp tagastab serveri poolt laetud antud id-ga küsimuse
		//REST api
        return $resource('/questions/:id', { id: '@_id' });
    }]);
}());
