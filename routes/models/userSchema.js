/* Exporting the methods defined here. */
var exports = module.exports = {};


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username : String,
	password : String,
	money_left: {type: Number}
},{
	collection : 'user_collection'
});

var user = mongoose.model('user',userSchema);

exports.user = user;
