const google_finance = require('google-finance');
const AlchemyAPI = require('alchemyapi');
const mongoose = require('mongoose');
const mongojs = require('./scripts/mongojs');
const yahoo = require('finance-scraper-js').yahoo;
const assert = require('assert');
const googleFinance = require('google-finance');

/* custom-made modules */
const linkFeed = require('./models/linkFeedSchema').linkFeed;
const company = require('./models/companySchema').company;
const article = require('./models/article').article;
const financial_data = require('./models/financial_data').financial_data;
const nasdaq_companies_handler = require('./scripts/nasdaq_companies_handler');
const country_rating = require('./country_rating');
const async = require('async');
const colors = require('colors');

const alchemy = new AlchemyAPI();

var COMPANY_LIST = ['HGSH'];

colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

var times = 1;
var executionInterval = 15000;
var secondExecutionInterval = 10000;

// setInterval(function(){
// 	console.log((times * 5) + ' minutes passed.');
// 	times++;
company.find({}, function(err,docs){
	if(err){
		return console.log(err);
	}
	docs.forEach(function(item, index){
		item.related_to.forEach(getCompanyNews);
	});
});
	// main(COMPANY_LIST);
	// setTimeout(function(){
	// 	log('Secondary function called.');
	// correct_database();
		// add_stock_financial_data(companies);
	// }, secondExecutionInterval);
// }, executionInterval);

function main(companyList){
	companyList.forEach(getCompanyNews);
}

function getCompanyNews(companySymbol, index){
	console.log('Handling news for ' + companySymbol);
	var obj = buildCompanyObject(companySymbol);
	google_finance.companyNews(obj,
		function(err, news){
			if(err){
				console.log(('ERROR: Problem with the company: ' + companySymbol).error);
				return console.log(err);
			}
			var length = news.length;
			if(length === 0){
				return console.log(('Problem with the company: ' + companySymbol).error);
			}

			news.forEach(
				function(item, index){
					getCompanyFeeds(item);
				});
			news.forEach(
				function(item, index){
					getCompanyRating(item);
				});
		});
}

function getCompanyFeeds(news){
	console.log('Fetching feeds for company.'.info);
	var main_company_symbol = news.symbol;
	var url = news['link'];
	var save_object = {
		link : url,
		has_feed : false,
		link_feeds : []
	}
	console.log(('Checking feed existence for ' + url).info);
	linkFeed.findOne({link : url}, function(err,feed){
		if(err){
			return console.log(err);
		}
		if(feed){
			if(!feed.has_feed){
				console.log('Feed found. The url has NO feeds available.'.info);
				return console.log(('url : ' + feed.link).info);
			} else {
				console.log('Feed found. The url HAS feeds available.'.info);
				return console.log(('url : ' + feed.link).info);
			}
		}
		console.log('Feed isn\'t in the DB.'.info);
		alchemy.feeds('url', url, {}, function(response){
			if(response['status']!=='OK'){
				console.log(('ALCHEMY STATUS : ' + response['status']).error);
				return;
			}
			var output = response['feeds'];
			if(output.length === 0){
				console.log('Saving new feed in DB.'.info);
				var new_feed = new linkFeed(save_object);
				return new_feed.save(function(err){
					if(err){
						console.log(err);
					}
					console.log('Saved the feed without feeds!!'.info);
				});
			}
			console.log('Saving new feed in DB.'.info);
			save_object.has_feed = true;
			save_object.link_feeds = buildFeedList(output);
			var new_feed = new linkFeed(save_object);
			new_feed.save(
				function(err){
					if(err){
						return console.log(err);
					}
					console.log('Saved feed with feeds to Mongo'.info);
				});
		});
	});
}
/* WARNING!!!!!!!!! 15 API CALLS PER ARTICLE */
function getCompanyRating(news, index){
	
	var main_company_symbol = news.symbol;

	article.findOne({link:news.link}, function(err, art){
		if(err){
			return console.log(err);
		}
		if(art){
			var result_object = buildArticleObject(news);
			result_object.sentiment = art.sentiment;
			result_object.keywords = art.keywords;
			result_object.concepts = art.concepts;
			result_object.entities = buildEntityObject(art.entities);
			company_handler(main_company_symbol, news.link, result_object);
			return;
		}
		var result_object = buildArticleObject(news);
		alchemy.text('url', result_object.link, null,
			function(response) {

				if(response['status']!=='OK'){
					console.log(('ALCHEMY URL STATUS : ' + response['status']).error);
					return;
				}
				result_object.content = response.text;
				var t = result_object.content;

				alchemy.sentiment('text',t,null,
					function(response){

						if(response['status'] !== 'OK'){
							console.log(('ALCHEMY SENTIMENT STATUS : ' + response['status']).error);
							return;
						}
						result_object.sentiment = response.docSentiment;

						alchemy.combined('url', result_object.link, {'sentiment': 1}, 
							function(response){
								if(response['status'] !== 'OK'){
									console.log(('ALCHEMY COMBINED STATUS : ' + response['status']).error);
									return;
								}
								result_object.keywords = response.keywords;
								result_object.concepts = response.concepts;
								result_object.entities = buildEntityObject(response.entities);
								article.update({
									link: news.link
								}, {
									$setOnInsert: result_object
								},{
									upsert: true
								}, function(err, num){
									if(err){
										console.log(err);
										return console.log('Problem updating the article database.'.error);
									}
									if(num === 0){
										console.log('No document updated. '.error);
										return;
									}
									console.log('article updated.'.info);
								});
								company.find({details : main_company_symbol},function(err,cm){
									if(err){
										return console.log(err);
									}
									console.log('Company with symbol ' + main_company_symbol + ' is :');
									// console.log(cm);
									// update_company_list([main_company_symbol]);
									company_handler(main_company_symbol, news.link, result_object, cm);
								})

							});
});
});
// }

});
// }
}

