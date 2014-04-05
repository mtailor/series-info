var q = require('q');
var qHttp = require('q-io/http');
var cheerio = require('cheerio');
var moment = require('moment');
var config = require('../common/config');
var dao = require('../dao/seriesDao.js');

// Returns an array of episode, where each episodes has
// - title
// - airDate (a 'moment')
function getEpisodes(id, numSeason) {
	var url = config.IMDB_SERIE_SEASON_URL
		.replace('{ID}', id)
		.replace('{SEASON}', numSeason);
	console.log('Interrogating ' + url);
	return qHttp
		.read(url)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			var episodes = [];
			$('.eplist .info').each(function() {
				episodes.push({
					title : $(this).find('strong a').eq(0).text(),
					airDate : moment($(this).find('.airDate').eq(0).text().trim())
				});
			});
			return episodes;
		});
}


function fetchSeasonAndStoreIt(id, numSeason){
	return getEpisodes(id, numSeason)
		.then(function(episodes){
			return dao.addSeason(id, numSeason, episodes);
		});
}



// Returns a number
function getNumberOfSeasons(id) {
	var url = config.IMDB_SERIE_SEASON_URL
		.replace('{ID}', id)
		.replace('{SEASON}', 1);
	console.log('Interrogating ' + url);
	return qHttp
		.read(url)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			return $('#bySeason option').filter(function() {
				return $(this).val().match(/^[0-9]+$/)
			}).length;
		});
}

// Fetch all seasons from a serie and store them
function fetchSeasonsAndStoreThem(id) {
	return getNumberOfSeasons(id)
		.then(function(nbSeasons) {
			var promises = [];
			for (var numSeason = 1; numSeason <= nbSeasons; numSeason++) {
				promises.push(fetchSeasonAndStoreIt(id, numSeason));
			}
			return q.all(promises);
		});
}


// Fetchs the root information of all series.
//
// returns an array of objects where each has :
// - id
// - title
function getBaseSeries() {
	var url = config.IMDB_SERIES_URL;
	console.log('Interrogating ' + url);
	return qHttp
		.read(url)
		.then(function(response) {
			var $ = cheerio.load(response.toString());
			var titleLinks = $('.results tr.detailed .title > a');
			var series = [];
			titleLinks.each(function() {
				series.push({
					id: $(this).attr('href').replace('/title/', '').replace('/', ''),
					title: $(this).text()
				});
			});
			return series;
		});
}

exports.scrapAndStore = function() {
	return getBaseSeries().then(function(baseSeries) {
		return q.all(
			baseSeries.map(function(baseSerie) {
				return dao.addSerie(baseSerie)
					.then(function(){
						return fetchSeasonsAndStoreThem(baseSerie.id);
					});
			})
		);
	});
};