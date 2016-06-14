function login(){
	var login_fields = $('#login form input');
	var relevant_data = {
		'user' : login_fields[0].value,
		'pass' : login_fields[1].value
	};
	$.ajax({
		type : 'POST',
		url : '/authentication/login',
		data : relevant_data
	}).done(function(response){
		console.log(response);
		location.reload();
	}).fail(function(a,b,c){
		if(a.status == 500){
			alert(a.responseText);
		}
		if(a.status == 401){
			alert(a.responseText);
		}
	});
}

$(function(){
	$('#login form').on('submit',function(e){
		e.preventDefault();
		e.stopPropagation();
		login();
	});	
});