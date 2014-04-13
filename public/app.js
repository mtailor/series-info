angular
	.module('mainModule', [])
 	.controller('SeriesController', function ($scope, $http) {


 			function computeMaxNumberOfSeasons(data){
 				var max = 0;
 				console.log(data);
 				data.forEach(function(serie){
					var nbSeasons = serie.seasons.length;
 					if(nbSeasons > max){
 						max = nbSeasons;
 					}
 				});
 				return max;
 			};	

 			function buildArrayOfTrueThenFalse(nbOfTrue, nbTotal){
 				var a = [];
 				for(var i = 0; i < nbTotal; i++){
 					a.push(i < nbOfTrue);
 				}
 				return a;
 			};

 			function replaceSeasonsArrays(data, maxNbSeasons){
 				data.forEach(function(serie){
					var nbSeasons = serie.seasons.length;
					serie.seasons = buildArrayOfTrueThenFalse(nbSeasons, maxNbSeasons);
 				});
 				return data;
 			};

 			$scope.loading = true;
			$http.get('series').success(function(data) {
				$scope.series = replaceSeasonsArrays(data, computeMaxNumberOfSeasons(data));
				$scope.loading = false;
			});
		}
	);

