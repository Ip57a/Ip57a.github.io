"use strict";
window.graduatesObject = {
	_tag: null,
	_data: {
		data: null,
		ready: false,
		onready: null,
	},

	appendMenu: function(where, has)
	{
		this._tag = where;
		let self = this;
		$.get($.getPath() + "xml/graduates.xml", function(xml)
			{
				let data = self.parseGraduatesXml(xml);
				let menu = self.createSubMenu(data);
				self.addElem(menu);
				self._data.data = data;
				self._data.ready = true;
				if (self._data.onready && typeof self._data.onready == "function")
					self._data.onready();
			});
	},

	findElem: function(where, has)
	{
		return $(where);
	},

	parseGraduatesXml: function(xml){
		let func = function(item, xmlElem) {
			item.name = $(xmlElem).children("name").text();
			item.file = $(xmlElem).children("file").text();
		}
		return this.parseXml(xml, func);
	},

	parseItemGraduatesXml: function(xml) {
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
				let _class = {};
				_class.name = $(this).children("name").text();	
				_class.curator = {};
				_class.curator.name = $(this).children("curator").children("name").text();
				_class.curator.photo = $(this).children("curator").children("photo").text();
				_class.groupPhoto = $(this).children("groupPhoto").text();
				_class.groupPhoto = [];
				$(this).find("groupPhoto").each(function() {
					_class.groupPhoto.push($(this).text());
				});
				_class.students = [];
				$(this).find("student").each(function() {
					let student = {
						name: $(this).children("name").text(),
						photo: $(this).children("photo").text(),
					}
					_class.students.push(student);
				});
				item.classes.push(_class);
			});
			
		}
		return this.parseXml(xml, func);
	},

	parseXml: function(xml, func) {
		let xmlData = [];
		$(xml).find("item").each(function() {
			let item = {};
			func(item, this);
			xmlData.push(item);
		});
		return xmlData;
	},

	addElem: function(elem)
	{
		let tag = this.findElem(this._tag);
		tag.append(elem);
	},

	createSubMenu: function(data)
	{
		let menu = document.createElement("ul");
		menu.classList.add("subNav__container");
		for (let i = 0; i < data.length; i++) {
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
	},

	loadArticle: function()
	{
		if (!this._data.ready)
		{
			this._data.onready = this.loadArticle.bind(this);
			return;
		}
		let name = $.urlParam("n", window.location.search);
		let year = $.urlParam("y", window.location.search);
		let _class = $.urlParam("cl", window.location.search);
		if (name)
			name = decodeURIComponent(name);
		if (year)
			year = decodeURIComponent(year);
		if (_class)
			_class = decodeURIComponent(_class);
		this.updateHere(name);
		let file = this.getFile(name);
		if (file == null)
			return;
		file = $.getPath() + file;
		let self = this;
		$.ajax({
			url: file,
			success: function(xml)
			{
				let xmlData = self.parseItemGraduatesXml(xml);
				if (year && _class) {
					self.appendClass(xmlData, year, _class);
				}else {
					self.appendArticle(xmlData);	
				}
			},
		});
	},

	appendClass: function(xmlData, year, _class) {
		let unit = this.findClass(xmlData, year, _class);
		let script = new MultipleLoadingScript();
		script.src = ["js/graduate.js?1"];
		script.runOnLoad = [{funcName: "graduateObject.createClass", param: unit}];
		script.start();
	},

	findClass: function(xmlData, year, _class) {
		for (let i = 0; i < xmlData.length; i++) {
			let item = xmlData[i];
			if (item.year != year) 
				continue;
			for (let j = 0; j < item.classes.length; j++) {
				let unit = item.classes[j];
				if (unit.name == _class)
					return unit;
			}
		}
		return null;
	},

	getFile: function(name)
	{
		let data = this._data.data;
		for (let i = 0; i < data.length; i++) {
			if (name == data[i].name) {
				return data[i].file;
			}
		}
		return data[0].file;
	},

	appendArticle: function(xmlData){
		let where = "#graduatesArticle";
		for (let i = 0; i < xmlData.length; i++) {
			this.appendYear(where, xmlData[i]);
			this.createGraduatesPanel(where, xmlData[i]);
		}
	},

	appendYear: function(where, item) {
		let year = item.year;
		if (year != undefined) {
			let h2 = this.createTag("h2", "caption_lvl2");
			h2.innerText = year;
			$(where).append(h2);
		}
	},

	createTag: function(tagName, classNames) {
		let tag = document.createElement(tagName);
		for (let i = 1; i < arguments.length; i++) {
			tag.classList.add(arguments[i]);
		}
		return tag;
	},

	createGraduatesPanel: function(where, item) {
		let self = this;
		item.classes.forEach(function(_class) {
			let name = _class.name;
			if (name != undefined) {
				let panel = self.createTag("div", "graduatesPanel");
				let p = self.createTag("p", "graduatesPanel__title");
				p.innerText = name;
				$(panel).append(p);
				let div = self.createTag("div", "graduatesPanel__container");
				$(div).append(self.createCuratorPhoto(_class), self.createGroupPhoto(_class));
				panel.onclick = function() {
					let search = window.location.search;
					if (search.length == 0)
						search = "?";
					else
						search += "&"
					search += "y=" + item.year + "&cl=" + name;
					window.location.search = search;
				}
				$(panel).append(div);
				$(where).append(panel);
			}
		})
	},

	createCuratorPhoto: function(_class) {
		let name = _class.curator.name;
		if (!name || name.trim().length == 0)
			return null;
		let photo = _class.curator.photo;
		if (!photo || photo.trim().length == 0)
			return null;
		let caption = "Классный руководитель<br><strong>" + name +
			"</strong>";
		return this.createPhotoContainer(caption, photo, name);
	},

	createGroupPhoto: function(_class) {
		let photo = _class.groupPhoto[0];
		if (photo && photo.length > 0) {
			return this.createPhotoContainer("", photo);
		}
		return this.joinInGroupPhoto(_class);
	},

	joinInGroupPhoto: function(_class) {
		if (!_class.students || !Array.isArray(_class.students))
			return null;
		let src = [];
		for (let i = 0; i < _class.students.length; i++) {
			let path = _class.students[i].photo;
			if (path && path.length > 0) {
				src.push(_class.students[i].photo);
			}

		}
		return getPhotoGalery(src, 140, 120);
	},

	createPhotoContainer: function(caption, photo, alt) {
		let figure = this.createTag("figure", "graduatesPanel__photoContainer");
		let img = this.createTag("img", "graduatesPanel__photo");
		img.src = photo;
		img.alt = alt;
		let figcaption = this.createTag("figcaption", "graduatesPanel__photoCaption");
		figcaption.innerHTML = caption;
		$(figure).append(img, figcaption);
		return figure;
	},

	updateHere: function(name) {
		if (!name)
			name = this._data.data[0].name;
		let li = $(".subNav .here");
		li.removeClass("here");
		let a = $(li).find("a:contains('" + name + "')");
		li = a.parent("li");
		li.addClass("here");
		a.attr("onclick", "return false;")
		
	},
}