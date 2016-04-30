(function() {
    'use strict';

    angular.
    module('app').factory('QuestionService', ['$resource', function($resource) {
        return $resource('/questions/:id', { id: '@_id' });
    }]);
}());
