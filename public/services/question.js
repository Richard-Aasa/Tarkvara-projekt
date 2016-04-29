(function() {
    'use strict';

    angular.
    module('app').factory('Question', ['$resource', function($resource) {
        return $resource('/questions/:id', { id: '@_id' }, {
            update: {
                method: 'PUT' // this method issues a PUT request
            }
        });
    }]);
}());
