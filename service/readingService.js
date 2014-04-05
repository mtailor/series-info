var q = require('q');
var SerieModel = require('./SerieModel')


exports.fetchAll = function(){
	return q.ninvoke(SerieModel, "find");
}