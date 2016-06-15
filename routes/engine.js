var google_finance = require('google-finance');
var AlchemyAPI = require('alchemyapi');
var mongoose = require('mongoose');
/* custom-made modules */
var linkFeed = require('./models/linkFeedSchema').linkFeed;
var company = require('./models/companySchema').company;
var article = require('./models/article').article;
var nasdaq_companies_handler = require('./scripts/nasdaq_companies_handler');

var alchemy = new AlchemyAPI();

function main(companyList){
	companyList.forEach(company_handler);
}

function company_handler(item, index){
	getCompanyNews(item);
}

function getCompanyNews(companySymbol){
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
			getCompanyFeeds(news);
		});
}

function getCompanyFeeds(news){
	for(var index = 0; index < news.length; index++){
		
		var url = news[index]['link'];
		var save_object = {
			link : url,
			has_feed : false,
			link_feeds : []
		}
		linkFeed.find({link : url}, null, null, function(err,feeds){
			if(err){
				return console.log(err);
			}
			var length = feeds.length;
			if(length === 0){
				alchemy.feeds('url', url, {'sentiment':1},function(response){
					var output = response['feeds'];
					if(output.length === 0){
						var new_feed = new linkFeed(save_object);
						return new_feed.save(function(err){
							if(err){
								console.log(err);
							}
							console.log('Saved the feed without feeds!!');
						});
					}

					save_object.has_feed = true;
					save_object.link_feeds = buildFeedList(output);
					new_feed = new linkFeed(save_object);
					new_feed.save(function(err){
						if(err){
							return console.log(err);
						}
						console.log('Saved feed with feeds to Mongo');
					});
				});
			}
		});
	}
}
/* WARNING!!!!!!!!! 5 API CALLS PER ARTICLE */
function getCompanyNewsSentiment(news){
	for(var index = 0; index < news.length; index++){
		article.find({link:result_object.link}, null, null, function(err, articles){
			if(err){
				return console.log(err);
			}
			var length = articles.length;
			if(length === 0){
				var result_object = buildArticleObject(news[index]);
				alchemy.text('url', result_object.link, null, function(response) {
					assert.equal(response['status'],'OK');
					result_object.content = response.text;
					var t = result_object.content;

					alchemy.sentiment('text',t,null,function(response){
						assert.equal(response['status'],'OK');
						result_object.sentiment = response.docSentiment;

						alchemy.keywords('text', t, {'sentiment' : 1}, function(response){
							assert.equal(response['status'],'OK');
							result_object.keywords = response.keywords;

							alchemy.concepts('text', t, null, function(response){
								assert.equal(response['status'],'OK');
								result_object.concepts = response.concepts;

								var new_article = new article(result_object);
								new_article.save(function(err){
									if(err){
										return console.log(err);
									}
									console.log('Saved article to DB.');
								});
							});
						});
					});
				});
			}
		});
	}
}

function inter_companyRelations(concept_list){
	var result = [];
	for(var index = 0; index<concept_list.length; index++){
		var t = nasdaq_companies_handler.isListed(concept_list[index]); 
		if(t.length !== 0){
			result.push(t.symbol);
		}
	}
	return result;
}

function buildArticleObject(news){
	var result_object = {};
	result_object.link = news.link;
	result_object.title = news.title;
	result_object.description = news.description;
	result_object.date = news.date;
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