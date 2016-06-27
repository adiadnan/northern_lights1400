/* Exporting the methods defined here. */
var exports = module.exports = {};

exports.corrected_values = {
	'yes' : 0,
	'no' : 0
}

exports.confusing_expressions = [
	'per share',
	'/share',
	'shares'
]

exports.clear_meaning_expressions = [
	'per stock',
	'/stock',
	'stocks'
]

exports.clear_meaning = function clear_meaning(text){
	for(var index = 0; index < exports.confusing_expressions.length;index++){
		var p1 = exports.confusing_expressions[index];
		var p2 = exports.clear_meaning_expressions[index];
		var message = "(replaced \'" + p1 + "\' with \'" + p2 + '\')';
		text = text.replace(new RegExp(p1,'g'), p2);
	}
	return text;
}

exports.clear_meaning_with_message = function clear_meaning(text){

	for(var index = 0; index < exports.confusing_expressions.length;index++){
		var p1 = exports.confusing_expressions[index];
		var p2 = exports.clear_meaning_expressions[index];
		var message = " ****replaced \'" + p1 + "\' with \'" + p2 + '\'**** ';
		text = text.replace(new RegExp(p1,'g'), p2 + message);
	}
	return text;

}