var q = require('q');
var qHttp = require('q-io/http');
var cheerio = require('cheerio');
var config = require('./config');
var SerieModel = require('./SerieModel')

//TODO migrer dans les nouveaux services

// returns an array of episode titles
	function getEpisodesTitles(id, numSeason) {
		var url = config.IMDB_SERIE_SEASON_URL
			.replace('{ID}', id)
			.replace('{SEASON}', numSeason);
		return qHttp
			.read(url)
			.then(function(response) {
				var $ = cheerio.load(response.toString());
				var episodes = [];
				$('.eplist .info strong a').each(function() {
					episodes.push($(this).text());
				});
				return episodes;
			});
	}

	function getNumberOfSeasons(id) {
		var url = config.IMDB_SERIE_SEASON_URL
			.replace('{ID}', id)
			.replace('{SEASON}', 1);
		return qHttp
			.read(url)
			.then(function(response) {
				var $ = cheerio.load(response.toString());
				return $('#bySeason option').filter(function() {
					return $(this).val().match(/^[0-9]+$/)
				}).length;
			});
	}

	// return an array where each item is itself an array of episode titles
	function getSeasons(id) {
		return getNumberOfSeasons(id)
			.then(function(nbSeasons) {
				var promises = [];
				for (var numSeason = 1; numSeason <= nbSeasons; numSeason++) {
					promises.push(getEpisodesTitles(id, numSeason));
				}
				return q.all(promises);
			});
	}

	// returns an array of objects where each has :
	// - id
	// - title
	function getSeries() {
		return qHttp
			.read(config.IMDB_SERIES_URL)
			.then(function(response) {
				var $ = cheerio.load(response.toString());
				var titleLinks = $('.results tr.detailed .title > a');
				var series = [];
				titleLinks.each(function() {
					series.push({
						id: $(this).attr('href').replace('/title/', '').replace('/', ''),
						title: $(this).text()
					});

					// var serie = new SerieModel({
					// 	name: $(this).text()
					// });
					// q.ninvoke(serie, 'save').then(function() {
					// 	console.log('saved');
					// }, function() {
					// 	console.log('echec du save')
					// });
				});
				return series;
			});
	}

	// returns an array of objects where each is like : 
	// {
	// 	 id
	// 	 title
	// 	 seasons : [
	//      [
	//         'title of S1E1',
	//         'title of S1E2',
	//  		...
	//		],
	//		[
	//			'title of S2E1',
	//          ...
	//		],
	//		...
	//	]
	// }
exports.doProcess = function(callback) {

	return getSeries().then(function(series) {

		var promises = [];
		series.forEach(function(entry) {
			promises.push(getSeasons(entry.id));
		});

		return q.all(promises)
			.then(function(seasonsOfAllSeries) {
				for (var i = 0; i < seasonsOfAllSeries.length; i++) {
					series[i].seasons = seasonsOfAllSeries[i];
				}
				return series;
			});
	});
};