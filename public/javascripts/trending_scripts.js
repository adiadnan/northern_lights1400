$(document).ready(function(){
	$('#button-action1').bind('click',function(){
		if($(this).attr('class') !== 'active'){
			$(this).attr('class', 'active');
			$('#button-action2').attr('class', '');
			$('#button-action3').attr('class', '');
			location.reload();
		}
	});
	$('#button-action2').bind('click',function(){
		if($(this).attr('class') !== 'active'){
			$(this).attr('class', 'active');
			$('#button-action1').attr('class', '');
			$('#button-action3').attr('class', '');
		}
	});
	$('#button-action3').bind('click',function(){
		if($(this).attr('class') !== 'active'){
			getUserPortofolio(this);
		}
	});
});

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

function getUserPortofolio(useful){
	$.ajax({
		type:'GET',
		url: 'http://127.0.0.1:3000/portofolio',
		crossDomain: true,
		data : {
			username: getCookie('username')
		},
		success: function(data){
			console.log(data);
			if(data.length === 0){
				document.getElementById('gridSystemModalLabel').innerHTML = 'Portofolio is empty!</br>Look at the company list and invest first!';
				$('#myModal').modal('toggle');
			} else {
				$('.custom-main-panel').empty();
				$(useful).attr('class', 'active');
				$('#button-action1').attr('class', '');
				$('#button-action2').attr('class', '');
				buildTable(data);
			}
		},
	})
}

function buildTable(data){
	var to_add ='<table class="table" style="margin-top:30px">';
	to_add += '<thead>';
	$('.custom-main-panel').append('<h3>Account balance: ' + data.money + '$</h3>');
	$('.custom-main-panel').append('<h4 style="margin-top:50px">Transaction history: </h4>');
	to_add += '<tr>';
	to_add += '<th>';
	to_add += 'owner';
	to_add += '</th>';
	to_add += '<th>';
	to_add += 'symbol';
	to_add += '</th>';
	to_add += '<th>';
	to_add += 'amount';
	to_add += '</th>';
	to_add += '<th>';
	to_add += 'price(b/s)';
	to_add += '</th>';
	to_add += '<th>';
	to_add += 'date';
	to_add += '</th>';
	to_add += '<th>';
	to_add += 'type';
	to_add += '</th>';
	to_add += '</tr>';
	to_add += '</thead>';
	to_add += '<tbody>';
	for(var i = 0; i < data.docs.length; i++){
		to_add += '<tr>';
		to_add += '<td>';
		to_add += data.docs[i].user;
		to_add += '</td>';
		to_add += '<td>';
		to_add += '<a href="'
		to_add += '/companies?sym=' + data.docs[i].company_id + '">'
		to_add += data.docs[i].symbol;
		to_add += "</a>"
		to_add += '</td>';
		to_add += '<td>';
		to_add += data.docs[i].amount;
		to_add += '</td>';
		to_add += '<td>';
		to_add += data.docs[i].price;
		to_add += '</td>';
		to_add += '<td>';
		var d = new Date(data.docs[i].date_entered);
		var dd = d.getDate();
		var mm = d.getMonth()+1;

		var yyyy = d.getFullYear();
		if(dd<10){
			dd='0'+dd
		} 
		if(mm<10){
			mm='0'+mm
		} 
		var today = dd+'/'+mm+'/'+yyyy;
		to_add += today;
		to_add += '</td>';
		to_add += '<td>';
		to_add += data.docs[i].order_type;
		to_add += '</td>';
		to_add += '</tr>';
	}
	to_add += '</tbody>';
	to_add += '</table>';
	$('.custom-main-panel').append(to_add);
}