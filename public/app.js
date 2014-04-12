angular
	.module('mainModule', [])
 	.controller('SeriesController', function ($scope, $http) {
 			$scope.loading = true;
			$http.get('getSeries').success(function(data) {
				$scope.series = data;
				$scope.loading = false;
			});
		}
	);

