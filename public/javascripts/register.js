function register(){
	var register_fields = $('#register form input');
	var em = register_fields[0].value;
	var p = register_fields[1].value;
	var v = register_fields[2].value;

	if(!password_correct(p,v)){
		return alert('Problem with the passwords. Minimum password length is 5 and they must match!');
	}

	var relevant_data = {
		'user' : em,
		'pass' : p
	};
	$.ajax({
		type : 'POST',
		url : '/authentication/register',
		data : relevant_data
	}).done(function(response){
		console.log(response);
			// location.reload();
			window.location.replace('http://localhost:3000/login');
		}).fail(function(a,b,c){
			if(a.status == 500){
				alert(a.responseText);
			}
			if(a.status == 401){
				alert(a.responseText);
			}
		});
	}

	function password_correct(first, second){
		if(!passwords_undefined(first, second)){
			return false;
		} else {
			if(!password_match(first, second)){
				return false;
			} else {
				if(!password_min_length(first)){
					return false;
				}
				return true;
			}
		}
	}

	function passwords_undefined(first, second){
		if(first === undefined && second === undefined){
			return false;
		}
		return true;
	}

	function password_match(first, second){
		if(first === second){
			return true
		}
		return false;
	}

	function password_min_length(password){
		if(password.length <= 5){
			return false;
		}
		return true;
	}
	$(function(){
		$('#register form').on('submit',function(e){
			e.preventDefault();
			e.stopPropagation();
			register();
		});
	});

