
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
			c.forEach(function(item, index){
				company.findOne({issuer : item.issuer}, function(err, com){
					if(err){
						return log(['Problem finding company', 'No relations established with ' + item.issuer + '.']);
					}
					if(!com){
						var _t = {};
						// console.log(c[0]);
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
						company.update({issuer : issuer},{
							$push : {related_to : _t.details[0].symbol}},{upsert:true},function(err){
								if(err){
									console.log(err);
								}else{
									console.log("Successfully added");
								}
							});
						option = {format: 'aarray',	toNumber: true};
						yahoo.getKeyStatistics(item.symbol, option, function (error, report) {
							if (error) {
								console.log(error); 
							}
							if(report){
								_t.company_financial_rating = report[0]['Qtrly Earnings Growth (yoy)'];
								_t.company_PEG = report[0]['PEG Ratio (5 yr expected)'];
							}
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
						return;
					}
					var y = updateCompanyLinkList(com.issuer,com.mentioned_by,link);
					if(y !== -1){
						com.mentioned_by = y;
						com.related_to.push(main_company_symbol);
						com.save();
					}
				});
});
for(var j = 0; j < c.length; j++){
	result.push(c[j].symbol);
}
}
}
// console.log(result);
return result;
}



function correct_database_entries(companies){
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
		console.log(('Removed the entire collection.').info);
	});
	debugger;
	for(var index = 0; index < new_companies_list.length; index++){
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
}

function buildSingularObject(companies){
	var result = {};
	result.issuer = companies[0].issuer;
	result.company_financial_rating = 0;
	result.company_PEG = 0;
	result.related_stock = 0;
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
		if(companies[index].related_stock !== 0 && companies[index].related_stock !== 'N/A'){
			result.related_stock = companies[index].related_stock;
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