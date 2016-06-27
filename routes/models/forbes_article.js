/* Exporting the methods defined here. */
var exports = module.exports = {};

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
	link : String,
	author : String,
	title : String,
	date : {
		beautiful : String,
		rough : Number
	},
	content : String,
	newsKeywords : [String],
	googleKeywords : [String],
	clear : String,
	Alchemy : {
		mixed : {type : String},
		score : {type : String},
		type : {type : String}
	},
	sentimental : {
		score : Number,
		comparative : Number,
		positive:{
			score : Number,
			comparative : Number,
			words : [String]
		},
		negative:{
			score : Number,
			comparative : Number,
			words : [String]
		}
	},
	sentiment : {
		score : Number,
		comparative : Number,
		positive:[String],
		negative:[String]
	}
},{
	collection: 'forbes_collection'
});
/* Creating the model based on the Schema */
var forbes_article = mongoose.model('article', articleSchema);

exports.dropArticles = function(res, callback){
	var article = mongoose.model('article', articleSchema);	
	mongoose.connection.collections['articles'].drop(function(err){
		console.log('collection dropped');
		return callback(null,res,{message:'Collection dropped.'});
	});
}

exports.forbes_article = forbes_article;