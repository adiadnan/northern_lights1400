jQuery(function($){
	var login_fields = $('#login input');
	var register_fields = $('#register_input');

	$('#login form').submit(login);
	$('#register form').submit(register);

	function login(e){
		e.preventDefault();
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
	function register(e){
		e.preventDefault();
		var relevant_data = {
			'user' : register_fields[0].value,
			'pass' : register_fields[1].value
		};
		$.ajax({
			type : 'POST',
			url : '/authentication/register'
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
})