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

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

router.get('/', function(req, res, next) {
	var username = req.query.username;
	console.log(username);
	user.findOne({
		username: username
	},function(err, users){
		if(err){
			return console.log(err);
		}
		order.find({
			user: username
		}, function(err, docs){
			if(err){
				return console.log(err);
			}
			res.send({
				docs: docs,
				money: users.money_left,
			});
		});
	})
	
});

module.exports = router;