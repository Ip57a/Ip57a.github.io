let path = getPath();
$.get(path + "xml/news.xml", function(xml)
{
	let xmlData = parseXml(xml);
	appendData(xmlData);
});

function getPath()
{
	let path = window.location.origin + 
	window.location.pathname;
	if (path != "" && path.charAt(path.length - 1) != "/")
	{
		path +="/";
	}
	return path;
}

function appendData(xmlData)
{
	let options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	}
	$.each(xmlData, function(index, item){
		$("#news").append("<p>" + item.date.toLocaleString("ru", options) + "<p>");
		$.get(getPath() +"news/" + item.href, function(html)
		{
			addNew(html, item.date);
		});

	});
}

function addNew(html, date)
{
	let doc = new DOMParser().parseFromString(html, "text/html");
	let section = $(doc).find("section");
	$(section).find("p:gt(0)").remove();
	let options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	}
	$(section).find("h2:eq(0)").addClass("has_date").append('<span class="date">' + date.toLocaleString("ru", options) + '</span>');
	let p = $(section).find("p");
	let innerHtml = p[0].innerHTML;
	if (innerHtml.length > 500)
	{
		innerHtml = innerHtml.substring(0, 500);
		p[0].innerHTML = innerHtml;
	}
	$("#news").append(section);
	

}

function parseXml(xml)
{
	let xmlData=[];
	$(xml).find("new").each(function(){
		let item={};
		let year = $(this).children("date").children("year").text();
		let month = $(this).children("date").children("month").text();
		let day = $(this).children("date").children("day").text();
		item.date = new Date(parseInt(year, 10), parseInt(month - 1, 10), parseInt(day, 10))
		item.href = $(this).children("href").text();
		xmlData.push(item);
	})

	xmlData.sort(function(a, b){
		return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
	});

	return xmlData;
}