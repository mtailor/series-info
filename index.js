var qHttp = require('q-io/http');
var qApps = require("q-io/http-apps");
var readingService = require('./readingService');
var mongooseConnect = require('./mongooseConnect');
var config = require('./config');


mongooseConnect();

console.log('Launching the server');
new qHttp.Server(function(request) {
	console.log('Received request at ' + request.url);
	return connectionPromise.then(function() {
		if (request.path == '/') {
			return readingService
			.fetchAll()
			.then(function(val) {
				return qApps.ok(
					JSON.stringify(val, null, 2),
					'application/json; charset=utf-8'
				);
			});
		}
		return qApps.notFound(request);
	})

})
	.listen(config.SERVER_PORT)
	.done(function() {
		console.log('Server started on port ' + config.SERVER_PORT);
	});
