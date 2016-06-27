/* Exporting the methods defined here. */
var exports = module.exports = {};

/* Getting started */
var mongoose = require('mongoose');

/* Custom made modules */
var article = require('./model/article');
var google_feed = require('./model/google_feed');
var single_google_feed = require('./model/single_google_feed');

var uri = 'mongodb://localhost:27017/bigdata';

var options = { reconnectTries: Number.MAX_VALUE };

var admin_code = '2207'

mongoose.connect(uri, options, function(err){
	if(err){
		console.log('Exception occured:');
		return console.log(err);
	}
	console.log('Successfully connected to Mongo!');
});

exports.connectionState = function(){
	return mongoose.connection.readyState;
}
exports.drop = function(req, res, callback){
	var collectionName = req.params.collectionName;
	var code = req.query.code;
	if(code !== admin_code){
		return callback(null, res, {message : 'Permission denied.'});
	}
	if(collectionName === 'articles') {
		return article.dropArticles(res, callback);
	} else if(collectionName === 'feeds'){
		return google_feed.dropFeeds(res, callback);
	} else if(collectionName === 'single_feeds'){
		return single_google_feed.dropSingularFeeds(res, callback);
	}

}
