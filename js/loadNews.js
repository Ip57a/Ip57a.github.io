let maxAmount = 5;	//макс. кол-во новостей на странице
let sectionNumber;
let sectionArray = [];	//массив полученных новостей
let id = window.location.hash;
id = parseInt(id.replace(/#/g, ""));
loadNews(id);

function reloadNews(number)
{
	clearNews();
	loadNews(number);
}

function clearNews()
{
	$("#news *").not("h1").detach();
}

function loadNews(number)
{
	if (isNaN(number) || number < 1)
		number = 1;
	$.get(getPath() + "xml/news.xml", function(xml)
	{
		let xmlData = parseXml(xml);
		let amount = Math.ceil(xmlData.length / maxAmount);
		if (number > amount)
			number = amount;
		appendSections(xmlData, number);
	});
}

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

function getRelativePath()
{
	let path = window.location.pathname;
	if (path != "" && path.charAt(path.length - 1) != "/")
	{
		path +="/";
	}
	return path;
}

function appendSections(xmlData, number)
{
	let options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	}

	//получаем maxAmount значений из массива со смещением
	let data = xmlData.slice((number - 1)*maxAmount, number*maxAmount);
	sectionNumber = data.length;

	$.each(data, function(index, item){
		let path = getPath() + "news/" + item.href;
		$.ajax({
			url: path, 
			success: function(html)
			{
				sectionArray.push(getNew(html, item));
			},
			complete: function(){
				sectionNumber--;
				if (sectionNumber == 0)
				{
					appendSectionsArray();
					appendLink(xmlData, number);
				}
			}
		});

	});
}

function appendSectionsArray()
{
	for (let i=0; i<sectionArray.length; i++)
	{
		$("#news").append(sectionArray[i]);
	}
}

function appendLink(xmlData, number)
{
	let amount = Math.ceil(xmlData.length / maxAmount);
	//let amount = 5; //для тестирования
	if (amount < 2)
		return;
	let div = "<div style='text-align:center'>";
	for (i = 1; i < amount; i++)
	{
		if (i != number)
		{
			div += "<a href='#" + i + "' onclick='reloadNews(" + i + ")'> " + i + " </a>";
		}else
		{
			div += "<span class='a_disabled'> " + i + " </span>"
		}
	}
	div += "</div>"
	$("#news").append(div);
}

function getNew(html, item)
{
	let doc = new DOMParser().parseFromString(html, "text/html");
	let section = $(doc).find("section#new");
	$(section).find("p:gt(0)").remove();
	$(section).removeAttr("id");
	let options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	}
	$(section).find("h2:eq(0)").addClass("has_date").append('<span class="date">' + item.date.toLocaleString("ru", options) + '</span>');
	let p = $(section).find("p");
	let innerHtml = p[0].innerHTML;
	if (innerHtml.length > 500)
	{
		innerHtml = innerHtml.substring(0, 500);
		p[0].innerHTML = innerHtml + "...";
	}
	p[0].innerHTML += "<a href='" + getRelativePath() + "news/" + item.href + "'>читать далее</a>"
	return section;

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