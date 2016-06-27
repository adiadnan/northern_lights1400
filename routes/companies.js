var express = require('express');
var router = express.Router();

var googleFinance = require('google-finance');
const request = require('request');
const cheerio = require('cheerio');
const yahoo = require('finance-scraper-js').yahoo;

const company = require('./models/companySchema').company;
const user = require('./models/userSchema').user;
const article = require('./models/article').article;
const order = require('./models/orderSchema').order;
const portofolio = require('./models/user_portofolio').portofolio;
const mongoose = require('mongoose');
const country_rating = require('./country_rating');

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
		// console.log('before : ' + macd_histogram);
		if(sentiment && sentiment != 0){
			macd_histogram = (macd_histogram * 40 + 60 * sentiment)/100;
			// console.log(sentiment);
		}
		// console.log('after : ' + macd_histogram);
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

function getLastMonth(){
	var d = new Date();
	var m = d.getMonth();
	d.setMonth(d.getMonth() - 1);
	if (d.getMonth() == m) d.setDate(0);
	d.setHours(0,0,0)

	console.log(d.getTime());
	return d;
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

router.post('/investments/platform/buy', function(req, res, next) {
	var username = req.body.user;
	var symbol = req.body.symbol;
	var amount = req.body.amount;
	user.findOne({
		username: username
	},function(err, docs){
		if(err){
			return console.log(err);
		}
		company.findOne({
			details: symbol
		}, function(err,companies){
			if(err){
				return console.log(err);
			}
			if(docs.money_left - amount * companies.latest_price < 0){
				return res.send({message: 'Insufficient funds.'});
			}
			var obj = {};
			obj.user = username;
			obj.symbol = symbol;
			obj.company_id = companies._id;
			obj.price = companies.latest_price;
			obj.amount = amount;
			obj.date_entered = new Date().getTime();
			obj.order_type = 'buy';
			var t = new order(obj);
			t.save(function(err){
				if(err){
					return console.log(err);
				}
				console.log('Order saved.');
			});
			user.update({
				username: username
			},{
				$inc : {money_left : (-1) * companies.latest_price * amount}
			},null,function(err, num){
				if(err){
					return console.log(err);
				}
				console.log(num);
			})
			res.send('success');
		})
	});
});

router.post('/investments/platform/sell', function(req, res, next) {
	var username = req.body.user;
	var symbol = req.body.symbol;
	var amount = req.body.amount;
	user.findOne({
		username: username
	},function(err, docs){
		if(err){
			return console.log(err);
		}
		company.findOne({
			details: symbol
		}, function(err,companies){
			if(err){
				return console.log(err);
			}
			order.find({
				user: username,
				symbol: symbol,
				order_type: 'buy'
			},function(err,orders){
				if(err){
					return console.log(err);
				}

				order.find({
					user: username,
					symbol: symbol,
					order_type: 'sell'
				},function(err,_orders){
					if(err){
						return console.log(err);
					}
					var max = 0;
					var _max = 0;
					for(var i = 0; i < orders.length; i++){
						max += parseFloat(orders[i].amount);
					}
					for(var i = 0; i < _orders.length; i++){
						_max += parseFloat(_orders[i].amount);
					}
					console.log(_max);
					_max += parseFloat(amount);
					if(max < _max){
						console.log(max + ' ' + _max);
						return res.send({message:'Insufficient amount of stocks.'});
					}
					var obj = {};
					console.log(companies);
					obj.user = username;
					obj.symbol = symbol;
					obj.company_id = companies._id;
					obj.price = companies.latest_price;
					obj.amount = parseFloat(amount);
					obj.date_entered = new Date().getTime();
					obj.order_type = 'sell';
					var t = new order(obj);
					t.save(function(err){
						if(err){
							return console.log(err);
						}
						console.log('Order saved.');
					});
					user.update({
						username: username
					},{
						$inc : {money_left : companies.latest_price * amount}
					},null,function(err, num){
						if(err){
							return console.log(err);
						}
						console.log(num);
						res.send({
							message: 'success',
							income: amount * companies.latest_price});
					})
				});
})

})
});
});

router.get('/investments/platform', function(req, res, next) {
	var username = req.query.user;
	user.findOne({
		username: username
	},function(err,docs){
		if(err){
			return console.log(err);
		}
		var response = '';
		response += '<div class="input-group" style="margin-top:15px">';
		response += '<span class="input-group-addon" id="basic-addon3">stock amount</span>';
		response += '<input type="number" min="1" class="form-control" id="basic-url" aria-describedby="basic-addon3" onfocusout="eventOnFocusOut()">';
		response += '</div>';
		response += '<label for="basic-url" style="margin-top:15px">Account : <span id="total_money">' + docs.money_left + '</span>$</label></br>';
		response += '<label for="basic-url" style="margin-top:15px" id="total_value">Total : <span id="stock_subtotal">0</span>$</label></br>';
		response += '<label for="basic-url" style="margin-top:15px" id="subtotal">Money left : ' + docs.money_left + '</label></br>';
		response += '<div style="display:inline-block; margin-top:15px">'
		response += '<button type="button" class="btn btn-primary" style="margin-left:10px" onclick="buyStock()">Buy</button>';
		response += '<button type="button" class="btn btn-primary" style="margin-left:10px" onclick="sellStock()">Sell</button>';
		response += '</div>'
		res.send(response);
	});
});

router.get('/finance', function(req, res, next) {
	var symbol = req.query.symbol;
	console.log('symbol:' + symbol);
	var option = {format: 'aarray',	toNumber: true};
	yahoo.getKeyStatistics(symbol, option, 
		function (error, report) {
			if (error) {
				console.log(symbol);
				return console.log(error); 
			}
			res.send(report);
		});
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
			obj.company_rating = companies[0].company_rating;
			obj.latest_var = companies[0].latest_var;
			obj.latest_price = companies[0].latest_price;
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
				articles.sort(function(a,b){
					return new Date(b.date).getTime() - new Date(a.date).getTime();
				});
				obj.articles = articles;
				console.log(companies[0].company_sentiment);
				googleFinance.historical({
					symbol: companies[0].details[0],
					from: '2013-01-25'
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
					obj.ovr = country_rating.getRating();
					obj.u = calculateIncreaseDecrease(latest_prediction[1],latest_prediction[0])
					obj.getLastMonth = getLastMonth;
					console.log('financial rating' + obj.company_financial_rating);
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
	obj.company_rating = companies[0].company_rating;
	obj.latest_var = companies[0].latest_var;
	obj.latest_price = companies[0].latest_price;
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
		articles.sort(function(a,b){
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
		obj.articles = articles;
		console.log(companies);
		googleFinance.historical({
			symbol: companies[0].details[0],
			from: '2013-01-25'
		}, function (err, quotes) {
			if(err){
				console.log('Problem fetching historical data.'.error);
				console.log(err);
				return;
			}
			if(quotes.length === 0){
				console.log('google-finance module not working again');
			}
			obj.quotes = quotes;
			// console.log(quotes.length);
			obj.latest_prediction = macd(quotes, obj.company_sentiment);
				// obj.conclusion = 
				obj.ovr = country_rating.getRating();
				obj.u = calculateIncreaseDecrease(obj.latest_prediction[1],obj.latest_prediction[0])
				obj.getLastMonth = getLastMonth;
				console.log('financial rating' + obj.company_financial_rating);
				res.render('companies', obj);
			});			
	});
});
});

module.exports = router;
