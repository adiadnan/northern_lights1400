var intraday = require('intraday');
var googleFinance = require('google-finance');
var symbol = 'RDEN';

// intraday(symbol, function (err, data) {
//   console.log(err ? err : data);
// });

// or 

// previous number of days worth of intraday, defaults to 1 (today) 
// var numDays = 60;
// intraday(symbol, numDays, function (err, data) {
// 	console.log(err ? err : data);
// 	console.log(data.length);
// 	/*
// 	close, high, low, open, volume
// 	*/
// 	for(var i = 0; i < data.length; i++){
// 		console.log(JSON.stringify(new Date(parseInt(data[i].timestamp + '000'))));
// 		console.log(data[i].close);
// 		console.log(data[i].high);
// 		console.log(data[i].low);
// 		console.log(data[i].open);
// 		console.log(data[i].volume);

// 	}
// });

googleFinance.historical({
	symbol: symbol,
	from: '2013'
}, function (err, quotes) {
	if(err){
		console.log('Problem fetching historical data.'.error);
		console.log(err);
		return;
	}
	console.log(quotes);
	console.log(quotes.length);
});