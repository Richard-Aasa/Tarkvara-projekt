(function() {
    'use strict';

    angular.
    module('app').factory('StatisticsService', ['$resource', function($resource) {
		//See jupp tagastab serveri poolt laetud antud id-ga testi tulemuse
		//REST api
        return $resource('/statistics/:id', { id: '@_id' }, {
        });
    }]);
}());
