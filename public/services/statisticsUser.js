(function() {
    'use strict';

    angular.
    module('app').factory('StatisticsUserService', ['$resource', function($resource) {
		//See jupp tagastab serveri poolt laetud antud id-ga testi tulemuse
		//REST api
        return $resource('/statistics/:user', { user: '@user' }, {
        });
    }]);
}());
