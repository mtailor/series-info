var privateConfig = require('./privateConfig');


module.exports = {
	DB_USER : privateConfig.DB_USER,
	DB_NAME : privateConfig.DB_NAME,
	DB_PWD : privateConfig.DB_PWD,
	DB_PORT : 5432,
	DB_HOST : privateConfig.DB_HOST,
	DB_USE_SSL : true,
	IMDB_SERIES_URL : 'http://www.imdb.com/search/title?at=0&num_votes=200000,&sort=moviemeter,asc&title_type=tv_series',
	IMDB_SERIE_SEASON_URL : 'http://www.imdb.com/title/{ID}/episodes?season={SEASON}',
	SERVER_PORT : 8100
};