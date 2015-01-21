'use strict';


angular.module('core').controller('HomeController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.search = function() {
            $location.path('articles').search('search_string', $scope.search_string);
        };
        
        $scope.checkKeyPressed = function(event) {
            if (event.keyCode  === 13) {
                $scope.search();
            }
        }
    }
]);
