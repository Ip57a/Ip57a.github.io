let maxAmount = 5;	//макс. кол-во новостей на странице
let sectionNumber;
let sectionArray = [];	//массив полученных новостей
/*let id = window.location.hash;
id = parseInt(id.replace(/#/g, ""));
loadNews(id);*/

// загрузка новостей на главной странице
function mainNews()
{
	let id = window.location.hash;
	id = parseInt(id.replace(/#/g, ""));
	loadNews(id);
}

// перезагрузка навостей на главной странице
function reloadNews(number)
{
	clearNews();
	loadNews(number);
}

// очистка новостей на главной странице
function clearNews()
{
	$("#news *").not("h1").detach();
}

// загрузка наовстей из файла
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

// получение пути к html документу
function getPath()
{
	let path = $.urlPath(window.location.href);
	return path;
}

// получение относительного пути
function getRelativePath()
{
	let path = window.location.pathname;
	if (path != "" && path.charAt(path.length - 1) != "/")
	{
		path +="/";
	}
	return path;
}

// добавление секций с новостями
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
	sectionArray.length = 0;

	$.each(data, function(index, item){
		let path = getPath() + "news/" + item.href + ".html";
		$.ajax({
			url: path, 
			success: function(html)
			{
				sectionArray.push(parseShortNew(html, item));
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


function parseShortNew(html, item)
{
	let section = parseNew(html);
	//$(section).find("figure").remove();
	//$(section).find("img").remove();
	//$(section).find("p:gt(0)").remove();
	$(section).contents().not("h1, h2, h3, h4, h5, h6, div, p, a, br").remove();
	$(section).contents().filter(function(){
		return this.textContent.trim().length === 0;
	}).remove();
	$(section).addClass("sticker");
	let options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	}
	/*$(section).find("h2:eq(0)").addClass("has_date").append('<span class="date">' + item.date.toLocaleString("ru", options) + '</span>');*/
	//let text = $(section).find("p");
	let text = $(section).contents();
	if (text.length == 0)
		return section;

	let innerText; // = p[0].innerHTML;
	let max = current = 0;
	let tags = [];
	let i = 0;
	while (max <= 500 && i < text.length)
	{
		i++;
		innerText = text[i-1].innerText;
		max += innerText.length;
		tags.push(text[i-1]);
		if (max <= 500)
		{
			current = max;
		}
	}

	if (max > 500)
	{
		innerText = innerText.substring(0, 500 - current);
		text[i-1].innerText = innerText + "...";
		text[i-1].innerHTML += "<a href='new.html?fn="+item.href + "'>читать далее</a>";
		/*let attr = "p:gt(" + (i-1) + ")";
		$(section).find(attr).remove();*/
		$(section).children(":gt("+(i-1)+")").remove();
	}
	return section;

}

function parseNew(html)
{
	let doc = new DOMParser().parseFromString(html, "text/html");
	let section = $(doc).find("section#new");
	$(section).removeAttr("id");
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

function getNew()
{
	let fileName = $.urlParam("fn", window.location.search);
	fileName = $.urlPath(window.location.href) + "news/" + fileName + ".html";
	sectionArray.length = 0;
	$.ajax({
		url: fileName,
		success: function(html) {
			sectionArray.push(parseNew(html));
			appendSectionsArray();
		}
	});

}

$.urlParam = function(parametrName, href){
	let results = new RegExp('[\?&]' + parametrName + '=([^&#]*)').exec(href);
	if (results == null){
		return null;
	}
	return results[1] || 0;
}

$.urlPath = function(href){
	let re = new RegExp('^(https*).*/');
	let result = re.exec(href);
	return result == null ? null : result[0] || 0;
}