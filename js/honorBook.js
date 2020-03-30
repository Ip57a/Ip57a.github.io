"use strict";
$(".honorBook").booklet({
	closed: true,
	autoCenter: true,
	pageNumbers: false,
	covers: true,
});

let honorBook = {
	honorListPath: "xml/honorBookList.xml?1",
	book: null,

	chapters: {
		firstPageNumber: 2, //номер первой после обложки страницы
		//listChapters - список глав
		// key - ссылка, value - id главы
		listChapters: new Map(),
		// addedChapters - массив добавленных глав
		addedChaptersArray: [],
		addedChaptersMap: new Map(),

		addLink: function(link) {
			if (!this.listChapters.has(link))
				this.listChapters.set(link, 
					this.listChapters.size);
		},

		//добавление страниц в главу
		//chapter - глава, в которую добавляются страницы
		//amount - кол-во добавляемых страниц
		addPages: function(chapter, pageAmount) {
			chapter.lastPage += pageAmount;
			this._shiftPages(chapter.index + 1, pageAmount);
		},

		//добавление главы в книгу
		//link - ссылка на страницу
		addChapter: function(link){
			let id = this.listChapters.get(link);
			if (id == undefined)
				return null;
			let chapter = new this._createChapter(id, link);
			this._addChapter(chapter);
			return chapter;
		},

		_createChapter: function(id, link) {
			this.id = id;			//номер по порядку
			this.index = -1;		//индекс в массиве для быстрого поиска
			this.link = link;		//ссылка на файл xml
			this.firstPage = -1;	//первая страница
			this.lastPage = -1;		//последняя страница
		},

		//добавление главы в книгу
		_addChapter: function(chapter) {
			let index = this._findNewIndex(chapter.id);
			this._insertChapter(chapter, index);
		},

		//вставка главы
		//chapter - вставляемая глава
		//index - место, куда вставляется
		_insertChapter: function(chapter, index) {
			this.addedChaptersArray.splice(index, 0, chapter);
			chapter.index = index;
			this.addedChaptersMap.set(chapter.link, chapter);
			let amount = chapter.firstPage === -1 ? 1 :
				chapter.lastPage - chapter.firstPage + 1;
			let firstPage = index === 0 ? this.firstPageNumber : 
				this.addedChaptersArray[index - 1].lastPage + 1;
			if (chapter.firstPage < 0) {
				chapter.firstPage = firstPage;
				chapter.lastPage = firstPage + amount - 1;
			}
			this._shiftPages(index + 1, amount);
		},

		//смещение страниц в книге
		//index - индекс главы, с которой смещяем страницы
		//amount - число, на которое смещаем
		_shiftPages: function(index, amount) {
			for (let i = index; i < this.addedChaptersArray.length; i++) {
				this.addedChaptersArray[i].firstPage += amount;
				this.addedChaptersArray[i].lastPage += amount;
			}
		},

		//поиск нового индекса вставки
		//id - индекс вставки
		_findNewIndex: function(id) {
			let chapters = this.addedChaptersArray;
			if (chapters.length === 0)
				return 0;
			let start = 0;
			let stop = chapters.length - 1;
			let memCurrent = -1;
			let maxCycle = chapters.length;
			while (maxCycle >= 0) {
				maxCycle--;
				let current = honorBook.div(stop - start, 2);
				if (current === memCurrent)
					current++;
				memCurrent = current;
				if (chapters[current].id <= id 
					&& current >= chapters.length - 1)
					return chapters.length;
				else if (chapters[current].id > id 
					&& current === 0)
					return 0;
				else if (chapters[current].id <= id
					&& chapters[current + 1].id > id)
					return current + 1;
				else if (chapters[current].id > id
					&& chapters[current - 1].id <= id)
					return current;
				else if (chapters[current].id > id)
					stop = current;
				else
					start = current;
			}
			return -1;
		},
	},

	loadList: function() {
		let self = this;
		$.get($.getPath() + this.honorListPath, function(xml) {
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
		if (!book || !book.pages.length)
			return;
		let chapters = this.chapters;
		chapters.addLink("list");
		let chapter = chapters.addChapter("list");
		for (let i = 0; i < book.pages.length; i++) {
			let page = this.createListPage(book.pages[i]);
			this.addPage(chapter.firstPage + i, page);
			this.addListLink(book.pages[i]);
		}
		chapters.addPages(chapter, book.pages.length - 1);
	},

	addListLink: function(page) {
		for (let i = 0; i < page.sections.length; i++) {
			let section = page.sections[i];
			for (let j = 0; j < section.items.length; j++) {
				this.chapters.addLink(section.items[j].ref);
			}
		}
	},

	addPage: function(pageNumber, page) {
		if (!this.book)
			return;
		this.book.booklet("add", pageNumber - 1, page.outerHTML);
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
		let page = data.page;
		if (page.nodeType !== 1)
			return;
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
		let chapter = this.chapters.addedChaptersMap.get(link);
		if (chapter != undefined) {
			this.gotoPage(chapter.firstPage);
			return;
		}
		this.loadPage(link);
	},

	loadPage: function(link, callback) {
		let self = this;
		$.get($.getPath() + link, function(xml) {
			let chapter = self.chapters.addChapter(link);
			if (!chapter)
				return;
			let honor = self.parseHonor(xml, link);
			if (!honor)
				return;
			self.addHonorPages(honor, chapter);
			self.gotoPage(chapter.firstPage);
		});
	},

	addHonorPages: function(honor, chapter) {
		if (!honor || !honor.texts || honor.texts.length <= 0
			|| !chapter)
			return;
		let photoPage = this.createHonorPhotoPage(
			honor.photo);
		if (!photoPage)
			return;
		let pageAmount = 0;
		for (let i = 0; i < honor.texts.length; i++) {
			let pageNumber = chapter.firstPage + i * 2;
			this.addPage(pageNumber, photoPage);
			let page = this.createHonorTextPage(honor.title, honor.texts[i]);
			this.addPage(pageNumber + 1, page);
			pageAmount += 2;
		}
		this.chapters.addPages(chapter, pageAmount);
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

	parseHonor: function(xml) {
		if (!xml)
			return null;
		let honor = {
			photo: $(xml).children("section")
				.children("photo").text(),
			title: $(xml).children("section")
				.children("title").text(),
			texts: [],
		}
		$(xml).children("section").find("text")
			.each(function(){
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