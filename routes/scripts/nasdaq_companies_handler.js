var nasdaq_companies = require('nasdaq-companies');

exports.isListed = function(companyName){
	var return_object = [];
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index]['issuer'];
		if(string.indexOf(companyName) > -1){
			return_object.push(nasdaq_companies[index]);
		}
	}
	return return_object;
}

exports.isListed_symbol = function(companySymbol){
	var return_object = [];
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index]['issuer'];
		if(string.indexOf(companySymbol) > -1){
			return_object.push(nasdaq_companies[index]);
		}
	}
	return return_object;	
}

exports.findIssuer = function(companySymbol){
	for(var i = 0; i < nasdaq_companies.length; i++){
		var sym = nasdaq_companies[i].symbol;
		if(sym === companySymbol){
			return nasdaq_companies[i].issuer;
		}
	}
	return -1;
}

exports.findIssuerFromName = function(companyName){
	var result =[];
	for(var i = 0; i < nasdaq_companies.length; i++){
		var iss = nasdaq_companies[i].issuer;
		if(iss === companyName){
			result.push(nasdaq_companies[i]);
		}
	}
	return result;
}

/* NOT FUNCTIONAL */
function isListedBS(companyName){
	var return_object = [];
	var left = 0;
	var right = nasdaq_companies.length - 1;
	var middle;
	var currentElement;
	while(left <= right){
		middle = Math.floor((left + right)/2);
		currentElement = nasdaq_companies[middle]['issuer'];
		console.log(currentElement);
		if(currentElement < companyName){
			left = middle + 1;
		} else if(currentElement > companyName){
			right = middle - 1;
		} else {
			return middle;
		}
	}
	return -1;
}

/* Exporting the methods defined here. */
var exports = module.exports = {};
