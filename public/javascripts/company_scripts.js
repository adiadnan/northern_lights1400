$(document).ready(function(){
	// $('#mc_button1').bind('click',function(event){
	// 	event.preventDefault();
	// 	if($(this).attr('class') !== 'active'){
	// 		$(this).attr('class', 'active');
	// 		$('#mc_button2').attr('class', '');
	// 		$('#mc_button3').attr('class', '');
	// 	}
	// });
function render(){
	zingchart.render({
		id: "steps",
		output: "svg",
		width: 600,
		height: 400,
		data: myChart

	});
}
$('#mc_button2').bind('click',function(event){
	event.preventDefault();
	if($(this).attr('class') !== 'active'){
		$(this).attr('class', 'active');
		$('#mc_button1').attr('class', '');
		$('#mc_button3').attr('class', '');
		$('#mc_button4').attr('class', '');
		$('#rel_area').empty();
		getRelatedTo($('#com_issuer').text());
	}
});
$('#mc_button3').bind('click',function(event){
	event.preventDefault();
	if($(this).attr('class') !== 'active'){
		$(this).attr('class', 'active');
		$('#mc_button1').attr('class', '');
		$('#mc_button2').attr('class', '');
		$('#mc_button4').attr('class', '');
	}
});
$('#mc_button4').bind('click',function(event){
	event.preventDefault();
	if($(this).attr('class') !== 'active'){
		$(this).attr('class', 'active');
		$('#mc_button1').attr('class', '');
		$('#mc_button2').attr('class', '');
		$('#rel_area').empty();
		$('#rel_area').append('<div id="steps" style="margin-top:20px"></div>');
		render();
	}
});
});

function getRelatedTo(query_string){
	console.log(query_string.trim());
	$.ajax({
		type:'GET',
		url: 'http://127.0.0.1:3000/companies/related',
		crossDomain: true,
		data : {
			issuer: query_string.trim() 
		},
		success: function(data){
			console.log(data);
			buildRelatedTo(data);
		},
	})
}

function getArticles(query_string){
	
}

function buildRelatedTo(data){
	var related_to = data.related_to;
	for(var i = 0; i < related_to.length; i++){
		var to_add = '<div class=\"panel panel-default\">';
		to_add += '<div class=\"panel-heading\"><h3 class=\"panel-title\">';
		to_add += '<a href=\"articles?=576573ad3de39c5c1d786850\">';
		to_add += '<h5>';
		to_add += ('<a href=\"/companies?sym=' + related_to[i]._id + '\">');
		to_add += related_to[i].issuer;
		to_add += '</a>'
		to_add += '</h5></a><h5>';
		to_add += '</h5>';
		to_add += '</h3></div>';
		to_add += '<div class=\"panel-body\">';
		to_add += '<div class=\"news_description\">';
		to_add += '<span class=\"news_desc_area\">';
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Company identified by ';
		if(related_to[i].details.length > 1){
			to_add += 'symbols ';
		} else {
			to_add += 'symbol: ';
		}
		to_add += '<span id="related_to_area">';
		for(var j = 0; j < related_to[i].details.length; j++){
			to_add += related_to[i].details[j];
			if(j !== related_to[i].details.length - 1){
				to_add += ', ';
			}
		}
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Daily rating: ';
		if(related_to[i].daily_rating > 0){
			to_add += '<span style=\"color:green\">';
		} else if(related_to[i].daily_rating < 0){
			to_add += '<span style=\"color:red\">';
		} else {
			to_add += '<span style=\"color:blue\">';
		}
		to_add += related_to[i].daily_rating;
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment\">';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Sentiment: ';
		if(related_to[i].company_sentiment > 0){
			to_add += '<span style=\"color:green\">';
		} else if(related_to[i].company_sentiment < 0){
			to_add += '<span style=\"color:red\">';
		} else {
			to_add += '<span style=\"color:blue\">';
		}
		to_add += related_to[i].company_sentiment;
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Related stock sentiment: ';
		if(related_to[i].related_stock > 0){
			to_add += '<span style=\"color:green\">';
		} else if(related_to[i].related_stock < 0){
			to_add += '<span style=\"color:red\">';
		} else {
			to_add += '<span style=\"color:blue\">';
		}
		to_add += related_to[i].related_stock;
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Company financial rating: ';
		if(related_to[i].company_financial_rating > 0){
			to_add += '<span style=\"color:green\">';
		} else if(related_to[i].company_financial_rating < 0){
			to_add += '<span style=\"color:red\">';
		} else {
			to_add += '<span style=\"color:blue\">';
		}
		to_add += related_to[i].company_financial_rating;
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Company Price/Earnings to Growth: ';
		if(related_to[i].company_PEG > 0){
			to_add += '<span style=\"color:green\">';
		} else if(related_to[i].company_PEG < 0){
			to_add += '<span style=\"color:red\">';
		} else {
			to_add += '<span style=\"color:blue\">';
		}
		to_add += related_to[i].company_PEG;
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Related to: ';
		to_add += '<span id="related_to_area">';
		for(var j = 0; j < related_to[i].related_to.length; j++){
			to_add += '<a href=\"/companies?sym=' + related_to[i].related_to[j] + '&byName=true\">';
			to_add += related_to[i].related_to[j];
			to_add += '</a>';
			if(j !== related_to[i].related_to.length - 1){
				to_add += ', ';
			}
		}
		to_add += '</span>';
		to_add += '</div>';
		to_add += '<div class=\"news_sentiment_area\">';
		to_add += 'Mentioned by: ';
		to_add += '<span id="related_to_area">';
		to_add += related_to[i].mentioned_by.length;related_to[i].mentioned_by.length
		to_add += '</span>';
		if(related_to[i].mentioned_by.length > 1){
			to_add += ' articles';
		} else {
			to_add += ' article';
		}
		to_add += '</div>';
		to_add += '</div>';
		to_add += '<div class=\"news_link\">';
		to_add += '<span class=\"news_link_area\">';
		to_add += '</span>';
		to_add += '</div>';
		to_add += '</div></div>';
		$('#rel_area').append(to_add);
	}

}