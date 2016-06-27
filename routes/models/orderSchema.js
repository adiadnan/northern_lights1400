/* Exporting the methods defined here. */
var exports = module.exports = {};


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
	user: String,
	symbol: String,
	company_id: String,
	price: Number,
	amount: Number,
	date_entered: Date,
	order_type: String
},{
	collection : 'order_collection'
});

var order = mongoose.model('order',orderSchema);

exports.order = order;
