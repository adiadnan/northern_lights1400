var google_finance = require('google-finance');
var AlchemyAPI = require('alchemyapi');
var mongoose = require('mongoose');
var mongojs = require('./scripts/mongojs');
var yahoo = require('finance-scraper-js').yahoo;
var assert = require('assert');
/* custom-made modules */
var linkFeed = require('./models/linkFeedSchema').linkFeed;
var company = require('./models/companySchema').company;
var article = require('./models/article').article;
var nasdaq_companies_handler = require('./scripts/nasdaq_companies_handler');
var country_rating = require('./country_rating');
var async = require('async');

var alchemy = new AlchemyAPI();

var company_list = ['FB','GOOG'];

// main(company_list);

correct_database();

function main(companyList){
	companyList.forEach(getCompanyNews);
}

function getCompanyNews(companySymbol, index){
	log(['Handling news for ' + companySymbol]);
	var obj = buildCompanyObject(companySymbol);
	google_finance.companyNews(obj,
		function(err, news){
			if(err){
				console.log('Problem with the company: ' + companySymbol);
				return console.log(err);
			}
			var length = news.length;
			if(length === 0){
				return console.log('Problem with the company: ' + companySymbol);
			}
			// getCompanyFeeds(news);
			// news.forEach(getCompanyFeeds);
			async.each(news,
				function(item){
					// database_correction_callback(item);
					getCompanyFeeds(item);
				},
				function(err){
					if(err){
						console.log('Error async');
						return console.log(err);
					}
					console.log('Finished executing every thread.');
				});
			// news.forEach(getCompanyRating);
			async.each(news,
				function(item){
					getCompanyRating(item);
				},
				function(err){
					if(err){
						console.log('Error async');
						return console.log(err);
					}
					console.log('Finished executing every thread.');
				});
			// getCompanyRating(companySymbol, news);
		});
}

