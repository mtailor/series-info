var q = require('q');
var qHttp = require('q-io/http');
var cheerio = require('cheerio');


var imdbSeriesUrl = 'http://www.imdb.com/search/title?at=0&num_votes=200000,&sort=moviemeter,asc&title_type=tv_series';
var imdbSerieSeasonUrl = 'http://www.imdb.com/title/ID/episodes?season=SEASON';


function getSeries() {
	return qHttp
		.read(imdbSeriesUrl)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			var titleLinks = $(".results tr.detailed .title > a");
			var series = [];
			titleLinks.each(function(index) {
				series.push({
					index: index,
					id: $(this).attr('href').replace("/title/", "").replace("/", ""),
					title: $(this).text()
				});
			});
			return series;
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
			return $('#bySeason option').length;
		});
}

exports.doProcess = function(callback) {

	return getSeries().then(function(series) {

		var promises = [];
		series.forEach(function(entry) {
			promises.push(getNumberOfSeasons(entry.id));
		});

		return q.all(promises)
			.then(function(nbSeasonsArray) {
				for (var i = 0; i < nbSeasonsArray.length; i++) {
					series[i].nbSeasons = nbSeasonsArray[i];
				}
				return series;
			});
	});
};