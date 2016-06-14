var express = require('express');
var mongoose = require('mongoose');
var mongojs = require('./scripts/mongojs');
var user = require('./models/userSchema').user;

var router = express.Router();

function default_response_callback(err,res,output){
	if(err){
		res.send(err);
	}
	res.send(output);
}

function build_object(req){
	var obj = {};
	obj.username = req.body.user;
	obj.password = req.body.pass;
	return obj;
}

function build_response_object(m, r){
	var response_object = {
		message : message,
		reason : r
	}
	return response_object;
}

function register_user(res, obj, callback){
	user.find({username:obj.username},null,null,function(err,users){
		if(err){
			console.log(err);
			var response_object = build_response_object('register_fail','db_fail');
			return res.status(500).send(response_object);
		}
		var length = users.length;
		console.log(length);
		if(length === 0){
			var new_user = new user(obj);
			new_user.save(function(err){
				if(err){
					console.log('Problem saving the user');
					console.log(err);
					var response_object = build_response_object('register_fail','db_fail');
					return res.status(500).send(response_object);
				}
				console.log('Saved user to DB!');
				var response_object = build_response_object('register_ok','');
				return callback(null, res, response_object);
			});
		}
		if(length !== 0){
			console.log('User exists!');
			var response_object = build_response_object('register_fail','user_exists');
			return res.status(500).send(response_object);
		}
	});
}

function login_user(res, obj){
	user.find({username : obj.username,password:obj.password}, null, null, function(err, users){
		if(err){
			console.log(err);
			var response_object = build_response_object('login_fail','db_fail');
			return res.status(500).send(response_object);
		}
		var length = users.length;
		console.log(length);
		if(length === 0){
			var response_object = build_response_object('login_fail','user_inexistent');
			res.status(404).send(response_object);
		}
		if(length !== 0){
			var response_object = build_response_object('login_succes','user_exists');
			res.status(200).send(response_object);
		}
	});
}

router.post('/login', function(req, res, next){
	var obj = build_object(req);
	if(!mongojs.connectionValid()){
		console.log('Not connected to Mongo.');
		var response_object = build_response_object('login_fail','db_fail');
		return res.status(500).send(response_object);
	}
	login_user(res, obj);

});

router.post('/register', function(req, res, next){
	var obj = build_object(req);

	if(!mongojs.connectionValid()){
		console.log('Not connected to Mongo.');
		var response_object = build_response_object('register_fail','db_fail');
		return res.status(500).send(response_object);
	}
	register_user(res, obj, default_response_callback);
});

module.exports = router;