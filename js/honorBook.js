"use strict";
$(".honorBook").booklet({
	closed: true,
	autoCenter: true,
	pageNumbers: false,
	covers: true,
});

let honorBook = {
	listPageAmount: 0,
	pages: [1, 65535],
	linkPages: new Map(),
	addedHonorPage: new Map(),
	linkArray:[],
	book: null,

	loadList: function() {
		let self = this;
		$.get($.getPath() + "xml/honorBookList.xml", function(xml) {
			let book = self.parseList(xml);
			self.formateList(book);
		});
	},

	parseList: function(xml) {
		let book = {
			pages: [],
		}
		$(xml).find("page").each(function() {
			let page = {
				sections: [],
			};
			$(this).find("section").each(function() {
				let section = {
					year: $(this).children("year").text(),
					items: [],
				}
				$(this).find("item").each(function() {
					let item = {
						text: $(this).children("text").text(),
						ref: $(this).children("ref").text(),
					}
					section.items.push(item);
				});
				page.sections.push(section);
			});
			book.pages.push(page);
		});
		return book;
	},

	formateList: function(book) {
		if (!this.book)
			return;
		for (let i = 0; i < book.pages.length; i++) {
			let page = this.createListPage(book.pages[i]);
			this.addListPage(page);
			this.addLinkArray(book.pages[i]);
		}
	},

	addLinkArray: function(page) {
		for (let i = 0; i < page.sections.length; i++) {
			let section = page.sections[i];
			for (let j = 0; j < section.items.length; j++) {
				let ref = section.items[j].ref;
				this.linkArray.push(ref);
				this.linkPages.set(ref, 
					this.linkPages.size + 1);
			}
		}
	},

	addListPage: function(page) {
		this.addPage(this.pages.length, page);
		this.listPageAmount++;
	},

	addPage: function(pageNumber, page) {
		if (!this.book)
			return;
		let index = this.findNewIndex(pageNumber);
		this.pages.splice(index, 0, pageNumber);
		this.book.booklet("add", index + 1, page.outerHTML);
	},

	findNewIndex: function(pageNumber) {
		let startIndex = 0;
		let stopIndex = this.pages.length - 1;
		if (pageNumber < this.pages[startIndex])
			return startIndex;
		if (pageNumber > this.pages[stopIndex])
			return this.pages.length;
		let currentIndex = 0;
		while (startIndex < stopIndex - 1) {
			if (this.pages[currentIndex] === pageNumber)
				currentIndex++;
			else
				currentIndex = this.div(stopIndex - startIndex, 2)
				+ startIndex;
			if (this.pages[currentIndex] <= pageNumber 
				&& this.pages[currentIndex + 1] > pageNumber) 
				return currentIndex + 1;
			else if (this.pages[currentIndex] <= pageNumber)
				startIndex = currentIndex;
			else 
				stopIndex = currentIndex;
		}
		return startIndex + 1;
	},

	createListPage: function(page) {
		let listPage = this.createTag("div");
		for (let i = 0; i < page.sections.length; i++) {
			let listSection = this.createSection(page.sections[i]);
			listPage.appendChild(listSection);
		}
		return listPage;
	},

	createSection: function(section) {
		let listSection = this.createTag("div", "honorBook__listSection");
		let year = this.createYearListItem(section.year);
		listSection.appendChild(year);
		for (let i = 0; i < section.items.length; i++) {
			let item = this.createListItem(section.items[i]);
			listSection.appendChild(item);
		}
		return listSection;
	},

	createYearListItem: function(year) {
		let yearItem = this.createTag("p", "honorBook__listYear");
		yearItem.innerHTML = year;
		return yearItem;
	},

	createListItem: function(item) {
		let listItem = this.createTag("a", "honorBook__listItem");
		listItem.innerHTML = item.text;
		listItem.dataset.ref = item.ref;
		return listItem;
	},

	createTag: function(tagName, classNames) {
		let tag = document.createElement(tagName);
		for (let i = 1; i < arguments.length; i++) {
			if (arguments[i])
				tag.classList.add(arguments[i]);
		}
		return tag;
	},

	pageAdded: function(event, data) {
		/* Глюк в библиотеке, в data.page приходит не 
		 * добавленная страница. Приходится брать преды-
		 * дущий фрагмент*/
		let page = data.page.previousSibling;
		let links = page.querySelectorAll(".honorBook__listItem");
		let onClick = this.listLinkClick.bind(this);
		if(links.length) {
			for (let i = 0; i < links.length; i++) {
				links[i].addEventListener("click", onClick);
			}
		}
	},

	listLinkClick: function(event) {
		event.preventDefault();
		let link = event.target.dataset.ref;
		if (!link)
			return;
		this.gotoPageBylink(link);
	},

	gotoPageBylink: function(link) {
		let pageNumber = this.addedHonorPage.get(link);
		if (pageNumber) {
			this.gotoPage(pageNumber);
			return;
		}
		this.loadPage(link);
	},

	loadPage: function(link, callback) {
		let self = this;
		$.get($.getPath() + link, function(xml) {
			let honor = self.parseHonor(xml, link);
			if (!honor)
				return;
			let pageNumber = self.findNewIndex(honor.id 
				+ self.listPageAmount + 1) + 1;
			self.addedHonorPage.set(link, pageNumber);
			self.addHonorPages(honor);
			self.gotoPage(pageNumber);
		});
	},

	addHonorPages: function(honor) {
		if (!honor || !honor.texts || honor.texts.length <= 0)
			return;
		let photoPage = this.createHonorPhotoPage(
			honor.photo);
		if (!photoPage)
			return;
		for (let i = 0; i < honor.texts.length; i++) {
			let pageNumber = this.findNewIndex(honor.id
				+ this.listPageAmount + i * 2) + 1;
			this.addPage(pageNumber, photoPage);
			let page = this.createHonorTextPage(honor.title, honor.texts[i]);
			this.addPage(pageNumber + 1, page);
		}
	},

	createHonorPhotoPage: function(ref) {
		if (!ref || !ref.length)
			return null;
		let section = this.createTag("div", "honorBook__section");
		let photo = this.createTag("div", "honorBook__photo");
		photo.style.background = 'center / contain url("'+ ref + '") no-repeat';
		section.appendChild(photo);
		return section;
	},

	createHonorTextPage: function(title, text) {
		// TODO: сделать добавление титульной надписи
		let div = this.createTag("div", "honorBook__textContainer");
		let caption = this.createTag("h2", "caption_lvl2");
		caption.innerText = title;
		div.appendChild(caption);
		let paragraph = this.createTag("div");
		paragraph.innerHTML = text;
		div.appendChild(paragraph);
		
		return div;
	},

	findHonorId: function(link) {
		return this.linkPages.get(link) || 0;
	},

	parseHonor: function(xml, link) {
		if (!link)
			return null;
		let honor = {
			id: this.findHonorId(link),
			photo: $(xml).children("section")
				.children("photo").text(),
			title: $(xml).children("section")
				.children("title").text(),
			texts: [],
		}
		if (!honor.id || honor.id <= 0)
			return null;
		$(xml).children("section").find("text")
			.each(function(){
				//honor.texts.push($(this).html());
				honor.texts.push($(this).text());
		});
		return honor;
	},

	gotoPage: function(pageNumber) {
		if (this.book)
			this.book.booklet("gotopage", pageNumber);
	},

	isInt: function(value) {
		if (isNaN(value))
			return false;
		let x = parseFloat(value);
		return (x | 0) === x;
	},

	//целочисленное деление
	div: function(val, by) {
		return (val - val % by) / by;
	}
}

honorBook.book = $(".honorBook");
honorBook.book.bind("bookletadd", function(event, data) {
	honorBook.pageAdded(event, data);
});
honorBook.loadList();