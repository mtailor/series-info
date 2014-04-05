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
					deferred.resolve(result);
				}
			})
;		}
	});
	return deferred.promise;
}


// serie must have :
// id
// title
// TODO rajouter rank
exports.addSerie = function(serie) {
	console.log('Storing the serie ' + serie.id + ' (' + serie.title +')');
	return doQuery(
		'INSERT INTO serie ' +
		'(serie_id, title, moviemeter_rank) ' +
		'VALUES ' +
		'($1, $2, $3)',
		[
			serie.id,
			serie.title,
			0
		]
	);
}

// episodes must be an array w²here each object has 
// - title
// - airDate (a 'moment')
exports.addSeason = function(serieId, numSeason, episodes) {
	console.log('Storing the season ' + numSeason + ' of ' + serieId);
	return doQuery(
		// insert the season
		'INSERT INTO season ' +
		'(serie_id, season_num) ' +
		'VALUES ' +
		'($1, $2)',
		[
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
				'VALUES ' +
				'($1, $2, $3, $4, $5)',
				[
					serieId,
					numSeason,
					num,
					episode.title,
					episode.airDate.format('YYYY-MM-DD')
				]
			);
		}));
	});
}