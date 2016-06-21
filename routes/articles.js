var express = require('express');
var router = express.Router();

const article = require('./models/article').article;
const mongoose = require('mongoose');

function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years ago";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months ago";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days ago";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours ago";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes ago";
	}
	return Math.floor(seconds) + " seconds ago";
}

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
	article.find({
		'_id' : req.query.id
	})
	.exec(
		function(err,articles){
			if(err){
				return console.log(err);
			}
			console.log(articles.length);
			if(articles.length === 0){
				res.render('articles', {relevant_data:[]});
				return;
			}
			res.render('articles', {
				timeSince: timeSince,
				relevant_data: articles[0]
			});
		})
});

router.get('/concepts', function(req, res, next) {
	article.find({
		'_id' : req.query.id
	})
	.select('concepts')
	.exec(
		function(err,articles){
			if(err){
				return console.log(err);
			}
			console.log(articles.length);
			if(articles.length === 0){
				res.send({});
				return;
			}
			res.send(articles[0]);
		});
});

module.exports = router;
