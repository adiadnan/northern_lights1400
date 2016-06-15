/* Exporting the methods defined here. */
var exports = module.exports = {};
/* var linkFeed = require('./models/linkFeedSchema').linkFeed; */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var linkFeedSchema = new Schema({
	link : String,
	has_feed : Boolean,
	link_feeds : [String]
},{
	collection : 'link_feed_collection'
});

var linkFeed = mongoose.model('link_feed',linkFeedSchema);

exports.linkFeed = linkFeed;
