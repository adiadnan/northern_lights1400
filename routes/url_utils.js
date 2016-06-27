module.exports = {
	my_url : {
		simple : "http://localhost:6500/scrape/forbes"
	},
	relevant_url : {
		forbes : {
			script_default_index_location : 1,
			script_content_beginning : 39,
			script_content_end : 62,
			markets : "http://www.forbes.com/markets/feed/",
			business : "http://www.forbes.com/business/feed/",
			technology : "http://www.forbes.com/technology/feed/",
		}
	},
	/* This isn't working. 
	UPDATE 11/05/16: THIS STILL ISN'T WORKING.*/
	irelevant_url : [
	"http://www.forbes.com/pictures/.*",
	".*2016/04/24.*"
	]
}