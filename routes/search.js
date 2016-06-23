var express = require('express');
var router = express.Router();

const company = require('./models/companySchema').company;
const article = require('./models/article').article;
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
	console.log(lwr + ' ' + upr + ' ' + look);
	company.find({
		$or : [{
			details: lwr
		},{
			details: upr
		},{
			details: look
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
				res.send({empty:1,message:'no_companies'});
				return;
			}
			// article.find({$or : [{
			// 	content: '/' + lwr + '/'
			// },{
			// 	content: '/' + upr + '/'
			// },{
			// 	content: '/' + look + '/'
			// },{
			// 	title: '/' + look + '/'
			// }
			// ]}).exec(function(err, articles){
			// 	if(err){
			// 		return console.log(err);
			// 	}
			// 	console.log(articles.length);
			// 	if(articles.length === 0){
			// 		res.send({empty:1,message:'no_articles'});
			// 		return;
			// 	}
				res.send({relevant_data:companies,articles: []});
			// });
		})
});

module.exports = router;
