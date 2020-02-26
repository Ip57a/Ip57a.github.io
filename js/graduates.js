let _tag = null;
let _data = {
	data: null,
	ready: false,
	onready: null,
}

function appendMenu(where, has)
{
	_tag = where;
	$.get($.getPath() + "xml/graduates.xml", function(xml)
		{
			let data = parseGraduatesXml(xml);
			let menu = createSubMenu(data);
			addElem(menu);
			_data.data = data;
			_data.ready = true;
			if (_data.onready && typeof _data.onready == "function")
				_data.onready();
		});
}

function findElem(where, has)
{
	return $(where);
}

function parseGraduatesXml(xml){
	let func = function(item, xmlElem) {
		item.name = $(xmlElem).children("name").text();
		item.file = $(xmlElem).children("file").text();
	}
	return parseXml(xml, func);
}

function parseItemGraduatesXml(xml) {
	let func = function(item, xmlElem) {
		let value = $(xmlElem).children("year").text();
		if (value == null)
			return;
		item.year = value;
		value = $(xmlElem).children("classes");
		if (value == null)
			return;
		item.classes = [];
		value.find("class").each(function() {
			let unit = {};
			unit.name = $(this).children("name").text();	
			unit.curator = {};
			unit.curator.name = $(this).children("curator").children("name").text();
			unit.curator.photo = $(this).children("curator").children("photo").text();
			unit.groupPhoto = $(this).children("groupPhoto").text();
			item.classes.push(unit);
		});
		
	}
	return parseXml(xml, func);
}

function parseXml(xml, func) {
	let xmlData = [];
	$(xml).find("item").each(function() {
		let item = {};
		func(item, this);
		xmlData.push(item);
	});
	return xmlData;
}

function addElem(elem)
{
	let tag = findElem(_tag);
	tag.append(elem);
}

function createSubMenu(data)
{
	let menu = document.createElement("ul");
	menu.classList.add("subNav__container");
	for (var i = 0; i < data.length; i++) {
		let li = document.createElement("li");
		li.classList.add("subNav__item_lvl2");
		let link = document.createElement("a");
		link.href = "?n=" + data[i].name;
		let text = document.createTextNode(data[i].name);
		$(link).append(text);
		$(li).append(link);
		$(menu).append(li);
	}
	return menu;
}

function loadArticle()
{
	if (!_data.ready)
	{
		_data.onready = loadArticle;
		return;
	}
	let name = $.urlParam("n", window.location.search);
	updateHere(name);
	let file = getFile(name);
	if (file == null)
		return;
	file = $.getPath() + file;
	$.ajax({
		url: file,
		success: function(xml)
		{
			let xmlData = parseItemGraduatesXml(xml);
			appendArticle(xmlData);	
		},
	});
}

function getFile(name)
{
	let data = _data.data;
	for (var i = 0; i < data.length; i++) {
		if (name == data[i].name) {
			return data[i].file;
		}
	}
	return data[0].file;
}

function appendArticle(xmlData){
	let where = "#graduatesArticle";
	for (var i = 0; i < xmlData.length; i++) {
		appendYear(where, xmlData[i]);
		createGraduatesPanel(where, xmlData[i]);
	}
}

function appendCurator(item) {
	//let curator = 
}

function appendYear(where, item) {
	let year = item.year;
	if (year != undefined) {
		let h2 = createTag("h2", "caption_lvl2");
		h2.innerText = year;
		$(where).append(h2);
	}
}

function createTag(tagName, classNames) {
	let tag = document.createElement(tagName);
	for (var i = 1; i < arguments.length; i++) {
		tag.classList.add(arguments[i]);
	}
	return tag;
}

function createGraduatesPanel(where, item) {
	item.classes.forEach(function(unit) {
		let name = unit.name;
		if (name != undefined) {
			let panel = createTag("div", "graduatesPanel");
			let p = createTag("p", "graduatesPanel__title");
			p.innerText = name;
			$(panel).append(p);
			let div = createTag("div", "graduatesPanel__container");
			$(div).append(createCuratorPhoto(unit), createGroupPhoto(unit));
			$(panel).append(div);
			$(where).append(panel);
		}
	})
}

function createCuratorPhoto(unit) {
	let name = unit.curator.name;
	if (!name || name.trim().length == 0)
		return null;
	let photo = unit.curator.photo;
	if (!photo || photo.trim().length == 0)
		return null;
	let caption = "Классный руководитель<br><strong>" + name +
		"</strong>";
	return createPhotoContainer(caption, photo, name);
}

function createGroupPhoto(unit) {
	let photo = unit.groupPhoto;
	if (photo && photo.length > 0) {
		return createPhotoContainer("", photo);
	}
	return null;
}

function createPhotoContainer(caption, photo, alt) {
	let figure = createTag("figure", "graduatesPanel__photoContainer");
	let img = createTag("img", "graduatesPanel__photo");
	img.src = photo;
	img.alt = alt;
	let figcaption = createTag("figcaption", "graduatesPanel__photoCaption");
	figcaption.innerHTML = caption;
	$(figure).append(img, figcaption);
	return figure;
}

function updateHere(name) {
	if (!name)
		name = _data.data[0].name;
	let li = $(".subNav .here");
	li.removeClass("here");
	let a = $(li).find("a:contains('" + name + "')");
	li = a.parent("li");
	li.addClass("here");
	a.attr("onclick", "return false;")
	
}