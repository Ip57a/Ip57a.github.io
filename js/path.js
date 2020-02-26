// получение пути к html документу
$.getPath = function()
{
	let path = $.urlPath(window.location.href);
	return path;
}

$.urlParam = function(parametrName, href){
	let results = new RegExp('[\?&]' + parametrName + '=([^&#]*)').exec(href);
	if (results == null){
		return null;
	}
	return results[1] || 0;
}

$.urlPath = function(href){
	let re = new RegExp('^(https?).*/');
	let result = re.exec(href);
	return result == null ? null : result[0] || 0;
}