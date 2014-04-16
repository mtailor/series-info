var qHttp = require('q-io/http');
var qApps = require("q-io/http-apps");
var config = require('./common/config');
var dao = require('./dao/seriesDao');
var qAppsRoute = require('q-io/http-apps/route');

// Serve index.html
var indexApp = function(request){
	if (request.path == '/') {
		return qApps.file(request, 'index.html');
	}
	return qApps.notFound(request);
};

// Respond to ajax calls
var ajaxApp = function(request){
	if (request.path.match(new RegExp('^/series/?.*$'))) {
		var param = request.path.replace(new RegExp('/series/?'), '');
		return dao
			.getSeries(param != '' ? param : undefined)
			.then(function(val) {
				return qApps.ok(
					JSON.stringify(val, null, 2),
					'application/json; charset=utf-8'
				);
			});
	} else if (request.path.match(new RegExp('^/seasons/.*$'))) {
		return dao
			.getSeasons(request.path.replace('/seasons/', ''))
			.then(function(val) {
				return qApps.ok(
					JSON.stringify(val, null, 2),
					'application/json; charset=utf-8'
				);
			});
	} else if (request.path.match(new RegExp('^/year/.*$'))) {
		return dao
			.getEpisodesBySeriesForSomeYear(request.path.replace('/year/', ''))
			.then(function(val) {
				return qApps.ok(
					JSON.stringify(val, null, 2),
					'application/json; charset=utf-8'
				);
			});
	}
	return qApps.notFound(request);
};

// Serve static resources
var publicApp = qApps.FileTree('public');


console.log('Launching the server');
new qHttp.Server(qAppsRoute.FirstFound([
		qApps.Log(indexApp),
		qApps.Log(ajaxApp),
		publicApp
	]))
	.listen(config.SERVER_PORT)
	.done(function() {
		console.log('Server started on port ' + config.SERVER_PORT);
	});