function company_handler(main_company_symbol, link, result_object, cm){

	var option = {format: 'aarray',	toNumber: true};
	yahoo.getKeyStatistics(main_company_symbol, option, function (error, report) {
		if (error) {
			console.log(error);
		}
		var issuer_name = nasdaq_companies_handler.findIssuer(main_company_symbol);
		var oop = nasdaq_companies_handler.company_name_complete_match(issuer_name);
		if(oop === -1 || oop.length === 0){
			oop = nasdaq_companies_handler.company_name_partial_match(issuer_name);
		}
		var new_company = {};
		if(oop === -1 || oop.length === 0){
			new_company.details = [];
			console.log('Company isn\'t worth adding to the DB.'.info);
			return;
		} else {
			oop = buildCompanyDetailsObject(oop);
		}
		var temp = inter_companyRelations(main_company_symbol, result_object.entities, link);
		// update_company_list(temp);
		new_company.company_financial_rating = 0;
		new_company.company_PEG = 0;
		if(report){
			if(report[0]['Qtrly Earnings Growth (yoy)'] === 'N/A'){
				new_company.company_financial_rating = 0;
			} else {
				new_company.company_financial_rating = report[0]['Qtrly Earnings Growth (yoy)'];
			}
			if(report[0]['PEG Ratio (5 yr expected)'] === 'N/A'){
				new_company.company_PEG = 0;
			} else {
				new_company.company_PEG = report[0]['PEG Ratio (5 yr expected)'];
			}
		}
		var val = parseFloat(result_object.sentiment.score);
		// console.log('VAal ' + val);
		new_company.company_sentiment = []
		new_company.company_sentiment.push(val);
		var new_val = 0;
		if(cm){
			new_val = (2 * new_val + 8 * result_object.sentiment.score) / 10;
		} else {
			new_val = result_object.sentiment.score;
		}
		if(oop){
			googleFinance.historical({
				symbol : main_company_symbol,
				from : '2016-01-01'
			},
			function(err, quotes){
				if(err){
					console.log('Problem fetching historical data.'.error);
					console.log(err);
					return;
				}
				if(!quotes.length){
					return;
				}
				var macd_data = macd(quotes, new_val);
				company.update({issuer: issuer_name},
				{
					company_sentiment : new_val,
					$addToSet : {
						related_to: {
							$each: temp
						},
						mentioned_by: {
							$each: [link]
						},
						details: { $each: oop}
					},
					daily_rating: macd_data[macd_data.length - 1],
					company_financial_rating: new_company.company_financial_rating,
					company_PEG: new_company.company_PEG
				},{
					upsert: true
				}, function(err, num){
					if(err){
						console.log(err);
						return console.log('Problem updating the database.'.error);
					}
					if(num === 0){
						console.log('No document updated. '.error);
						return;
					}
					console.log('Company updated.'.info);
				});
			});
}
});
}

