var nasdaq_companies = require('nasdaq-companies');

exports.isListed = function(companyName){
	var return_object = [];
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index]['security'];
		var company = 'Mon';
		if(string.indexOf(company) > -1){
			return_object.push(nasdaq_companies[index]);
		}
	}
	return return_object;
}

/* Exporting the methods defined here. */
var exports = module.exports = {};
