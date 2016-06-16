/* Exporting the methods defined here. */
var exports = module.exports = {};

var country_rating = {
	country : 'United States of America',
	abbr : 'USA',
	agency : 'S&P',
	rating : 'aa+',
	outlook : 'stable',
	ovr : 9
}

var current_rating = 'aa+'

function getOverall(rating){
	switch(rating){
		case 'aaa' : return 10; break;
		case 'aa+' : return 9; break;
		case 'aa' : return 8; break;
		case 'aa-' : return 7; break;
		case 'a+' : return 6; break;
		case 'a' : return 5; break;
		case 'a-' : return 4; break;
		case 'bbb+' : return 3; break;
		case 'bbb' : return 2; break;
		case 'bbb-' : return 1; break;
		case 'bb+' : return -1; break;
		case 'bb' : return -2; break;
		case 'bb-' : return -3; break;
		case 'b+' : return -4; break;
		case 'b' : return -5; break;
		case 'b-' : return -6; break;
		case 'ccc+' : return -7; break;
		case 'ccc' : return -8; break;
		case 'ccc-' : return -9; break;
		case 'cc' : return -10; break;
		case 'c' : return -11; break;
		case 'd' : return -12; break;
		default : return 0;
	}
}

exports.getRating = function(){
	country_rating.rating = current_rating;
	country_rating.ovr = getOverall(current_rating);
	country_rating.outlook = (country_rating.ovr < 1?'Bad':'Stable');
	return country_rating.ovr;
}

exports.getCountryRating = function(){
	country_rating.rating = current_rating;
	country_rating.ovr = getOverall(current_rating);
	country_rating.outlook = (country_rating.ovr < 1?'Bad':'Stable');
	return country_rating;
}