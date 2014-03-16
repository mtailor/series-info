var request = require('request');
var cheerio = require('cheerio');


var IMDB_SERIES_URL = 'http://www.imdb.com/search/title?at=0&num_votes=200000,&sort=moviemeter,asc&title_type=tv_series';
var IMDB_SERIE_SEASON_URL = 'http://www.imdb.com/title/ID/episodes?season=SEASON';


exports.doProcess = function(callback) {
	// read the 
	request(IMDB_SERIES_URL, function(error, response, body) {
		if (error)
			callback(error);
		else {
			var $ = cheerio.load(body);
			var titleLinks = $(".results tr.detailed .title > a");
			var result = [];
			titleLinks.each(function(index) {
				result.push({
					index : index,
					id : $(this).attr('href').replace("/title/", "").replace("/", ""),
					title : $(this).text()
				});
			});
			result.forEach(function(entry){
				//TODO call the episodes page of season 1
				// comment faire pour attendre la fin de tous les appels asynchrones avant d'appeler le callback ?

				entry.toto = "t";
			});
			callback(null, result);
		}
	});
}