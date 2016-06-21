$(document).ready(function(){
	// $('#mc_button1').bind('click',function(event){
	// 	event.preventDefault();
	// 	if($(this).attr('class') !== 'active'){
	// 		$(this).attr('class', 'active');
	// 		$('#mc_button2').attr('class', '');
	// 		$('#mc_button3').attr('class', '');
	// 	}
	// });
$('#mc_button2').bind('click',function(event){
	event.preventDefault();
	if($(this).attr('class') !== 'active'){
		$(this).attr('class', 'active');
		$('#mc_button1').attr('class', '');
		$('#mc_button3').attr('class', '');
		$('#rel_area').empty();
		getConcepts($('#com_issuer a').attr('ceva'))
	}
});
$('#mc_button3').bind('click',function(event){
	event.preventDefault();
	if($(this).attr('class') !== 'active'){
		$(this).attr('class', 'active');
		$('#mc_button1').attr('class', '');
		$('#mc_button2').attr('class', '');
	}
});
});


function getConcepts(query_string){
	console.log(query_string.trim());
	$.ajax({
		type:'GET',
		url: 'http://127.0.0.1:3000/articles/concepts',
		crossDomain: true,
		data : {
			id: query_string
		},
		success: function(data){
			console.log(data);
			buildConcepts(data);
		},
	})
}

function buildConcepts(relevant_data){
	for(var j = 0; j < relevant_data.concepts.length; j++){

		var add_to = '<div class="panel panel-default">';
		add_to += '<div class="panel-heading">'
		add_to += '<h5>'
		add_to += '<span class="panel-title" style="margin-right:15px">'
		add_to +=  relevant_data.concepts[j].text
		add_to += '</span>'
		add_to += '<span class="label label-info" style="margin-left:5px;font-size:14px">relevance: '
		add_to += relevant_data.concepts[j].relevance
		add_to += '</span>'
		add_to += '</h5>'
		add_to += '</div>'
		add_to += '</div>'
		$('#rel_area').append(add_to);
	}
}