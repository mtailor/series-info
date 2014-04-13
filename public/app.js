angular
	.module('mainModule', [])
 	.controller('SeriesController', function ($scope, $http) {

			var _MS_PER_DAY = 1000 * 60 * 60 * 24;


			function dateDiffInDays(a, b) {
				// Discard the time and time-zone information.
				a = new Date(a);
				b = new Date(b);
				var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
				var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
				return Math.floor((utc2 - utc1) / _MS_PER_DAY);
			}

 			function augmentSerieWithSeasons(serie){
 				$http.get('seasons/' + serie.id).success(function(seasons){
 					serie.seasonsDurations = seasons.map(function(season){
 						return dateDiffInDays(season.firstAirDate, season.lastAirDate);
 					});
 				});
 			}

 			function augmentSeriesWithSeasons(series){
 				series.forEach(function(serie){
 					augmentSerieWithSeasons(serie);
 				});
 			}

 			$scope.loading = true;
			$http.get('series').success(function(series) {
				$scope.series = series;
				$scope.loading = false;
				augmentSeriesWithSeasons(series);
			});



		}
	);