function inter_companyRelations(main_company_symbol, concept_list, link){
	var result = [];
	var issuer = nasdaq_companies_handler.findIssuer(main_company_symbol);
	if(issuer === -1){
		return -1;
	}
	for(var i = 0;i < concept_list.length;i++){
		var t = concept_list[i].text;
		var c = nasdaq_companies_handler.company_name_complete_match(t);
		if(c === -1 || c.length === 0){
			c = nasdaq_companies_handler.company_name_partial_match(t);
		}
		if(c === -1 || c.length === 0){
			continue;
		}
		if(c[0].issuer !== issuer){
			insertCompaniesRelatedToMainCompany(main_company_symbol, link, c);
			for(var j = 0; j < c.length; j++){
				result.push(c[j].symbol);
			}
		}
	}
	return result;
}

function insertCompaniesRelatedToMainCompany(main_company_symbol, link, c){
	var issuer = nasdaq_companies_handler.findIssuer(main_company_symbol);

	c.forEach(
		function(item, index){
			var option = {format: 'aarray',	toNumber: true};
			yahoo.getKeyStatistics(item.details[0], option, 
				function (error, report) {
					if (error) {
						return console.log(error); 
					}
					var _t = {};
					_t.company_financial_rating = 0;
					_t.company_PEG = 0;
					_t.details = [];
					_t.related_to = [];
					_t.mentioned_by = [];
					if(report){
						if(report[0]['Qtrly Earnings Growth (yoy)'] === 'N/A'){
							_t.company_financial_rating = 0;
						} else {
							_t.company_financial_rating = report[0]['Qtrly Earnings Growth (yoy)'];
						}
						if(report[0]['PEG Ratio (5 yr expected)'] === 'N/A'){
							_t.company_PEG = 0;
						} else {
							_t.company_PEG = report[0]['PEG Ratio (5 yr expected)'];
						}
					}
					_t.issuer = item.issuer;
					var oop = nasdaq_companies_handler.company_name_complete_match(item.issuer);
					if(oop === -1 || oop.length === 0){
						oop = nasdaq_companies_handler.company_name_partial_match(item.issuer);
					}
					if(oop === -1 || oop.length === 0){
						_t.details = [];
					} else {
						_t.details = buildCompanyDetailsObject(oop);
					}
					if(oop){
						googleFinance.historical({
							symbol : item.symbol,
							from : '2016-01-01'
						},
						function(err, quotes){
							if(err){
								console.log('Problem fetching historical data.'.error);
								console.log(err);
								return;
							}
							if(!quotes.length){
								return;
							}
							var macd_data = macd(quotes, 0);
							// update_company_list(_t.details);
							company.update({issuer: _t.issuer},
							{
								$addToSet : {
									related_to: {$each:[main_company_symbol]},
									mentioned_by: { $each: [link]},
									details: { $each: _t.details}
								},
								daily_rating: macd_data[macd_data.length - 1],
								company_financial_rating: _t.company_financial_rating,
								company_PEG: _t.company_PEG
							},{
								upsert: true
							}, function(err, num){
								if(err){
									console.log(err);
									return console.log('Problem updating the database.'.error);
								}
								if(num === 0){
									console.log('No document updated. '.error);
									return;
								}
								console.log('Company updated.'.info);
							});
						});
}
});
});
}

