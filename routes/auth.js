var express = require('express');


var router = express.Router();

router.post('/login', function(req, res, next){
	console.log(req.body.user + ' ' + req.body.pass);
});

router.post('/register', function(req, res, next){
	console.log(req.body.user + ' ' + req.body.pass);
});

module.exports = router;