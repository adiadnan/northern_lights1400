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
		document.cookie = "username=" + relevant_data.user + "; expires=Thu, 18 Dec 2019 12:00:00 UTC; path=/";
		window.location.replace('http://localhost:3000/trending');
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

function validateForm(x, message) {
    if (x == null || x == "") {
        $('#lgn_msg_box').append('<div class="alert alert-danger" role="alert" style="">' + message +'</div>');
        return false;
    }
}