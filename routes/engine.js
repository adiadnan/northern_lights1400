var google_finance = require('google-finance');
var AlchemyAPI = require('alchemyapi');
var mongoose = require('mongoose');
var yahoo = require('finance-scraper-js').yahoo;
/* custom-made modules */
var linkFeed = require('./models/linkFeedSchema').linkFeed;
var company = require('./models/companySchema').company;
var article = require('./models/article').article;
var nasdaq_companies_handler = require('./scripts/nasdaq_companies_handler');
var country_rating = require('./country_rating');

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
		linkFeed.find({link : url}, {}, {}, function(err,feeds){
			if(err){
				return console.log(err);
			}
			var length = feeds.length;
			if(length !== 0){
				var _t = feeds[0];
				if(!_t.has_feed){
					console.log('Feed found. The url has NO feeds available.');
					return console.log('url : ' + _t.link);
				} else {
					console.log('Feed found. The url HAS feeds available.');
					return console.log('url : ' + _t.link);
				}
			}
			if(length === 0){
				alchemy.feeds('url', url, {}, function(response){
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
					var new_feed = new linkFeed(save_object);
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
function getCompanyRating(main_company_symbol, news){
	for(var index = 0; index < news.length; index++){
		article.find({link:news[index].link}, null, null, function(err, articles){
			if(err){
				return console.log(err);
			}
			var length = articles.length;
			if(length === 0){
				log(['Article isn\'t in the database.', 'Adding the article.']);
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
								var new_company = {};
								new_company.symbol = main_company_symbol;
								var _cmp1 = getCompany(main_company_symbol);
								new_company.details = buildCompanyDetailsObject(_cmp1);
								new_company.sentiment = result_object.sentiment;
								new_company.related_to = inter_companyRelations(main_company_symbol,result_object.concepts, news[index].link);
								// new_company.country_rating = country_rating.getCountryRating();
								option = {format: 'aarray',	toNumber: true};
								yahoo.getKeyStatistics(main_company_symbol, option, function (error, report) {
									if (error) {
										console.log(error); 
									}
									new_company.company_financial_rating = report['Qtrly Earnings Growth (yoy)'];
									new_company.company_PEG = report['PEG Ratio (5 yr expected)'];
									new_company.mentioned_by = [];
									new_company.mentioned_by.push(news[index].link);
								});
							});
});
});
});
}
});
}
}

function setCompanySentiment(){

}

function inter_companyRelations(main_company_symbol, concept_list, link){
	var result = [];
	var issuer = nasdaq_companies_handler.findIssuer(main_company_symbol);
	for(var i = 0;i < concept_list.length;i++){
		var c = nasdaq_companies_handler.findIssuerFromName(concept_list[i].text);
		if(c.length !== 0){
			if(c[0].issuer !== issuer){
				company.findOne({issuer : c}, function(err, com){
					if(err){
						log(['Problem finding company', 'No relations established with ' + c]);
					}
					var _t = {};
					_t.issuer = c[0].issuer;
					_t.details = c;
					option = {format: 'aarray',	toNumber: true};
					yahoo.getKeyStatistics(c[0].symbol, option, function (error, report) {
						if (error) {
							console.log(error); 
						}
						_t.company_financial_rating = report['Qtrly Earnings Growth (yoy)'];
						_t.company_PEG = report['PEG Ratio (5 yr expected)'];
						_t.related_to = main_company_symbol;
						_t.mentioned_by = [];
						_t.mentioned_by.push(link);
						var n_company = new company(_t);
						n_company.save(function(err){
							if(err){
								return console.log('Problem adding the baby company.');
							}
							log(['New company successfully added.',_t]);
						});
					});
					var y = updateCompanyLinkList(com.issuer,com.mentioned_by,link);
					if(y !== -1){
						com.mentioned_by = y;
						com.save();
					}
				});
for(var j = 0; j < c.length; j++){
	result.push(c[j].symbol);
}
}
}
}
return result;
}

function getCompany(main_company_symbol){
	var company = {};
	return nasdaq_companies_handler.isListed_symbol(main_company_symbol); 
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
	// company.findOne({issuer : issuer}, function(err, com){
	// 	if(err){
	// 		return log(['Problem updating the mentioned_by field.','Nothing hopefully was added.']);
	// 	}
	// 	com.mentioned_by = link_list;
	// 	com.save();
	// 	log(['Company updated','New link added : ' + link]);
	// });
}

/* NOT NEEDED ANYMORE */
// function findMainConceptCompany(concept_list){
// 	var result = {
// 		main_company : {},
// 		position : -1
// 	};
// 	for(var index = 0; index<concept_list.length; index++){
// 		var t = nasdaq_companies_handler.isListed(concept_list[index]); 
// 		if(t.length !== 0){
// 			result.main_company = t;
// 			result.position = index;
// 			return result;
// 		}
// 	}
// 	return result;
// }

function buildArticleObject(news){
	var result_object = {};
	result_object.link = news.link;
	result_object.title = news.title;
	result_object.description = news.description;
	result_object.date = news.date;
	return result_object;
}

function buildCompanyDetailsObject(nasdaq_list){
	var list = [];
	for(var index = 0; index < nasdaq_list.length; index++){
		var obj = {};
		obj.security = nasdaq_list[index].security
		obj.category = nasdaq_list[index].category
		obj.issuer = nasdaq_list[index].issuer
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