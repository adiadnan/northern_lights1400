var express = require('express');
var router = express.Router();

const company = require('./models/companySchema').company;
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
	company.find({})
	.select('issuer daily_rating company_sentiment')
	.sort({daily_rating:-1})
	.exec(
		function(err,companies){
		if(err){
			return console.log(err);
		}
		console.log(companies.length);
		if(companies.length === 0){
			res.render('trending', {relevant_data:[]});
			return;
		}
		res.render('trending', {relevant_data:companies});
	})
});

module.exports = router;
