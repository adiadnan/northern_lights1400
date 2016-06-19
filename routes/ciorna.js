var intraday = require('intraday');
var googleFinance = require('google-finance');
var symbol = 'GOOG';

googleFinance.historical({
	symbol: symbol,
	from: '2016-01-25'
}, function (err, quotes) {
	if(err){
		console.log('Problem fetching historical data.'.error);
		console.log(err);
		return;
	}
	macd(quotes, 0.9);
});

function macd(lines, sentiment){

	var result = [];

	var ema_short_window = 12;
	var ema_long_window = 26;
	var macd_window = 9;

	// var lines = [100, 10, 3, 0, 150, 8];
	var ema_short = 0.0;
	var ema_long = 0.0;
	var ema_macd = 0.0;/* called SIGNAL */
	const alpha_short = 2 / (ema_short_window+1);
	const alpha_long = 2 / (ema_long_window+1);
	const alpha_macd = 2 / (macd_window+1);

	for(var i = 0; i < lines.length; i++){
		var v = lines[i].close;
		ema_short = alpha_short * v + (1 - alpha_short)*ema_short;
		ema_long = alpha_long * v + (1 - alpha_long)*ema_long;
		var macd = ema_short - ema_long;
		ema_macd = alpha_macd * macd + (1 - alpha_macd) * ema_macd;
		var macd_histogram = macd - ema_macd;
		if(sentiment){
			macd_histogram = (macd_histogram * 30 + 70 * sentiment)/100;
		}
		if(lines.length - 2 >= 0){
			if(lines.length - 2 == i){
				result.push(macd_histogram);
			} else if(lines.length - 1 == i){
				result.push(macd_histogram);
			}
		}
		console.log('closing price: ' + v);
		console.log(ema_short);
		console.log(ema_long);
		console.log('macd : ' + macd);
		console.log('ema macd : ' + ema_macd);
		console.log('histogram : ' + macd_histogram);
	}
	console.log('RESULT : ' + result);


}

