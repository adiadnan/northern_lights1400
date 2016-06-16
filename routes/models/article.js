/* Exporting the methods defined here. */
var exports = module.exports = {};

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
	link : String,
	title : String,
	date : String,
	description : String,
	content : String,
	sentiment : {
		mixed : {type : String},
		score : {type : String},
		type : {type : String}
	},
	keywords : [{
		relevance : {type : String},
		sentiment : {
			score : {type : String},
			type : {type : String},
			mixed : {type : String}
		},
		text : String
	}],
	entities : [{
		type : {type : String},
		relevance : {type : String},
		count : {type : String},
		text : {type : String},
		quotations : [{
			quotation : {type : String}
		}],
		sentiment : {
			type : { type : String},
			score : {type : String},
			mixed : {type : String}
		}
	}],
	concepts : [{
		text : String,
		relevance : String
	}]
},{
	collection : 'articles_collection'
});
/* Creating the model based on the Schema */
var article = mongoose.model('article', articleSchema);

exports.dropArticles = function(res, callback){
	var article = mongoose.model('article', articleSchema);	
	mongoose.connection.collections['articles'].drop(function(err){
		console.log('collection dropped');
		return callback(null,res,{message:'Collection dropped.'});
	});
}

exports.article = article;