"use strict";
window.graduateObject = {
	
	createClass: function(_class, year) {
		let where = "#graduatesArticle";
		where = document.querySelector(where);
		let div = createTag("div", "graduateList");
		this.appendElements(div, this.getCurator(_class),
			this.getGroupPhoto(_class),
			this.getStudents(_class));
		where.appendChild(div);
	},

	appendElements: function(where, elems) {
		if (!elems || !where)
			return;
		for (let i = 1; i < arguments.length; i++) {
			if (arguments[i])
				where.appendChild(arguments[i]);
		}
	},

	getCurator: function(_class) {
		let curatorName = this.findCuratorName(_class);
		let curatorPhoto = this.findCuratorPhoto(_class);
		if (!curatorName && !curatorPhoto)
			return;
		let section = this.createTag("div", "graduateList__section", "graduateList__section_center");
		let figure = this.createPhoto("Классный руководитель " + curatorName, curatorPhoto);
		section.appendChild(figure);
		return section;
	},

	findCuratorName: function(_class) {
		let curator = this.getCuratorRecord(_class);
		if (!curator)
			return null;
		return curator.name && curator.name.length > 0 ? curator.name : null;
	},

	findCuratorPhoto: function(_class) {
		let curator = this.getCuratorRecord(_class);
		if (!curator)
			return null;
		return curator.photo && curator.photo.length > 0 ? curator.photo : null;
	},

	getCuratorRecord: function(_class) {
		if (!_class)
			return null;
		return _class.curator ? _class.curator : null;
	},

	getStudents: function(_class) {
		if (_class.students.length == 0)
			return null;
		let section = createTag("div", "graduateList__section", 
			"graduateList__section_row");
		for (let i = 0; i < _class.students.length; i++) {
			let student = this.createPhoto(_class.students[i].name,
				_class.students[i].photo);
			if (student)
				section.appendChild(student);
		}
		return section;
	},

	createPhoto: function(name, photo) {
		let figure = createTag("figure", "graduateList__photoContainer");
		if (photo) {
			let img = createTag("img", "graduateList__photo");
			img.src = photo;
			figure.appendChild(img);
		}

		if (name) {
			let figcaption = createTag("figcaption", "graduateList__caption");
			figcaption.innerText = name;
			figure.appendChild(figcaption);
		}
		return figure;
	},

	getGroupPhoto: function(_class) {
		if (_class.groupPhoto.length == 0)
			return null;
		let section = createTag("div", "graduateList__section", 
			"graduateList__section_row");
		for (let i = 0; i < _class.groupPhoto.length; i++) {
			let photo = this.createPhoto(null, _class.groupPhoto[i]);
			if (photo)
				section.appendChild(photo);
		}
		return section;
	},

	createTag: function(tagName, classNames) {
		let tag = document.createElement(tagName);
		for (let i = 1; i < arguments.length; i++) {
			tag.classList.add(arguments[i]);
		}
		return tag;
	},
}