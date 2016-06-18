var intraday = require('intraday');
var symbol = 'AAPL';
 
// intraday(symbol, function (err, data) {
//   console.log(err ? err : data);
// });
 
// or 
 
// previous number of days worth of intraday, defaults to 1 (today) 
var numDays = 50;
intraday(symbol, numDays, function (err, data) {
  console.log(err ? err : data);
});