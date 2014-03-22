var mongoose = require('mongoose');

var schema = mongoose.Schema({
    name: String
});

var model = mongoose.model('Serie', schema);

module.exports = model;

