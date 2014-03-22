var qHttp = require('q-io/http');
var qApps = require("q-io/http-apps");
var seriesService = require('./seriesService');
var mongooseConnect = require('./mongooseConnect');
var config = require('./config');


console.log('Launching the connection to the database');
var connectionPromise = mongooseConnect();
connectionPromise.done(function() {
	console.log('Successfully connected to the database');
})

console.log('Launching the server');
new qHttp.Server(function(request) {
	console.log('Received request at ' + request.url);
	return connectionPromise.then(function() {
		if (request.path != '/') {
			return qApps.notFound(request);
		}
		return seriesService
			.doProcess()
			.then(function(val) {
				console.log('Responding to a request');
				return qApps.ok(
					JSON.stringify(val, null, 2),
					'application/json; charset=utf-8'
				);
			}, function(e) {
				qApps.ok(
					'Internal Error',
					undefined,
					500
				);
				console.log(e);
			});
	})

})
	.listen(config.SERVER_PORT)
	.done(function() {
		console.log('Server started on port ' + config.SERVER_PORT);
	});
