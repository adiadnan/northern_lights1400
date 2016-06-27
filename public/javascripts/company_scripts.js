$(document).ready(function(){
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
			$('#mc_button5').attr('class', '');
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
			$('#mc_button5').attr('class', '');
			$('#rel_area').empty();
			getFinance($('#com_symbols').attr('details'));
			console.log($('#com_symbols').attr('details'));
		}
	});
	$('#mc_button4').bind('click',function(event){
		event.preventDefault();
		if($(this).attr('class') !== 'active'){
			$(this).attr('class', 'active');
			$('#mc_button1').attr('class', '');
			$('#mc_button2').attr('class', '');
			$('#mc_button3').attr('class', '');
			$('#mc_button5').attr('class', '');
			$('#rel_area').empty();
			$('#rel_area').append('<div id="steps" style="margin-bottom:50px"></div>');
			render();
		}
	});
	$('#mc_button5').bind('click',function(event){
		event.preventDefault();
		if($(this).attr('class') !== 'active'){
			$(this).attr('class', 'active');
			$('#mc_button1').attr('class', '');
			$('#mc_button2').attr('class', '');
			$('#mc_button3').attr('class', '');
			$('#mc_button4').attr('class', '');
			$('#rel_area').empty();
			getInvestingPlatform();
		}
	});
});

function eventOnFocusOut(){
	var value = $('#basic-url').val();
	console.log('here' + (value * $('#com_symbols').attr('latest-price')));
	var element = document.getElementById('total_value');

	element.innerHTML = 'Total : ' + '<span id="stock_subtotal">' + (value * $('#com_symbols').attr('latest-price')) + '</span>$';
	var total = document.getElementById('total_money').innerHTML;
	var stock_total = document.getElementById('stock_subtotal').innerHTML;
	var subtotal = document.getElementById('subtotal');
	subtotal.innerHTML = 'Money left : ' + (parseFloat(total) - parseFloat(stock_total)) + '$';
}

function getInvestingPlatform(){
	$.ajax({
		type:'GET',
		url: 'http://127.0.0.1:3000/companies/investments/platform',
		crossDomain: true,
		data: {
			user: getCookie('username')
		},
		success: function(data){
			console.log(data);
			// buildRelatedTo(data);
			buildPlatform(data);
		},
	})
}

function buyStock(){
	var total = document.getElementById('total_money').innerHTML;
	var stock_total = document.getElementById('stock_subtotal').innerHTML;
	var subtotal = document.getElementById('subtotal').innerHTML;
	$.ajax({
		type:'POST',
		url: 'http://127.0.0.1:3000/companies/investments/platform/buy',
		crossDomain: true,
		data: {
			symbol: $('#com_symbols').attr('details'),
			amount: parseInt($('#basic-url').val()),
			user: getCookie('username')
		},
		success: function(data){
			console.log(data);
			if(data === 'success'){
				document.getElementById('total_money').innerHTML = total - stock_total;
				eventOnFocusOut();
			} else {
				document.getElementById('gridSystemModalLabel').innerHTML = data;
				$('#myModal').modal('toggle');
			}
		},
	})
}

function sellStock(){
	var total = document.getElementById('total_money').innerHTML;
	var stock_total = document.getElementById('stock_subtotal').innerHTML;
	var subtotal = document.getElementById('subtotal').innerHTML;
	$.ajax({
		type:'POST',
		url: 'http://127.0.0.1:3000/companies/investments/platform/sell',
		crossDomain: true,
		data: {
			symbol: $('#com_symbols').attr('details'),
			amount: parseInt($('#basic-url').val()),
			user: getCookie('username')
		},
		success: function(data){
			console.log(data);
			if(data.message === 'success'){
				document.getElementById('total_money').innerHTML = parseFloat(total) + parseFloat(data.income);
				eventOnFocusOut();
			} else {
				document.getElementById('gridSystemModalLabel').innerHTML = data.message;
				$('#myModal').modal('toggle');
			}
		},
	})
}

function getRelatedTo(query_string){
	console.log(query_string.trim());
	$.ajax({
		type:'GET',
		url: 'http://127.0.0.1:3000/companies/related',
		crossDomain: true,
		data : {
			issuer: query_string.trim()
			// user: getCookie('username')
		},
		success: function(data){
			console.log(data);
			buildRelatedTo(data);
		},
	})
}
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length,c.length);
		}
	}
	return "";
}

function getFinance(query_string){
	// console.log(query_string.trim());
	$.ajax({
		xhr: function()
		{
			$('#rel_area').append('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">0%</div></div>');
			var xhr = new window.XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(evt){
				if (evt.lengthComputable) {
					var percentComplete = evt.loaded / evt.total;
					console.log('upload : ' + percentComplete);
				}
			}, false);
			xhr.addEventListener("progress", function(evt){
				if (evt.lengthComputable) {
					var percentComplete = evt.loaded / evt.total;
					console.log('download: ' + percentComplete);
					$('.progress-bar').attr('aria-valuenow',percentComplete);
					$('.progress-bar').attr('style','width:'+percentComplete+'%');
					$('.progress-bar').val(percentComplete);
				}
			}, false);
			return xhr;
		},
		type:'GET',
		url: 'http://127.0.0.1:3000/companies/finance',
		crossDomain: true,
		data : {
			symbol: query_string
		},
		success: function(data){
			$('#rel_area').empty();
			console.log(data);
			buildFinancialData(data);
		},
	})
}

function getArticles(query_string){
	
}

function buildPlatform(data){
	$('#rel_area').append('<label for="basic-url" style="margin-top:15px">' + 'Current company: ' + $('#com_symbols').attr('company')+ '</label></br>');
	$('#rel_area').append('<label for="basic-url" style="margin-top:15px">' + 'Current stock price: ' + $('#com_symbols').attr('latest-price') + '$' +  '</label>');
	$('#rel_area').append(data);
}

function buildFinancialData(data){
	var data = data[0];
	var to_add = '<table class="table">';
	to_add +='<thead>'
	to_add += '<tr>'
	to_add += '<th>'
	to_add += 'Index name';
	to_add += '</th>'
	to_add += '<th>'
	to_add += 'Index value';
	to_add += '</th>'
	to_add += '</thead>'
	to_add += '<tbody>'
	var j = 0;
	for(var i in data){
		to_add += '<tr>';
		to_add += '<th scope="row">' + i + '</th>'
		to_add += '<td>' + data[i] + '</td>'
		to_add += '</tr>'
      // <td>Otto</td>';
  }
  to_add += '</tbody>'
  to_add += '</table>';
  $('#rel_area').append(to_add);
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