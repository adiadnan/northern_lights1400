/* Exporting the methods defined here. */
var exports = module.exports = {};

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

function replace_redundancies(string){
	string = string.replace('Inc.','');
	string = string.replace('inc.','');
	string = string.replace('Ltd.','');
	string = string.replace('Corp.','');
	string = string.replace('LLC','');
	string = string.replace('Incorporated.','');
	string = string.trim();
	string = string.replace(/,\s*$/, '');
	return string;
}

exports.company_name_complete_match = function(name){
	var result = [];
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index].issuer;
		if(name === string){
			result.push(nasdaq_companies[index]);
		}
	}
	return result;
}

exports.company_name_partial_match = function(name){
	var result = [];
	var max_ratio = 0;
	var s = '';
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index]['issuer'];
		string = replace_redundancies(string);
		if(string.indexOf(name) > -1){
			var t = name.length/string.length;
			if(t >= max_ratio){
				if(t === max_ratio){
					result.push(nasdaq_companies[index]);
				} else if(t > max_ratio){
					max_ratio = t;
					s = nasdaq_companies[index];
					result = [];
					result.push(nasdaq_companies[index]);
				}
			}
		}
	}
	var good = false;
	if(result.length !== 0){
		var ratio = name.length/replace_redundancies(result[0].issuer).length;
		console.log(ratio);
		if(ratio >= 0.5){
			good = true;
		}
	}
	if(good == true){
		return result;
	}
	return -1;
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
