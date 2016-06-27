/* Exporting the methods defined here. */
var exports = module.exports = {};

var fs = require('fs');

exports.printf = function printf(output){
	fs.writeFile('output.txt', output,function(error){
		if(error){
			return console.log(error.message);
		}
		console.log("Successfully written to file!");
	});

}