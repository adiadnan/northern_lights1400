/* Exporting the methods defined here. */
var exports = module.exports = {};

/* Base modules definition. Good practice: variables named after the module imported!*/
var fs = require('fs');
var request = require('request');
var assert = require('assert');
/* Cheerio is used to scrape content off of a HTML page. */
var cheerio = require('cheerio');
var AlchemyAPI = require('alchemyapi');
var sentiment = require('sentiment');
var sentimental = require('Sentimental');

var alchemy = new AlchemyAPI();

/* Custom made modules. */
var url_utils = require('./url_utils');
var file_debugger = require('./file_debugger');
var scraper_utils = require('./scraper_utils');
var financial_utils = require('./financial_utils');
var mongo = require('./mongo');
var mongojs = require('./mongojs');
var mongoose = require('mongoose');
var forbes_article = require('./model/forbes_article').forbes_article;

/* OK Messages. */

var mongo_access = 'Successfully acessed MONGO!';
var article_doesnt_exist = 'The article doesn\'t exist!';
/* Exception messages */
var json_invalid_format_exception = "Invalid JSON format exception : ";

function format_content(string){
  return string.substring(url_utils.relevant_url.forbes.script_content_beginning,string.length - url_utils.relevant_url.forbes.script_content_end);
};

/* ---------DEPRECATED--------*/
function buildUrl(author,year,month,day,title){
  return 'http://www.forbes.com/sites/'+author+'/'+year+'/'+month+'/'+day+'/'+title;
}
/* This method is new and is more programmer-friendly and eficient than buildUrl */
function constructUrl(req){
  var author = req.params.author;
  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var title = req.params.title;

  return 'http://www.forbes.com/sites/'+author+'/'+year+'/'+month+'/'+day+'/'+title;
}

function buildDate(d){
  var date = new Date(d);
  var date_obj = {};
  var hours = date.getHours();
  var minutes = date.getMinutes();
  date_obj.beautiful = (hours<10?('0' + hours):hours) + ":" + (minutes<10?('0'+minutes):minutes) +(hours<12?"AM":"PM") +" "+ date.getUTCDate() + "/"+(date.getMonth()+1) + "/"+date.getFullYear();
  date_obj.rough = d;
  return date_obj;
}

function fetchContent($, data){
  var script_tags = 0;
  var content = "";
  data.each(function(index){
    if($(this).is("script")){
      if(script_tags == url_utils.relevant_url.forbes.script_default_index_location){

        content = String($(this));

      }
      script_tags++;
    }
  });
  return format_content(content) + "\n";
}

/* This method contains the final version of the object to pe sent */
function parseSentiment(req, res, output,callback){

  var clear_text = financial_utils.clear_meaning(output.content);
  var simple = req.query.simple;


  var foa = 'Alchemy';
  var sos = 'sentimental';
  var tos = 'sentiment';

  alchemy.sentiment('text',clear_text,{},function(response){

    output[foa] = response['docSentiment'];      
    output[sos] = sentimental.analyze(clear_text);
    output[tos] =  sentiment(clear_text, financial_utils.corrected_values);
    /* Delete the extra useless field. */
    delete output[tos].tokens;
    delete output[tos].words;
    delete output.verbose;

    if(simple === 'true'){
      output['overall'] = {};
      output['overall']['score'] = (parseFloat(output[foa]['score']) + output[sos]['comparative'] + output[tos]['comparative'])/3;
      /* This statement is buggy for some reason. Makes no sense.*/
      output['overall']['type'] = (output['overall']['score']<0.0?'negative':'positive');
      delete output['content'];
      delete output[sos]['positive'];
      delete output[sos]['negative'];
      delete output[tos]['positive'];
      delete output[tos]['negative'];
      output[sos]['type'] = (output[sos]['comparative']<0?'negative':'positive');
      output[tos]['type'] = (output[tos]['comparative']<0?'negative':'positive');
    }
    var new_article = new forbes_article(output);
    callback(new_article, output);
  });
}
exports.sendSentiment = function sendSentiment(req, res, callback){

  var url = constructUrl(req);

  request(url,function(error,response,html){
    if(error){
      return callback(error, res);
    }

    var $ = cheerio.load(html);
    $('head').filter(function(){
      var data = $(this).children();
      var content = fetchContent($,data);
      var output = {};
      output.link = scraper_utils.beautifyText(JSON.parse(content).uri);
      parseSentiment(req,res,output,function(forbes_article,output){
        callback(null,res,output);
      });
    })
  });
}

function buildObject(final_obj){
  var output_object = {};
  output_object.link = final_obj.uri;
  output_object.author = scraper_utils.beautifyText(final_obj.author);
  output_object.title = scraper_utils.beautifyText(final_obj.title);
  output_object.date = buildDate(final_obj.date);
  output_object.content = scraper_utils.beautifyText(final_obj.body);
  output_object.description = scraper_utils.beautifyText(final_obj.description);
  output_object.newsKeywords = final_obj.newsKeywords;
  output_object.googleKeywords = final_obj.googleKeywords;
  output_object['clear'] = financial_utils.clear_meaning_with_message(output_object.content);
  return output_object;
}

exports.sendContent = function(req, res, callback){

  var url = constructUrl(req);
  var verbose = req.query.verbose;

  request(url, function(error, response, html){
    if(error){
      return callback(error, res);
    }
    var $ = cheerio.load(html);
    $('head').filter(function(){
     var data = $(this).children();
     /* This fetch content method authomatically formats the content to suit my needs.*/
     var content = fetchContent($,data);
     // try {
      /* This stores the object found in the 1th script tag of the forbes page. */
      var final_obj = JSON.parse(content);
      
      /* erased condition:  && verbose != undefined
      Note: In case it doesn't work just add it back there. */
      if(verbose === 'true'){
        return callback(null, res, final_obj);
      }
      /* This object stores the result that will be sent to the page. */
      var output = buildObject(final_obj);
      var status = mongojs.connectionState();
      if(status === 0 || status === 2 || status === 3){
        console.log('Not connected to Mongo.');
        return parseSentiment(req,res,output,function(myArticle,output){
          return callback(null, res, output);
        })
      }


      forbes_article.find({link:output.link},null,null,function(err,articles){
        if(err){
          return callback(err);
        }
        var length = articles.length;
        if(length === 0){
          parseSentiment(req,res,output,function(myArticle,output){
            myArticle.save(function(err){
              if(err){
                console.log('Problem saving the article.');
                console.log(err);
                return callback(err ,res);
              }
              console.log('Saved article to Mongo!');
              return callback(null, res, output);
            });
          });
        }
        if(length !== 0){
          console.log('Article found.');
          var response_object = articles[0];
          /* These two lines aren't working. */
          // delete response_object._id;
          // console.log(response_object);
          return callback(null, res, response_object);
        }
      });      
    });
});
}