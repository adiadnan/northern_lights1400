const google_finance = require('google-finance');
const AlchemyAPI = require('alchemyapi');
const mongoose = require('mongoose');
const mongojs = require('./scripts/mongojs');
const yahoo = require('finance-scraper-js').yahoo;
const assert = require('assert');

/* custom-made modules */
const linkFeed = require('./models/linkFeedSchema').linkFeed;
const company = require('./models/companySchema').company;
const article = require('./models/article').article;
const nasdaq_companies_handler = require('./scripts/nasdaq_companies_handler');
const country_rating = require('./country_rating');
const async = require('async');
const colors = require('colors');

const alchemy = new AlchemyAPI();

var COMPANY_LIST = ['AMZN','FB','GOOG','AAPL','MSFT','ORCL','CSCO','IBM','QCOM'];

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
// console.log('THIS IS AWESOME'.silly);

// main(COMPANY_LIST);

// correct_database();

var times = 1;
var executionInterval = 30000;
var secondExecutionInterval = 10000;


setInterval(function(){
	log((times * 5) + ' minutes passed.');
	times++;
	main(COMPANY_LIST);
	setTimeout(function(){
		log('Secondary function called.');
		correct_database();
	}, secondExecutionInterval);
}, executionInterval);




function main(companyList){
	companyList.forEach(getCompanyNews);
}

