angular
	.module('mainModule', [])
 	.controller('SeriesController', function ($scope, $http) {

 			function asMoments(datesStrings){
 				return datesStrings.map(function(s){
 					return moment(s);
 				});
 			}

 			function firstDayOfYear(year){
 				return moment([year, 0, 1]);
 			}

			function listDaysOfYear(year){
				var days = [];
				var d = firstDayOfYear(year);				
				while(d.year() == year){
					// push a copy
					days.push(moment(d));
					d.add('days', 1);
				}
				return days;				
			}

			function containsDay(days, day){
				cptContainsDay++;
				return days.some(function(d){
					//this version seems much faster than .same()
					return d.date() == day.date() && d.month() == day.month() && d.year() == day.year();
				});
			}


			var cptContainsDay = 0 
			var cptGetAirDatesAsBoolean = 0

			// for each day of the year, the returned array
			// will contain true/false depending
			// on wether it's present or not in the airDates
			function getAirDatesAsBoolean(daysOfYear, airDates){
				cptGetAirDatesAsBoolean++;
				return daysOfYear.map(function (day){
					return containsDay(airDates, day);
				});
			}

			var year = 2013;

 			$scope.loading = true;
			$scope.series = []; 
			$http.get('year/' + year).success(function(series) {

				//series = [series[0], series[1], series[2]];
				var yearDays = listDaysOfYear(year);

				var res = series.map(function(serie){
					return {
						id : serie.id,
						title : serie.title,
						days : getAirDatesAsBoolean(yearDays, asMoments(serie.episodesAirDates))
					};
				});
				$scope.series = res;
				$scope.loading = false;
			});
		}
	);

