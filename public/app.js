angular
	.module('mainModule', [])
 	.controller('SeriesController', function ($scope, $http) {
		  $http.get('getSeries').success(function(data) {
		    $scope.series = data;
		  });
		}
	);

