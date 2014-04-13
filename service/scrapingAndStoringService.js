var moment = require('moment');
var q = require('q');
var qHttp = require('q-io/http');
var cheerio = require('cheerio');
var config = require('../common/config');
var dao = require('../dao/seriesDao.js');

function translateDate(str){
	var m = moment(str);
	if(! m.isValid()){
		throw new Error('"' + str + '" is not a parsable date')
	}
	return m;
}


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
				var airDateStr = $(this).find('.airDate, .airdate').eq(0).text().trim();
				//empty air date means unknown => we don't want to store it
				if(airDateStr !== ''){
					episodes.push({
						title : $(this).find('strong a').eq(0).text(),
						airDate : translateDate(airDateStr)
					});
				}
				
			});
			return episodes;
		});
}


function fetchSeasonAndStoreIt(id, numSeason){
	return getEpisodes(id, numSeason)
		.then(function(episodes){
			if(episodes.length > 0){
				return dao.addSeason(id, numSeason, episodes);
			} else {
				return;
			}
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
// - rank
function getBaseSeries() {
	return q.all(config.IMDB_SERIES_URLS.map(function (url){
		console.log('Interrogating ' + url);
		return qHttp
			.read(url)
			.then(function(response) {
				var $ = cheerio.load(response.toString());
				var rows = $('.results tr.detailed');
				var series = [];
				rows.each(function(){
					series.push({
						id : $(this).find('.title > a').attr('href').replace('/title/', '').replace('/', ''),
						title : $(this).find('.title > a').text(),
						rank : $(this).find('td.number').text().replace('.', '')
					});
				});
				return series;
			});

	}))
	.then(function(arrayOfArraysOfSeries){
		// need to flatten it into a simple array
		// see http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
		return [].concat.apply([], arrayOfArraysOfSeries);
	});
}

exports.scrapAndStore = function() {
	console.log('Launching the process of scraping IMDB and storing its datas');
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