function correct_database(){
	company.find({},null, null,
		function(err, companies){
			if(err){
				console.log(err);
				return console.log('Problem correcting the database.'.error);
			}
			// console.log(companies);
			companies.forEach(function(item,index){
				var option = {format: 'aarray',	toNumber: true};
				yahoo.getKeyStatistics(item.details[0], option, 
					function (error, report) {
						if (error) {
							console.log(item.symbol);
							return console.log(error); 
						}
						var _t = {};
						_t.company_financial_rating = 0;
						_t.company_PEG = 0;
						if(report){
							if(report[0]['Qtrly Earnings Growth (yoy)'] === 'N/A'){
								_t.company_financial_rating = 0;
							} else {
								_t.company_financial_rating = report[0]['Qtrly Earnings Growth (yoy)'];
							}
							if(report[0]['PEG Ratio (5 yr expected)'] === 'N/A'){
								_t.company_PEG = 0;
							} else {
								_t.company_PEG = report[0]['PEG Ratio (5 yr expected)'];
							}
							var imp = 0;
							if(allNumbersNotZero([country_rating.getRating(),item.company_financial_rating,item.company_PEG,item.related_stock,item.company_sentiment])){
								imp = (20*country_rating.getRating()+25*item.company_financial_rating+25*item.company_PEG+35*item.related_stock+50*item.company_sentiment)/155;
							}
							company.update({
								issuer: item.issuer
							},{
								company_financial_rating: _t.company_financial_rating,
								company_PEG: _t.company_PEG,
								company_rating: imp
							},null,function(err,num){
								if(err){
									console.log(err);
								}
								console.log(num);
							});
						}
					});
});
			// async.parallel([
			// 	function(){
			// 		update_related_stock_entries(companies);
			// 	},
			// 	function(){
			// 		// add_stock_financial_data(companies);
			// 	}],
			// 	function(err){
			// 		if(err){
			// 			console.log(err);
			// 			return;
			// 		}
			// 	});

});
}
function allNumbersNotZero(list){
	var all_not_zero = true;
	for(var i = 0; i < list.length; i++){
		if(list[i] === 0){
			return false;
		}
	}
	return all_not_zero;
}

function update_related_stock_entries(companies){
	var parsed_companies = [];
	for(var index = 0; index < companies.length - 1; index++){
		var parsed = false;
		for(var j = 0; j < parsed_companies.length; j++){
			if(companies[index].issuer === parsed_companies[j]){
				parsed = true;
				break;
			}
		}
		if(parsed == false){
			var new_or = [];
			console.log('Finding for ' + companies[index].issuer);
			var temp = [companies[index]];
			temp.forEach(function(item, index){
				company.where('details').in(item.related_to)
				.exec(
					function(err, cs){
						var avg = 0;
						var num = 0;
						for(var i =0; i < cs.length; i++){
							if(cs[i].company_sentiment !== 0){
								avg += cs[i].company_sentiment;
								num++
							}
						}
						if(avg !== 0 && num !== 0){
							avg = avg / num;
							if(item.related_stock === avg){
								console.log('Related stock index same as before. Skiping update.'.info);
								return;
							}
							company.update({issuer: item.issuer}, {related_stock: avg},
								function(err, num){
									if(err){
										console.log(err);
										return console.log('Problem updating the database.'.error);
									}
									if(num === 0){
										console.log('No document updated. '.error);
										return;
									}
									console.log(('Index updated for company ' + item.issuer).info);
								});
							return;
						}
					});
			});
			parsed_companies.push(companies[index].issuer);
		}
	}
}

