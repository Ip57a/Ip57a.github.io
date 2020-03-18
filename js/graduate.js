"use strict";
window.graduateObject = {

	emptyAvatar: "images/interface/emptyAvatar.png",

	EmptyAvatars: function() {
		this.averageWidth = 0;
		this.averageHeight = 0;
		this.sumWidth = 0;
		this.sumHeight = 0;
		this.photoLoaded = 0;
		this.data = [];

		this.addData = function(img) {
			if (!img)
				return;
			this.data.push(img);
			if (img.style) {
				this.updateSizeImg(img);
			}
		};

		this.addSize = function(size) {
			if (!size || !size.width || !size.height)
				return
			let memWidth = this.averageWidth;
			let memHeight = this.averageHeight;
			this.sumWidth += size.width;
			this.sumHeight += size.height;
			if (this.photoLoaded < 0)
				this.photoLoaded = 0;
			this.photoLoaded++;
			this.averageWidth = this.sumWidth / this.photoLoaded;
			this.averageHeight = this.sumHeight / this.photoLoaded;
			if (this.sizeChanged 
				&& typeof this.sizeChanged == "function"
				&& (memWidth != this.averageWidth 
				|| memHeight != this.averageHeight)) {
				this.sizeChanged();
			}
		};

		this.sizeChanged = null;

		this.updateSizeData = function() {
			for (let i = 0; i < this.data.length; i++) {
				this.updateSizeImg(this.data[i]);
			}
		};

		this.updateSizeImg = function(img) {
			if (!img || !img.style)
				return;
			let width = this.averageWidth > 0 
				? this.averageWidth : 0;
			let height = this.averageHeight > 0 
				? this.averageHeight : 0;
			img.style.width = width + "px";
			img.style.height = height + "px";
		};
	},
	
	/* data - объект {_class, year}*/
	createClass: function(data) {
		if (!data || !data._class || !data.year)
			return;
		let _class = data._class;
		let year = data.year;
		let where = "#graduatesArticle";
		where = document.querySelector(where);
		let div = createTag("div", "graduateList");
		this.appendElements(div, 
			this.getTitle(_class.name, year),
			this.getCurator(_class),
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

	getTitle: function(name, year) {
		if (!name || !year)
			return null;
		let title = this.createTag("h2", "caption_lvl2");
		title.innerHTML = year + ' "' + name + '"';
		return title;
	},

	getCurator: function(_class) {
		let curatorName = this.findCuratorName(_class);
		let curatorPhoto = this.findCuratorPhoto(_class);
		if (!curatorName && !curatorPhoto)
			return;
		let section = this.createTag("div", "graduateList__section", "graduateList__section_center");
		let figure = this.createPhoto("Классный руководитель " + curatorName, curatorPhoto ? curatorPhoto : this.emptyAvatar);
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
		let emptyAvatars = new this.EmptyAvatars()
		emptyAvatars.sizeChanged = emptyAvatars.updateSizeData;
		let section = createTag("div", "graduateList__section", 
			"graduateList__section_row");
		for (let i = 0; i < _class.students.length; i++) {
			let photoPath = _class.students[i].photo;
			if (!photoPath) {
				photoPath = this.emptyAvatar;
			}
			let student = this.createPhoto(_class.students[i].name, photoPath);
			if (student) {
				section.appendChild(student);
				if (photoPath === this.emptyAvatar) {
					this.addEmptyAvatar(student, emptyAvatars);
				}else {
					this.updateEmptyAvatars(student, emptyAvatars);
				}
			}
		}
		return section;
	},

	addEmptyAvatar: function(student, emptyAvatars) {
		if (student && emptyAvatars) {
			let img = student.querySelector("img");
			if (img) {
				emptyAvatars.addData(img);
			}
		}
	},

	updateEmptyAvatars: function(student, emptyAvatars) {
		if (student && emptyAvatars) {
			let img = student.querySelector("img");
			if (img) {
				if (this.isImageLoaded(img)) {
					emptyAvatars.addSize({width: img.clientWidth,
						height: img.clientHeight});
				} else {
					let self = this;
					img.onload = function() {
						emptyAvatars.addSize({width: this.clientWidth,
							height: this.clientHeight});
						this.onload = null;
					}
					img.onerror = function() {
						this.src = self.emptyAvatar;
						self.addEmptyAvatar(student, emptyAvatars);
					}
				}
			}
		}
	},

	isImageLoaded: function(img) {
		return (img && img.complete && img.clientWidth > 0);
	},

	createPhoto: function(name, photo, additionalClasses) {
		let figure = createTag("figure", "graduateList__photoContainer");
		if (photo) {
			let img = createTag("img", "graduateList__photo", additionalClasses);
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
			let photo = this.createPhoto(null, _class.groupPhoto[i], "graduateList__photo_big");
			if (photo)
				section.appendChild(photo);
		}
		return section;
	},

	createTag: function(tagName, classNames) {
		let tag = document.createElement(tagName);
		for (let i = 1; i < arguments.length; i++) {
			if (!arguments[i])
				continue;
			tag.classList.add(arguments[i]);
		}
		return tag;
	},
}