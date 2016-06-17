var async = require('async');
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
			async.each(c, function(item){
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
},
function(err){
	if(err){
		console.log('Error async');
		return console.log(err);
	}
	console.log('Finished executing every thread.');
});
for(var j = 0; j < c.length; j++){
	result.push(c[j].symbol);
}
}
}
// console.log(result);
return result;
}
