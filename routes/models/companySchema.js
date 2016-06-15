/* Exporting the methods defined here. */
var exports = module.exports = {};
/* var linkFeed = require('./models/linkFeedSchema').linkFeed; */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema({
	company_name : { type : String, default : ''},
	symbol : { type : String, default : ''},
	company_financial_rating : {type : Number, default : 0},
	company_sentiment : {type : Number, default : 0},
	company_importance : {type : Number, default : 0},
	country_rating : {type : Number, default : 0},
	related_stock : {type : Number, default : 0},
	company_rating : {type : Number, default : 0},
	daily_rating : {type : Number, default : 0},
	related_to : [String]
},{
	collection : 'company_collection'
});

var company = mongoose.model('company',companySchema);

exports.company = company;
