var qHttp = require('q-io/http');
var qApps = require("q-io/http-apps");
var seriesService = require('./seriesService');

var serverPort = 8100;
var serverUrl = 'localhost';


var server = new qHttp.Server(function(request) {
	console.log("Received request at " + request.url);
	if (request.path != '/') {
		return qApps.notFound(request);
	}
	return seriesService
		.doProcess()
		.then(function(val) {
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
	.listen(serverPort)
	.done(function() {
		console.log('Server started on port ' + serverPort);
	}, function(e) {
		console.log(e);
	});

