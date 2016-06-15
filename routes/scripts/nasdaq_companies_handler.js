var nasdaq_companies = require('nasdaq-companies');

exports.isListed = function(companyName){
	var return_object = [];
	for(var index = 0; index < nasdaq_companies.length; index++){
		var string = nasdaq_companies[index]['security'];
		if(string.indexOf(companyName) > -1){
			return_object.push(nasdaq_companies[index]);
		}
	}
	return return_object;
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
		currentElement = nasdaq_companies[middle];
		console.log(middle);
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

console.log(isListedBS('GOOG'));
console.log('here');

/* Exporting the methods defined here. */
var exports = module.exports = {};
