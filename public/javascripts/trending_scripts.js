$(document).ready(function(){
	$('#button-action1').bind('click',function(){
		if($(this).attr('class') !== 'active'){
			$(this).attr('class', 'active');
			$('#button-action2').attr('class', '');
			$('#button-action3').attr('class', '');
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
			$(this).attr('class', 'active');
			$('#button-action1').attr('class', '');
			$('#button-action2').attr('class', '');
		}
	});
});

function activate_menu_button(){

}