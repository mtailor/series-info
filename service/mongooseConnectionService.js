var mongoose = require("mongoose");
var q = require('q');
var config = require("../common/config");


// Returns a promise for undefined
exports.connect = function() {
	console.log('Launching the connection to the database');
	var deferred = q.defer();
	mongoose.connection.once('open', function() {
		console.log('Successfully connected to the database');
		deferred.resolve();
	});
	mongoose.connection.on('error', function() {
		deferred.reject(new Error('Failed to connect to the database'));
	});
	mongoose.connect(config.MONGO_URL);
	return deferred.promise;
}


exports.disconnect = function() {
	console.log('Disconnecting from the database');
	mongoose.disconnect(function() {
		console.log('Successfully disconnected from the database');
	});
}