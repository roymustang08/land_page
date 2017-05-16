var caller = document.getElementById('caller'),
    loader = document.getElementById('loader'),
	anwserCall = document.getElementById('anwserCall');
function getQueryStringParam(param) {
  var url = window.location.toString();
	  url.match(/\?(.+)$/);
 
 var params = RegExp.$1;
	  params = params.split("&");

 var queryStringList = {};

 for(var i = 0; i < params.length; i++) {

	var tmp = params[i].split("=");
    queryStringList[tmp[0]] = unescape(tmp[1]);
  
  }
  
  return queryStringList[param];
}
function myFunction() {
	if (getQueryStringParam("roomid") && getQueryStringParam("roomid") != "undefined") {
		setTimeout(function(){ 
			loader.style.display = 'none';          
			anwserCall.style.display = 'block';  
		}, 3000);

	}
	else{
		setTimeout(function(){ 
			loader.style.display = 'none';          
			caller.style.display = 'block';  
	}, 3000);
  }
}

			