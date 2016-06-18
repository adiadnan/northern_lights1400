var log = console.log;
// console.log('Engine started.'.info);
var times = 1;
var executionInterval = 300000;
var secondExecutionInterval = 1000;


setInterval(function(){
	log((times * 5) + ' minutes passed.');
	times++;
	setTimeout(function(){
		log('Secondary function called.');
	}, secondExecutionInterval);
}, executionInterval);