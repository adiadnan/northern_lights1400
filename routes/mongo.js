/* PATTERN: 
1) surround database transactions with try catch clauses so that if 
the database fails, the system can heal if the DB is restored and therefor
can still run*/

/* Exporting the methods defined here. */
var exports = module.exports = {};

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var file_debugger = require('./file_debugger');

var url = 'mongodb://localhost:27017/bigdata';

var articles_coll ='articles';

/* CHANGE::::::::This method is not yet needed and should be subject to change!!!*/
exports.insertDocument = function(coll, item) {
	try{
		MongoClient.connect(url, function(err, db) {
			try{
				if(err) {
					res.send(err);
					throw err;
				}
				console.log("Connected correctly to server.");

				db.collection(coll).insertOne(item , function(err, result) {
					assert.equal(err, null);
					console.log("Inserted a document into the " + articles_coll + " collection.");
					db.close();
				});
			}catch(exception){
				console.log(exception);
			}

		});
	}catch(exception){
		console.log(exception);
		res.send(exception);
	}
};

exports.insertArticle = function(db, res, item, callback){
	try{
		console.log("Connected correctly to server.");

		db.collection('articles').insertOne(item , function(err, result) {
			assert.equal(err, null);
			console.log("Inserted a document into the " + articles_coll + " collection.");
			callback(db);
		});
		res.send(item);
	}catch(exception){
		console.log(exception);
	}
}

/* CHANGE::::::::This method is not yet needed and should be subject to change!!!*/
var insertMultipleDocuments = function(db, coll, items) {
	try{
		MongoClient.connect(url, function(err, db) {
			if(err){
				res.send();
			}
  // Get the collection
  var collection = db.collection(coll);
  collection.insertMany(items, function(err, r) {
  	test.equal(null, err);
  	test.equal(items.length, r.insertedCount);
    // Finish up test
    db.close();
});
});
	}catch(exception){
		console.log(exception);
	}
};

exports.findArticle = function(res, query, callback){
	try{
		MongoClient.connect(url, function(err, db){
			try{
				if(err) {
					res.send(err);
					throw err;
				}
				var cursor = db.collection('articles').find(query);
				var articles = [];

				cursor.each(function(err, doc){
					assert.equal(err, null);
					if(doc != null){
						articles.push(doc);
					} else {
						callback(db, res, articles);
					}
				})
			}catch(exception){
				console.log(exception);
			}
		});	
	}catch(exception){
		console.log(exception);
		res.send(exception);
	}
}

exports.getScore = function(beautified){
	try{
		MongoClient.connect(url, function(err, db){
			try{
				if(err) {
					res.send(err);
					throw err;
				}
				console.log(beautified.length);
				for(var index = 0; index < beautified.length; index++){
					var array = db.collection('articles').find({'link':beautified[index].link}).toArray();
					console.log(array);
				}
				db.close();
			}catch(exception){
				console.log(exception);
			}
		});	
	}catch(exception){
		console.log(exception);
		res.send(exception);
	}
}
