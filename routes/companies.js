var express = require('express');
var router = express.Router();

var googleFinance = require('google-finance');

const company = require('./models/companySchema').company;
const article = require('./models/article').article;
const mongoose = require('mongoose');

function macd(lines, sentiment){

	var result = [];

	var ema_short_window = 12;
	var ema_long_window = 26;
	var macd_window = 9;

	// var lines = [100, 10, 3, 0, 150, 8];
	var ema_short = 0.0;
	var ema_long = 0.0;
	var ema_macd = 0.0;/* called SIGNAL */
	const alpha_short = 2 / (ema_short_window+1);
	const alpha_long = 2 / (ema_long_window+1);
	const alpha_macd = 2 / (macd_window+1);

	for(var i = 0; i < lines.length; i++){
		var v = lines[i].close;
		ema_short = alpha_short * v + (1 - alpha_short)*ema_short;
		ema_long = alpha_long * v + (1 - alpha_long)*ema_long;
		var macd = ema_short - ema_long;
		ema_macd = alpha_macd * macd + (1 - alpha_macd) * ema_macd;
		var macd_histogram = macd - ema_macd;
		console.log('before : ' + macd_histogram);
		if(sentiment && sentiment != 0){
			macd_histogram = (macd_histogram * 40 + 60 * sentiment)/100;
			// console.log(sentiment);
		}
		console.log('after : ' + macd_histogram);
		if(lines.length - 2 >= 0){
			if(lines.length - 2 == i){
				result.push(macd_histogram);
			} else if(lines.length - 1 == i){
				result.push(macd_histogram);
			}
		}
	}
	console.log('RESULT : ' + result);
	return result;

}

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

function calculateIncreaseDecrease(ne, old){
	var diff = ne - old;
	diff = diff/old;
	diff *= 100;
	return diff;
}


var company_error_message = 'Problem finding the company!'
/* GET home page. */

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

router.get('/related', function(req, res, next) {
	var issuer = req.query.issuer;
	// return res.send({pula: 'o sugi!'});
	if(issuer){
		company.findOne({
			issuer : issuer
		}).exec(function(err, docs){
			company.find({
				details : {
					$in : docs.related_to
				}
			}).exec(function(err, companies){
				if(err){
					console.log(err);
					return res.send({error: company_error_message});
				}
				if(!companies.length){
					return res.send({error: company_error_message});
				}
				console.log('here');
				var response_object = {};
				response_object.related_to = [];
				response_object.related_to = companies;
				res.send(response_object);
			});
		});
	} else {
		res.send({error:company_error_message});
	}
});

router.get('/', function(req, res, next) {
	if(req.query.byName === 'true'){
		var obj = {};
		obj.timeSince = timeSince;
		obj.calculateIncreaseDecrease = calculateIncreaseDecrease;
		company
		.find({
			details: req.query.sym 
		})
		.select('issuer details mentioned_by daily_rating company_sentiment company_PEG related_stock company_financial_rating')
		.exec(function(err,companies){
			if(err){
				res.render('companies', {});
				return console.log(err);
			}
			if(companies.length===0){
				return res.render('companies', {message:'Company wasn\'t found!'});
			}
			// console.log(companies[0].issuer);
			obj.id = companies[0]._id;
			obj.issuer = companies[0].issuer;
			obj.details = companies[0].details;
			obj.daily_rating = companies[0].daily_rating;
			obj.company_sentiment = companies[0].company_sentiment;
			obj.company_PEG = companies[0].company_PEG;
			obj.related_stock = companies[0].related_stock;
			obj.company_financial_rating = companies[0].company_financial_rating;
			article
			.find({ link : { $in : companies[0].mentioned_by}})
			.select('sentiment description date link title')
			.sort({date : -1})
			.exec(function(err,articles){
				if(err){
					res.render('companies', obj);
					return console.log(err);
				}
				console.log(articles.length);
				obj.articles = articles;
				console.log(companies[0].company_sentiment);
				googleFinance.historical({
					symbol: companies[0].details[0],
					from: '2016-01-25'
				}, function (err, quotes) {
					if(err){
						console.log('Problem fetching historical data.'.error);
						console.log(err);
						return;
					}
					if(quotes.length === 0){
						console.log('google-finance module not working again');
					}
					obj.latest_prediction = macd(quotes, obj.company_sentiment);
					console.log(obj.latest_prediction);
					res.render('companies', obj);
				});			
			});
		});
return;
}
var obj = {};
obj.timeSince = timeSince;
obj.calculateIncreaseDecrease = calculateIncreaseDecrease;
console.log(req.query.sym);
company
.find({'_id' : req.query.sym})
.select('issuer details mentioned_by daily_rating company_sentiment company_PEG related_stock company_financial_rating')
.exec(function(err,companies){
	if(err){
		res.render('companies', {});
		return console.log(err);
	}
	if(companies.length===0){
		return res.render('companies', {message:'Company wasn\'t found!'});
	}
	obj.id = companies[0]._id;
	obj.issuer = companies[0].issuer;
	obj.details = companies[0].details;
	obj.daily_rating = companies[0].daily_rating;
	obj.company_sentiment = companies[0].company_sentiment;
	obj.company_PEG = companies[0].company_PEG;
	obj.related_stock = companies[0].related_stock;
	obj.company_financial_rating = companies[0].company_financial_rating;
	article
	.find({ link : { $in : companies[0].mentioned_by}})
	.select('sentiment description date link title')
	.sort({date : -1})
	.exec(function(err,articles){
		if(err){
			res.render('companies', obj);
			return console.log(err);
		}
		console.log(articles.length);
		obj.articles = articles;
		console.log(companies[0].company_sentiment);
		googleFinance.historical({
			symbol: companies[0].details[0],
			from: '2016-01-25'
		}, function (err, quotes) {
			if(err){
				console.log('Problem fetching historical data.'.error);
				console.log(err);
				return;
			}
			if(quotes.length === 0){
				console.log('google-finance module not working again');
			}
			obj.latest_prediction = macd(quotes, obj.company_sentiment);
				// obj.conclusion = 
				console.log(obj.latest_prediction);
				res.render('companies', obj);
			});			
	});
});
});

module.exports = router;
