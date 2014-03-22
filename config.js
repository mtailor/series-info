var privateConfig = require('./privateConfig');


module.exports = {
	
	MONGO_URL : 'mongodb://{USER}:{PWD}@oceanic.mongohq.com:10093/series' // MongoHQ
	//MONGO_URL : 'mongodb://{USER}:{PWD}@ds035137.mongolab.com:35137/series' // MongoLab
		.replace('{USER}', privateConfig.MONGO_USER)
		.replace('{PWD}', privateConfig.MONGO_PWD),
	IMDB_SERIES_URL : 'http://www.imdb.com/search/title?at=0&num_votes=200000,&sort=moviemeter,asc&title_type=tv_series',
	IMDB_SERIE_SEASON_URL : 'http://www.imdb.com/title/{ID}/episodes?season={SEASON}',
	SERVER_PORT : 8100
};