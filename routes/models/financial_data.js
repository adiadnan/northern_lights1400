/* Exporting the methods defined here. */
var exports = module.exports = {};
/* var linkFeed = require('./models/linkFeedSchema').linkFeed; */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var financial_data_schema = new Schema({
	data : [
	{
		date: {type: String},
		high: {type : Number},
		low: {type : Number},
		open: {type : Number},
		volume: {type : Number}
	}
	]
},{
	collection : 'financial_data_collection'
});

var financial_data = mongoose.model('financial_data',financial_data_schema);

exports.financial_data = financial_data;