function getCompanyNews(companySymbol, index){
	log(['Handling news for ' + companySymbol]);
	var obj = buildCompanyObject(companySymbol);
	google_finance.companyNews(obj,
		function(err, news){
			if(err){
				console.log(('Problem with the company: ' + companySymbol).error);
				return console.log(err);
			}
			var length = news.length;
			if(length === 0){
				return console.log(('Problem with the company: ' + companySymbol).error);
			}

			async.each(news,
				function(item){
					getCompanyFeeds(item);
				},
				function(err){
					if(err){
						console.log('Error async'.error);
						return console.log(err);
					}
					console.log('Finished executing every thread.'.debug);
				});
			async.each(news,
				function(item){
					getCompanyRating(item);
				},
				function(err){
					if(err){
						console.log('Error async'.error);
						return console.log(err);
					}
					console.log('Finished executing every thread.'.debug);
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
/* WARNING!!!!!!!!! 5 API CALLS PER ARTICLE */
function getCompanyRating(news, index){
	
	var main_company_symbol = news.symbol;

	article.findOne({link:news.link}, function(err, art){
		if(err){
			return console.log(err);
		}
		if(art){
			log(['Article IS in the database.', 'Parsing article : ' + news.title],colors.info);
			var issuer_name = nasdaq_companies_handler.findIssuer(main_company_symbol);
			company.findOne({issuer : issuer_name},function(err, com){
				console.log(('Trying to find company ' + issuer_name).info);
				if(err){
					return console.log(err);
				}
				if(com){
					for(var i = 0; i < com.mentioned_by.length; i++){
						if(com.mentioned_by[i] === news.link){
							console.log('Company was mentioned before by this article.'.error);
							return;
						}
					}
				}
				console.log('Company wasn\'t mentioned before by this article.');
				var result_object = buildArticleObject(news);
				result_object.sentiment = art.sentiment;
				result_object.keywords = art.keywords;
				result_object.concepts = art.concepts;
				result_object.entities = buildEntityObject(art.entities);
				company_handler(main_company_symbol, news.link, result_object);
				return;
			});
		}

		if(!art){
			log(['Article isn\'t in the database.', 'Adding the article : ' + news.title],colors.info);

			var result_object = buildArticleObject(news);
			alchemy.text('url', result_object.link, null,
				function(response) {

					if(response['status']!=='OK'){
						console.log(('ALCHEMY STATUS : ' + response['status']).error);
						return;
					}
					result_object.content = response.text;
					var t = result_object.content;

					alchemy.sentiment('text',t,null,
						function(response){

							if(response['status'] !== 'OK'){
								console.log(('ALCHEMY STATUS : ' + response['status']).error);
								return;
							}
							result_object.sentiment = response.docSentiment;

							alchemy.combined('url', result_object.link, {'sentiment': 1}, 
								function(response){
									if(response['status'] !== 'OK'){
										console.log(('ALCHEMY STATUS : ' + response['status']).error);
										return;
									}
									result_object.keywords = response.keywords;
									result_object.concepts = response.concepts;
									result_object.entities = buildEntityObject(response.entities);

									var new_article = new article(result_object);
									new_article.save(
										function(err){
											if(err){
												return console.log(err);
											}
											console.log('Saved article to DB.'.info);
										});
									company_handler(main_company_symbol, news.link, result_object);

								});
						});
				});
}

});
// }
}

function company_handler(main_company_symbol, link, result_object){
	var issuer_name = nasdaq_companies_handler.findIssuer(main_company_symbol);
	company.findOne({issuer : issuer_name}, 
		function(err, com){
			console.log(('Trying to find company ' + issuer_name).info);
			if(err){
				return console.log(err);
			}
			if(com){
				console.log('Company is in the database.'.info);
				com.mentioned_by.push(link);
				if(com.company_sentiment !== 0){
					com.company_sentiment = ( com.company_sentiment + parseFloat(result_object.sentiment.score)) / 2;
				} else {
					com.company_sentiment = parseFloat(result_object.sentiment.score);
				}
				var temp = inter_companyRelations(main_company_symbol, result_object.entities, link);
				for(var i = 0; i < temp.length; i++){
					var exists = false;
					for(var j = 0; j < com.related_to.length; j++){
						if(temp[i] === com.related_to[j]){
							exists = true;
						}
					}
					if(!exists){
						com.related_to.push(temp[i]);
					}
				}
				console.log('Company updated.'.info);
				com.save();
			}
			if(!com){
				console.log('Company isn\'t in the database.'.info);
				var new_company = {};
				new_company.issuer = issuer_name;
				var oop = nasdaq_companies_handler.company_name_complete_match(new_company.issuer);
				if(oop === -1 || oop.length === 0){
					oop = nasdaq_companies_handler.company_name_partial_match(new_company.issuer);
				}
				if(oop === -1 || oop.length === 0){
					new_company.details = [];
					return;
				} else {
					new_company.details = buildCompanyDetailsObject(oop);
				}
				new_company.company_sentiment = parseFloat(result_object.sentiment.score);
				new_company.related_to = inter_companyRelations(main_company_symbol,result_object.entities, link);
				var option = {format: 'aarray',	toNumber: true};
				yahoo.getKeyStatistics(main_company_symbol, option, function (error, report) {
					if (error) {
						console.log(error.error);
					}
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
					new_company.mentioned_by = [];
					new_company.mentioned_by.push(link);
					var sn = new company(new_company);
					sn.save(function(err){
						if(err){
							console.log(err);
							return console.log('Problem saving the new company.'.error);
						}
						console.log('New company successfully saved.'.info);
					});
				});
				return;
			}
			console.log('Company is in the database.'.info);
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
	async.each(c, function(item){
		company.findOne({issuer : item.issuer}, function(err, com){
			if(err){
				console.log(err);
				return log(['Problem finding company', 'No relations established with ' + item.issuer + '.']);
			}
			if(!com){
				var _t = {};
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
				company.update({issuer : issuer},{$push : {related_to : _t.details[0].symbol}},{upsert:true},
					function(err){
						if(err){
							console.log(err);
						}else{
							console.log("Successfully added");
						}
					});
				var option = {format: 'aarray',	toNumber: true};
				yahoo.getKeyStatistics(item.symbol, option, 
					function (error, report) {
						if (error) {
							console.log(error); 
						}
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
						_t.related_to = main_company_symbol;
						_t.mentioned_by = [];
						_t.mentioned_by.push(link);
						var n_company = new company(_t);
						n_company.save(
							function(err){
								if(err){
									console.log(err);
									return console.log('Problem adding the baby company.'.error);
								}
								log(['New company successfully added.',_t]);
							});
					});
				return;
			}

			if(com){
				var y = updateCompanyLinkList(com.issuer,com.mentioned_by,link);
				if(y === -1){
					y = [];
				}
				company.update({issuer : item.issuer}, {
					$push : {
						mentioned_by: y
					},
					$push : {
						related_to: main_company_symbol
					}
				});
			}
		});
},
function(err){
	if(err){
		console.log('Error async');
		return console.log(err);
	}
	console.log('Finished executing every thread.');
});
}

function correct_database(){
	company.find({},null, null,
		function(err, companies){
			if(err){
				console.log(err);
				return console.log('Problem correcting the database.'.error);
			}
			if(companies.length === 0){
				console.log('Database is empty, aparently.'.rainbow);
				return;
			}
			debugger;
			var new_companies_list = [];
			var parsed_companies = [];
			for(var index = 0; index < companies.length - 1; index++){
				var parsed = false;
				for(var j = 0; j < parsed_companies.length; j++){
					if(companies[index].issuer === parsed_companies[j]){
						parsed = true;
					}
				}
				if(parsed == false){
					var tempSet = [];
					for(var g = index; g < companies.length; g++){
						if(companies[index].issuer === companies[g].issuer){
							tempSet.push({
								issuer: companies[g].issuer,
								mentioned_by: companies[g].mentioned_by,
								related_to: companies[g].related_to,
								daily_rating: companies[g].daily_rating,
								company_rating: companies[g].company_rating,
								related_stock: companies[g].related_stock,
								country_rating: companies[g].country_rating,
								company_PEG: companies[g].company_PEG,
								company_sentiment: companies[g].company_sentiment,
								company_financial_rating: companies[g].company_financial_rating,
								details: companies[g].details
							});
						}
					}
					parsed_companies.push(companies[index].issuer);
					new_companies_list.push(buildSingularObject(tempSet));
				}
			}
			debugger;
			company.remove({}, function(err, removed){
				if(err){
					return console.log(err);
				}
				// if(removed.ok !== 1){
				// 	console.log('Problem removing all the companies.'.error);
				// } else {
				// 	console.log(removed.n + ' companies successfully removed.');
				// }
				console.log(('Removed the entire collection.').info);
			});
			debugger;
			for(var index = 0; index < new_companies_list.length; index++){
				console.log(new_companies_list[index].company_sentiment);
				var new_company = new company(new_companies_list[index]);
				new_company.save(function(err){
					if(err){
						console.log('Problem saving the corrected company.'.error);
						return console.log(err);
					}
					console.log('Company saved.'.info);
				});
			}
			debugger;
		});
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

function buildSingularObject(companies){
	var result = {};
	result.issuer = companies[0].issuer;
	result.company_financial_rating = 0;
	result.company_PEG = 0;
	result.details = [];
	result.related_to = [];
	result.mentioned_by = [];
	result.company_sentiment = 0;
	for(var index = 0; index < companies.length; index++){
		if(companies[index].company_PEG !== 0 && companies[index].company_PEG !== 'N/A'){
			result.company_PEG = companies[index].company_PEG;
			break;
		}
	}
	for(var index = 0; index < companies.length; index++){
		if(companies[index].company_financial_rating !== 0 && companies[index].company_financial_rating !== 'N/A'){
			result.company_financial_rating = companies[index].company_financial_rating;
			break;
		}
	}
	/* details object */
	result.details = [];
	for(var index = 0; index < companies.length; index++){
		var d = companies[index].details;
		for(var j = 0; j < d.length; j++){
			var exists = false;
			for(var i = 0; i < result.details.length; i++){
				if(d[j].symbol === result.details[i].symbol){
					exists = true;
				}
			}
			if(!exists){
				result.details.push(d[j]);
			}
		}
	}

	result.related_to = [];
	for(var index = 0; index < companies.length; index++){
		var r = companies[index].related_to;
		for(var i = 0; i < r.length; i++){
			var exists = false;
			for(var j = 0; j < result.related_to.length;j++){
				if(r[i] === result.related_to[j]){
					exists = true;
				}
			}
			if(!exists){
				result.related_to.push(r[i]);
			}
		}
	}

	result.mentioned_by = [];
	for(var index = 0; index < companies.length; index++){
		var m = companies[index].mentioned_by;
		for(var j = 0; j < m.length; j++){
			var exists = false;
			for(var i = 0; i < result.mentioned_by.length; i++){
				if(m[j] === result.mentioned_by[i]){
					exists = true;
				}
			}
			if(!exists){
				result.mentioned_by.push(m[j]);
			}
		}
	}
	debugger;
	var new_company_sentiment = 0;
	var num = 0;
	for(var index = 0; index < companies.length; index++){
		if(typeof companies[index].company_sentiment != 'number'){
			continue;
		}
		if(companies[index].company_sentiment !== 0){
			console.log('SENTIMENTS ' + companies[index].company_sentiment);
			new_company_sentiment += companies[index].company_sentiment;
			num++;
		}
	}
	if(new_company_sentiment !== 0 && num !== 0){
		result.company_sentiment = ( new_company_sentiment / num );
	} else {
		result.company_sentiment = 0;
	}
	debugger;
	return result;
}

function getIndividualCompanies(){

}

function setCompanySentiment(){

}

function buildConcepts(concepts){

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
		list.push(obj);
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