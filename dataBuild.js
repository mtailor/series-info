var imdbScrapingService = require('./service/imdbScrapingService');


console.log('Launching the process of scraping IMDB and storing its datas');
imdbScrapingService.scrapAndStore().done(function(){
	console.log('Done.');
});




