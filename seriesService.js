var q = require('q');
var qHttp = require('q-io/http');
var cheerio = require('cheerio');


var imdbSeriesUrl = 'http://www.imdb.com/search/title?at=0&num_votes=200000,&sort=moviemeter,asc&title_type=tv_series';
var imdbSerieSeasonUrl = 'http://www.imdb.com/title/ID/episodes?season=SEASON';



// returns an array of episode titles
function getEpisodesTitles(id, numSeason) {
	var url = imdbSerieSeasonUrl
		.replace('ID', id)
		.replace('SEASON', numSeason);
	return qHttp
		.read(url)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			var episodes = [];
			$(".eplist .info strong a").each(function() {
				episodes.push($(this).text());
			});
			return episodes;
		});
}

function getNumberOfSeasons(id) {
	var url = imdbSerieSeasonUrl
		.replace('ID', id)
		.replace('SEASON', 1);
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
		.read(imdbSeriesUrl)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			var titleLinks = $(".results tr.detailed .title > a");
			var series = [];
			titleLinks.each(function() {
				series.push({
					id: $(this).attr('href').replace("/title/", "").replace("/", ""),
					title: $(this).text()
				});
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
//         "title of S1E1",
//         "title of S1E2",
//  		...
//		],
//		[
//			"title of S2E1",
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