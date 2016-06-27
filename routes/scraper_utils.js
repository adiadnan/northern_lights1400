/* Exporting the methods defined here. */
var exports = module.exports = {};

var file_debugger = require('./file_debugger');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

/* Custom modules */
var url_utils = require('./url_utils');

exports.containsPictures = function(text){
	var bad_links = url_utils.irelevant_url;
	for(var item in bad_links)
	if(text.search(new RegExp(item,'g')) != -1){
		return false;
	}
	return true;
}

exports.eraseHtmlTags = function eraseHtmlTags(text){
	return text.replace(/<[^>]+>/g,'');
};
/* Some square tags have been found on some forbes articles so the need to ditch them arises. Problem solved, thanks to the good ol' replace method. */
exports.eraseSquareTags = function eraseSquareTags(text){
	return text.replace(/\[+(.*?)\]+/g,'');
};
exports.eraseNewLine = function eraseNewLine(text){
	return text.replace(/\n/g,'');
};
exports.eraseTab = function eraseTab(text){
	return text.replace(/\r/g,'');
};
/* Uses the html-entities module to convert the text found on the Forbes website to human-readable text. */
exports.toUnicode = function toUnicode(text){
	return entities.decode(text);
};
/* This last method calls all of the other methods above in order to ease the job of developers and offer a clean and easy to parse text.*/
exports.beautifyText = function beautifyText(text){
	/* This variable holds the last and beautiful version of the text found on the forbes news. */
	var output = exports.eraseHtmlTags(text);
	output = exports.eraseSquareTags(output);
	output = exports.eraseTab(output);
	output = exports.eraseNewLine(output);
	return exports.toUnicode(output);
};