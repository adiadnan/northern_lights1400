var activeElement;
var neet = 0;
function url_parse(hashBased) {
  var query;
  if(hashBased) {
    var pos = location.href.indexOf("?");
    if(pos==-1) return [];
    query = location.href.substr(pos+1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    var item = part.split("=");
    var key = item[0];
    var from = key.indexOf("[");
    if(from==-1) result[key] = decodeURIComponent(item[1]);
    else {
      var to = key.indexOf("]");
      var index = key.substring(from+1,to);
      key = key.substring(0,from);
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(item[1]);
      else result[key][index] = item[1];
    }
  });
  return result;
}
function changeState(e) {
	activeElement.removeAttribute("class");
	var att = document.createAttribute("onclick");
	att.value = "changeState(this)";
	activeElement.setAttributeNode(att);
	e.removeAttribute("onclick");
	var att = document.createAttribute("class");
	att.value = "active";
	e.setAttributeNode(att);
	activeElement = e;
	var b = activeElement.id;
	if (b == 'button-action1') {
		$('.custom-main-panel').show();
		$('.upcoming-events').show();
		$('.recommended-content').hide();
	} else if (b == 'button-action2') {
		$('.custom-main-panel').hide();
		$('.upcoming-events').hide();
		$('.recommended-content').show();
	} else if (b == 'button-action3') {
		$('.custom-main-panel').hide();
		$('.upcoming-events').hide();
		$('.recommended-content').hide();
	}
}

function jqueryInclus(x) {
	if ($(x).is(":hidden")) {
		$(x).slideDown(1000);
	} else {
		$(x).slideUp(1000);
	}
}
function imageIsLoaded(e) {
	var txt = "<div class=\"col-xs-6 col-md-2\"><a href=\"#\" class=\"thumbnail\"><img src=" + e.target.result + " alt=\"...\"></a><span class=\"glyphicon glyphicon-remove\" style=\"position:absolute;top:4px;right:20px;cursor:pointer;\" onclick=\"removeImage(this)\"></span></div>"
	$('#rwt').append(txt);
};

function submitSearch() {
	var x = document.getElementById("src-input");
	if (x.value.length != 0 && x.value != "") {
		window.location.assign("facebook.com");
		alert("here");
	}
}