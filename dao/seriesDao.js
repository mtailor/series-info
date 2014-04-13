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

function buildArrayOfEmptyObjects(length){
	var a = [];
	for(var i = 0; i < length; i++){
		a.push({});
	}
	return a;
}




// Returns an array of seasons where each has 
// - firstAirDate
// - lastAirDate
exports.getSeasons = function(serieId){
	return doQuery(
		'SELECT min(c.air_date) as first_air_date, max(c.air_date) as last_air_date ' + 
		'FROM season b ' +
		'LEFT JOIN episode c ' +
		'ON b.serie_id = c.serie_id ' +
		'AND b.season_num = c.season_num ' +
		'WHERE b.serie_id = $1 ' +
		'GROUP BY b.season_num ' +
		'ORDER BY b.season_num',
		[serieId]
	).then(function(rows){
		return rows.map(function(row){
			return {
				firstAirDate : row.first_air_date,
				lastAirDate : row.last_air_date
			};
		});
	});
}


// Returns an array of series where each has 
// - id
// - title
// - rank
// - seasons : an array of seasons, each season being an empty object
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
				seasons : buildArrayOfEmptyObjects(row.nb_seasons)
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