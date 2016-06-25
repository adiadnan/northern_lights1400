var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var auth = require('./routes/auth');
var trending = require('./routes/trending');
var companies = require('./routes/companies');
var articles = require('./routes/articles');
var search = require('./routes/search');

const request = require('request');
const cheerio = require('cheerio');

const company = require('./routes/models/companySchema').company;

const yahoo_scraping_activated = false;


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/login', login);
app.use('/register', register);
app.use('/authentication', auth);
app.use('/trending', trending);
app.use('/companies', companies);
app.use('/articles', articles);
app.use('/search', search);
var s = 0;
if(yahoo_scraping_activated){
  setInterval(function(){
    company.find({},
      function(err, docs){
        docs.forEach(function(item, index){
          request('http://finance.yahoo.com/q?s=' + item.details[0], 
            function(err, response, html){
              if(err){
                return console.log(err);
              }
              var $ = cheerio.load(html);
              $('span.time_rtq_content').filter(function(){
                var data = $(this).children();
                var str = data['1'].children[0].data;
              // console.log(data['1']);
              str = str.replace(/\(|\)/g,'')
              if($(this).hasClass('down_r') === true){
                str = '-' + str;
              } else if($(this).hasClass('down_r') === false){
                str = '+' + str;
              }
              console.log(s);
              console.log(str);
              company.update({
                issuer: item.issuer
              },{
                $set: {
                  latest_var: str
                }
              },null, function(err, num){
                if(err){
                  return console.log(err);
                }
                console.log(num);
              });
              s++;
            });
            })
});
});
}, 3000);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
