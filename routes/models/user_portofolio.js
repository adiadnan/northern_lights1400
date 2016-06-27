/* Exporting the methods defined here. */
var exports = module.exports = {};


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portofolioSchema = new Schema({
	user: String,
	symbol: {type: String},
	stocks_left: Number
},{
	collection : 'portofolio_collection'
});

var portofolio = mongoose.model('portofolio',portofolioSchema);

exports.portofolio = portofolio;