function add_stock_financial_data(companies){
	var parsed_companies = [];
	companies.forEach(function(item, index){
		var parsed = false;
		for(var j = 0; j < parsed_companies.length; j++){
			if(item.issuer === parsed_companies[j]){
				parsed = true;
				return;
			}
		}
		if(parsed == false){
			// item.details.forEach(function(it, ind){

				googleFinance.historical({
					symbols : item.details,
					from: '2016-01-01' 
				},
				function(err, quotes){
					if(err){
						console.log('Problem fetching historical data.'.error);
						console.log(err);
						return;
					}
					if(!quotes.length){
						return;
					}
					var obj = {};
					obj.symbol = quotes[0].symbol;
					obj.data = quotes;
					financial_data.update({
						symbol: obj.symbol
					},{
						$setOnInsert: obj
					},{
						upsert: true
					},function(err, num){
						if(err){
							console.log(err);
							return console.log('Problem updating the database.'.error);
						}
						if(num === 0){
							console.log('No document updated. '.error);
							return;
						}
						console.log(('Financial data updated for company ' + obj.symbol).info);
					});
				});
			// });
parsed_companies.push(item.issuer);
}
});
}

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
		if(sentiment){
			macd_histogram = (macd_histogram * 30 + 70 * sentiment)/100;
		}
		if(lines.length - 2 >= 0){
			if(lines.length - 2 == i){
				result.push(macd_histogram);
			} else if(lines.length - 1 == i){
				result.push(macd_histogram);
			}
		}
		// console.log('closing price: ' + v);
		// console.log(ema_short);
		// console.log(ema_long);
		// console.log('macd : ' + macd);
		// console.log('ema macd : ' + ema_macd);
		// console.log('histogram : ' + macd_histogram);
	}
	// console.log('RESULT : ' + result);
	return result

}

function update_company_list(related_to){
	var result = [];
	if(related_to === undefined){
		return;
	}
	if(related_to.length === 0){
		return;
	}
	var length = COMPANY_LIST.length;
	for(var i = 0; i < related_to.length; i++){
		var found = false;
		for(var j = 0; j < length; j++){
			if(COMPANY_LIST[j] === related_to[i]){
				found = true;
			}
		}
		if(found === false){
			// console.log(COMPANY_LIST);
			result.push(related_to[i]);
		}
	}
	main(result);
}

function removeObjectFromList(companies,id){
	for(var i = 0; i < companies.length; i++) {
		if(companies[i]._id === id) {
			companies.splice(i, 1);
			i--;
			console.log(('ERASED : ' + companies[i].issuer).info);
		}
	}
	return companies;

}

function updateCompanyLinkList(issuer, link_list, link){
	var has_link = false;
	if(link_list.length === 0){
		return -1;
	}
	if(link === '' || link === undefined){
		return -1;
	}
	for(var i = 0; i < link_list.length; i++){
		var l = link_list[i];
		if(l === link){
			has_link = true;
			break;
		}
	}
	if(!has_link){
		return -1;
	}
	link_list.push(link);
	return link_list;
}

function buildArticleObject(news){
	var result_object = {};
	result_object.link = news.link;
	result_object.title = news.title;
	result_object.description = news.description;
	result_object.date = news.date;
	return result_object;
}

function buildEntityObject(obj){
	var reply = [];
	for(var i = 0 ; i < obj.length; i++){
		var o = obj[i];
		var t = {};
		t.type = o.type;
		t.relevance = o.relevance;
		t.count = o.count;
		t.text = o.text;
		t.quotations = o.quotations;
		t.sentiment = o.sentiment;
		reply.push(t);
	}
	return reply;
}

function buildCompanyDetailsObject(nasdaq_list){
	var list = [];
	for(var index = 0; index < nasdaq_list.length; index++){
		var obj = {};
		obj.symbol = nasdaq_list[index].symbol;
		obj.category = nasdaq_list[index].category;
		obj.security = nasdaq_list[index].security;
		list.push(obj.symbol);
	}
	return list;
}

function buildCompanySchemaObject(company){
	var result_object = {};
	result_object.company_name = company.issuer;
	result_object.symbol = company.symbol;
	return result_object;
}

function buildFeedList(objectList){
	var result = [];
	for(var index = 0; index < objectList.length;index++){
		result.push(objectList[index]['feed']);
	}
	return result;
}

function buildCompanyObject(companySymbol){
	return {
		symbol : companySymbol
	}
}
function log(message_list,color){
	for(var i = 0; i < message_list.length; i++){
		console.log(message_list[i].color);
	}
}