var service = require('./service/scrapingAndStoringService');
var dao = require('./dao/seriesDao');

dao.deleteAll().then(function(){
	console.log('Launching the process of scraping IMDB and storing its datas');
	return service.scrapAndStore();
}).done(function(){
	console.log('Done.');
	process.exit();
});




