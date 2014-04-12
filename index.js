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
	if (request.path == '/getSeries') {
		return dao
			.getSeries()
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
		qApps.Log(qApps.Error(indexApp)),
		qApps.Log(qApps.Error(ajaxApp)),
		qApps.Error(publicApp)
	]))
	.listen(config.SERVER_PORT)
	.done(function() {
		console.log('Server started on port ' + config.SERVER_PORT);
	});
