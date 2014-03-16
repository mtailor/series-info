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

/*

var server = http.createServer(function(req, res) {
	console.log('[REQUEST] ' + req.url);
	if (req.url != '/') {
		res.writeHead(404);
		res.end('Invalid url');
	} else {
		seriesService.doProcess(function(err, result) {
			if (err) {
				console.log(err);
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.write(JSON.stringify(result, null, 2));
				res.end();
			}
		});
	}

}).listen(serverPort, serverUrl);

console.log('Server running at http://' + serverUrl + ':' + serverPort);

*/