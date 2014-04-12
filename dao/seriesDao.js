var pg = require('pg.js');
var q = require('q');
var config = require("../common/config");


// Perform a query, returning a promise for the result object
function doQuery(sql, params) {
	var deferred = q.defer();
	pg.connect({
			user : config.DB_USER,
			database : config.DB_NAME,
			password : config.DB_PWD,
			port : config.DB_PORT,
			host : config.DB_HOST,
			ssl : config.DB_USE_SSL
		}, function(err, client, done) {
		if (err) {
			deferred.reject(err);
		} else {
			client.query(sql, params, function(err, result) {
				done();
				if (err) {
					deferred.reject(err);
				} else {
					deferred.resolve(result.rows);
				}
			})
;		}
	});
	return deferred.promise;
}

exports.getSeries = function(){
	return doQuery(
		'SELECT a.serie_id, title, moviemeter_rank, count(*) as nb_seasons ' + 
		'FROM serie a ' +
		'LEFT JOIN season b ' +
		'ON a.serie_id = b.serie_id ' +
		'GROUP BY a.serie_id, title, moviemeter_rank ' +
		'ORDER BY moviemeter_rank',
		[]
	).then(function(rows){
		return rows.map(function(row){
			return {
				id : row.serie_id,
				title : row.title,
				rank : row.moviemeter_rank,
				nbSeasons : row.nb_seasons
			};
		});
	});
}

exports.deleteAll = function(){
	console.log('Deleting all series, seasons and episodes');
	return doQuery('TRUNCATE serie CASCADE', []);
}


// serie must have :
// id
// title
// rank
exports.addSerie = function(serie) {
	console.log('Storing the serie ' + serie.id + ' (' + serie.rank + '. ' + serie.title +')');
	return doQuery(
		'INSERT INTO serie ' +
		'(serie_id, title, moviemeter_rank) ' +
		'SELECT $1, $2, $3' +
		'WHERE NOT EXISTS (' + 
        '    SELECT * FROM serie WHERE serie_id = $4' +
		')',
		[
			serie.id,
			serie.title,
			serie.rank,
			serie.id
		]
	);
}

// episodes must be an array where each object has 
// - title
// - airDate (a 'moment')
exports.addSeason = function(serieId, numSeason, episodes) {
	console.log('Storing the season ' + numSeason + ' of ' + serieId);
	return doQuery(
		// insert the season
		'INSERT INTO season ' +
		'(serie_id, season_num) ' +
		'SELECT $1, $2 ' +
		'WHERE NOT EXISTS (' + 
		'    SELECT * FROM season WHERE serie_id = $3 AND season_num = $4' +
		')',
		[
			serieId,
			numSeason,
			serieId,
			numSeason
		]
	).then(function(){
		// insert all episodes
		return q.all(episodes.map(function(episode, num){
			console.log('Storing the episode ' + num + ' of season ' + numSeason + ' of ' + serieId);
			return doQuery(
				'INSERT INTO episode ' +
				'(serie_id, season_num, episode_num, title, air_date) ' +
				'SELECT $1, $2, $3, $4, $5 ' +
				'WHERE NOT EXISTS (' + 
				'    SELECT * FROM episode WHERE serie_id = $6 AND season_num = $7 AND episode_num = $8' +
				')',
				[
					serieId,
					numSeason,
					num,
					episode.title,
					episode.airDate.format('YYYY-MM-DD'),
					serieId,
					numSeason,
					num
				]
			);
		}));
	});
}