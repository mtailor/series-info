var mongoose = require("mongoose");
var config = require("./config");
var q = require('q');


// Returns a promise for undefined
module.exports = function(){
	var deferred = q.defer();
	mongoose.connection.once('open', function() {
		deferred.resolve();
	});
	mongoose.connection.on('error', function() {
		deferred.reject(new Error('Failed to connect to the database'));
	});
	mongoose.connect(config.MONGO_URL);
	return deferred.promise;
}