function getCompanyFeeds(news){
	console.log('Fetching feeds for company.');
	var main_company_symbol = news.symbol;
	var url = news['link'];
	var save_object = {
		link : url,
		has_feed : false,
		link_feeds : []
	}
	console.log('Checking feed existence for ' + url);
	linkFeed.findOne({link : url}, function(err,feed){
		console.log('here');
		if(err){
			return console.log(err);
		}
		if(feed){
			if(!feed.has_feed){
				console.log('Feed found. The url has NO feeds available.');
				return console.log('url : ' + feed.link);
			} else {
				console.log('Feed found. The url HAS feeds available.');
				return console.log('url : ' + feed.link);
			}
		}
		console.log('Feed isn\'t in the DB.');
		alchemy.feeds('url', url, {}, function(response){
			if(response['status']!=='OK'){
				console.log('ALCHEMY STATUS : ' + response['status']);
				return;
			}
			var output = response['feeds'];
			if(output.length === 0){
				console.log('Saving new feed in DB.');
				var new_feed = new linkFeed(save_object);
				return new_feed.save(function(err){
					if(err){
						console.log(err);
					}
					console.log('Saved the feed without feeds!!');
				});
			}
			console.log('Saving new feed in DB.');
			save_object.has_feed = true;
			save_object.link_feeds = buildFeedList(output);
			var new_feed = new linkFeed(save_object);
			new_feed.save(function(err){
				if(err){
					return console.log(err);
				}
				console.log('Saved feed with feeds to Mongo');
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
			log(['Article IS in the database.', 'Parsing article : ' + news.title]);
			var result_object = buildArticleObject(news);
			result_object.sentiment = art.sentiment;
			result_object.keywords = art.keywords;
			result_object.concepts = art.concepts;
			result_object.entities = buildEntityObject(art.entities);
			company_handler(main_company_symbol, news.link, result_object);
			return;
		}

		if(!art){
			log(['Article isn\'t in the database.', 'Adding the article : ' + news.title]);

			var result_object = buildArticleObject(news);
			alchemy.text('url', result_object.link, null, function(response) {

				if(response['status']!=='OK'){
					console.log('ALCHEMY STATUS : ' + response['status']);
					return;
				}
				result_object.content = response.text;
				var t = result_object.content;

				alchemy.sentiment('text',t,null,function(response){

					if(response['status']!=='OK'){
						console.log('ALCHEMY STATUS : ' + response['status']);
						return;
					}
					result_object.sentiment = response.docSentiment;

					alchemy.combined('url', result_object.link, {'sentiment' : 1}, function(response){
						if(response['status']!=='OK'){
							console.log('ALCHEMY STATUS : ' + response['status']);
							return;
						}
						result_object.keywords = response.keywords;
						result_object.concepts = response.concepts;
						// console.log(response);
						result_object.entities = buildEntityObject(response.entities);

						var new_article = new article(result_object);
						new_article.save(function(err){
							if(err){
								return console.log(err);
							}
							console.log('Saved article to DB.');
						});
							///
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
	company.findOne({issuer : issuer_name}, function(err, com){
		console.log('Trying to find company ' + issuer_name);
		if(err){
			return console.log(err);
		}
		if(!com){
			console.log('Company isn\'t in the database.');
			var new_company = {};
			new_company.issuer = issuer_name;
			var oop = nasdaq_companies_handler.company_name_complete_match(new_company.issuer);
			if(oop === -1 || oop.length === 0){
				oop = nasdaq_companies_handler.company_name_partial_match(item.issuer);
			}
			if(oop === -1 || oop.length === 0){
				new_company.details = [];
			} else {
				new_company.details = buildCompanyDetailsObject(oop);
			}
			new_company.company_sentiment = parseFloat(result_object.sentiment.score);
			new_company.related_to = inter_companyRelations(main_company_symbol,result_object.concepts, link);
			option = {format: 'aarray',	toNumber: true};
			yahoo.getKeyStatistics(main_company_symbol, option, function (error, report) {
				if (error) {
					console.log(error);
				}
				new_company.company_financial_rating = report[0]['Qtrly Earnings Growth (yoy)'];
				new_company.company_PEG = report[0]['PEG Ratio (5 yr expected)'];
				new_company.mentioned_by = [];
				new_company.mentioned_by.push(link);
				var sn = new company(new_company);
				sn.save(function(err){
					if(err){
						return console.log('Problem saving the new company.');
					}
					console.log('New company successfully saved.');
				});
			});
			return;
		}
		console.log('Company is in the database.');
								// var avg;
								// if(com.company_sentiment !== 0){
								// 	avg = (com.company_sentiment + result_object.sentiment)/2;
								// } else {
								// 	avg = result_object.sentiment;
								// }
								// com.mentioned_by.push(news.link);
								// com.related_to.push(inter_companyRelations(main_company_symbol, result_object.concepts, news.link));
								// // com.save();
								// company.update({issuer : issuer_name},{
								// 	company_sentiment : avg,
								// 	mentioned_by : com.mentioned_by,
								// 	related_to : com.related_to
								// }, null, function(err, num){
								// 	if(err){
								// 		return console.log('Problem updating.');
								// 	}
								// 	console.log(num + ' rows updated.');
								// });
});
}

function correct_database(){
	// company_list.forEach(database_correction_callback);
	async.each(company_list,
		function(item){
			database_correction_callback(item);
		},
		function(err){
			if(err){
				console.log('Error async');
				return console.log(err);
			}
			console.log('Finished executing every thread.');
		});
}

function database_correction_callback(item){
	var company_issuer = nasdaq_companies_handler.findIssuer(item);
	// company.find({}, null, null, function(err, companies){
		// console.log('Trying to find company ' + company_issuer);
		// if(err){
		// 	return console.log(err);
		// }
		// if(companies.length === 0){
		// 	return;
		// }

		// async.each(companies, function(comp){
			company.find({issuer : company_issuer},null, null, function(err,comps){
				if(err){
					return console.log(err);
				}
				if(comps.length === 0){
					return;
				}
				var the_object = new company(buildSingularObject(comps));
				company.remove({ issuer : company_issuer}, function(err,removed){
					if(err){
						return console.log(err);
					}
					// console.log(comp.id);
					// companies = removeObjectFromList(companies,comp.id);
					console.log(removed + ' removed from the collection.');
					the_object.save(function(err){
						if(err){
							console.log('Problem saving the corrected company.');
							return console.log(err);
						}
						console.log('Corrected company saved.');
					})
				});
			});
		// },
		// function(err){
		// 	if(err){
		// 		console.log('Error async');
		// 		return console.log(err);
		// 	}
		// 	console.log('Finished executing every thread.');
		// });
	// });
}

function removeObjectFromList(companies,id){
	for(var i = 0; i < companies.length; i++) {
		if(companies[i]._id === id) {
			companies.splice(i, 1);
			i--;
			console.log('ERASED : ' + companies[i].issuer);
		}
	}
	return companies;

}

function buildSingularObject(companies){
	var result = {};
	// console.log(companies);
	result.issuer = companies[0].issuer;
	result.company_financial_rating = 0;
	
	for(var index = 0; index < companies.length; index++){
		if(companies[index].company_PEG){
			result.company_PEG = companies[index].company_PEG;
			break;
		}
	}
	for(var index = 0; index < companies.length; index++){
		if(companies[index].company_financial_rating !== 0){
			result.company_financial_rating = companies[index].company_financial_rating;
			break;
		}
	}
	/* details object */
	var new_details = [];
	for(var index = 0; index < companies.length; index++){
		var d = companies[index].details;
		for(var j = 0; j < d.length; j++){
			var exists = false;
			for(var i = 0; i < new_details.length; i++){
				if(d[j].symbol === new_details[i].symbol){
					exists = true;
				}
			}
			if(!exists){
				new_details.push(d[j]);
			}
		}
	}
	result.details = new_details;

	var new_related_to = [];
	for(var index = 0; index < companies.length; index++){
		var r = companies[index].related_to;
		for(var i = 0; i < r.length; i++){
			var exists = false;
			for(var j = 0; j < new_related_to.length;j++){
				if(r[i] === new_related_to[j]){
					exists = true;
				}
			}
			if(!exists){
				new_related_to.push(r[i]);
			}
		}
	}
	result.related_to = new_related_to;

	var new_mentioned_by = [];
	for(var index = 0; index < companies.length; index++){
		var m = companies[index].mentioned_by;
		for(var j = 0; j < m.length; j++){
			var exists = false;
			for(var i = 0; i < new_mentioned_by.length; i++){
				if(m[j] === new_mentioned_by[i]){
					exists = true;
				}
			}
			if(!exists){
				new_mentioned_by.push(m[j]);
			}
		}
	}
	result.mentioned_by = new_mentioned_by;

	var new_company_sentiment = 0;
	var num = 0;
	for(var index = 0; index < companies.length; index++){
		if(companies[index].company_sentiment !== 0){
			new_company_sentiment += companies[index].company_sentiment;
			num++;
		}
	}
	result.company_sentiment = new_company_sentiment/num;
	// console.log(result);
	return result;
}

function setCompanySentiment(){

}

function buildConcepts(concepts){

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
			for(var j = 0; j < c.length; j++){
				result.push(c[j].symbol);
			}
		}
	}
	return result;
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
function log(message_list){
	for(var i = 0; i < message_list.length; i++){
		console.log(message_list[i]);
	}
}