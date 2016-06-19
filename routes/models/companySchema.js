/* Exporting the methods defined here. */
var exports = module.exports = {};
/* var linkFeed = require('./models/linkFeedSchema').linkFeed; */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var country_rating = require('../country_rating');

var companySchema = new Schema({
	issuer : { type : String, default : ''},/* checked */
	details : [/* checked */
	String
	],
	company_financial_rating : {type : Number, default : 0},/* checked */
	company_sentiment : {type : Number, default : 0},/* checked *//* CC */
	company_PEG : {type : Number, default : 0},/* checked */
	country_rating : {type : Number, default : country_rating.getRating()},/* checked */
	related_stock : {type : Number, default : 0},/* CC */
	company_rating : {type : Number, default : 0},/* CC */
	daily_rating : {type : Number, default : 0},/* CC */
	related_to : [String],/* checked *//* CC */
	mentioned_by : [String]/* checked *//* CC */
},{
	collection : 'company_collection'
});

var company = mongoose.model('company',companySchema);

exports.company = company;
