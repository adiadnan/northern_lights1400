var express = require('express');
var router = express.Router();

const company = require('./models/companySchema').company;
const mongoose = require('mongoose');

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
	var look = req.query.look;
	var lwr = look.toLowerCase();
	var upr = look.toUpperCase();
	company.find({
		$or : [{
			details: lwr
		},{
			details: upr
		}
		]

	})
	.exec(
		function(err,companies){
			if(err){
				return console.log(err);
			}
			console.log(companies.length);
			if(companies.length === 0){
				res.send({empty:1});
				return;
			}
			res.send({relevant_data:companies});
		})
});

module.exports = router;
