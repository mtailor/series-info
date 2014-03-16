var http = require('http');
var seriesService = require('./seriesService');

var serverPort = 8100;
var serverUrl = 'localhost';

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
	/*
	//-----------
	var url = 'http://www.imdb.com/search/title?at=0&num_votes=5000,&sort=moviemeter,asc&title_type=tv_series';
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			//-----
			var $ = cheerio.load(body);
			var titleLinks = $(".results tr.detailed .title > a");
			var result = {};
			titleLinks.each(function(index) {
				result[index] = $(this).text();
			});
			//------
			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.write(JSON.stringify(result, null, 2));
			res.end();
		} else {
			res.writeHead(200, {
				'Content-Type': 'text/plain; charset=utf-8'
			});
			res.end('Cannot access &é the url : ' + url);
		}

	});
	//-----------

	*/

}).listen(serverPort, serverUrl);

console.log('Server running at http://' + serverUrl + ':' + serverPort);