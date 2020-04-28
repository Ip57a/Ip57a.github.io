"use strict";
(function($){
$.fn.extend({
	honorBook: function(option) {
		function HonorBook(option) {
			//события
			//массивы событий
			let _initialised = new Set();

			//константы
			const TABLEOFCONTENTS = "list";

			let book = $(option.selector);
			let _tableOfContents = null;	//оглавление книги
			let _chapters = null;					//главы
			//события книги
			let bookEvent = {
				//начало переворачивания страницы
				start: function(event, data) {
						if (checkChapterChanged(data.index)) {
							changeChapter(data.index);
							if (currentChapter) {
								let index = currentChapter.id - 1;
								for (let i = 0; i < 3; i++) {
									addChapterByIndex(index);
									index++;
								}
							}
						}
				},
				//щелчок по ссылке в оглавлении
				clickRef: function(event) {
					event.preventDefault();
					let link = event.target.dataset.ref;
					if (!link)
						return;
					gotoChapter(link);
				}
			}
			//текущая глава
			let currentChapter = null;

			Object.defineProperties(this, {
				//константы событий
				"INITIALISED": {
					value: "init",
				}
			});

			//работа с главами
			function Chapters(tableOfContents) {
				let selfChapters = this;
				//_chaptersMap - карта глав
				//key - ссылка на главу, 
				//value - chapter
				let _chaptersMap = new Map(); 
				//массив для бычтрого поиска по порядку
				let _chaptersArray = [];
				//_addedChaptersMap - добавленные главы
				//key - ссылка на главу,
				//value - добавленая глава
				let _addedChaptersMap = new Map();

				let _firstPage = option.firstPage;
				let _lastPage = _firstPage;
				let _pageAmount = 0;

				Object.defineProperties(this, {
					"firstPage": {
						get: function() {
							return _firstPage;
						},
					},
					"lastPage": {
						get: function() {
							return _lastPage;
						},
					},
					"pageAmount": {
						get: function() {
							return _pageAmount;
						},
					},
					"length": {
						get: function() {
							return _chaptersArray.length;
						}
					}
				});

				this.getChapterByIndex = function(index) {
					return _chaptersArray[index];
				}

				this.getChapterByLink = function(link) {
					return _chaptersMap.get(link);
				}

				this.getChapterByPage = function(pageNumber) {
					let func = function(current) {
						let chapter = _chaptersArray[current];
						if (chapter.firstPage <= pageNumber
							&& chapter.lastPage >= pageNumber)
							return 0;
						else if (chapter.firstPage > pageNumber)
							return -1;
						else
							return 1;
					}
					let current = fastSearch(0, _chaptersArray.length - 1,
						func);
					if (current != null)
						return _chaptersArray[current];
					else
						return current;
				}

				//добавлена ли глава в книгу
				this.isChapterHas = function(link) {
					return _addedChaptersMap.get(link) != undefined;
				}

				//добавление главы в книгу
				this.addChapter = function(link) {
					if (this.isChapterHas(link))
						return false;
					let chapter = this.getChapterByLink(link);
					if (!chapter)
						return false;
					_addedChaptersMap.set(chapter.link, chapter);
					return true;
				}

				//создание главы
				function Chapter (link, id) {
					this.link = link;
					this.id = id;
					this.firstPage = -1;
					this.lastPage = -1;
					Object.defineProperties(this, {
						"length": {
							get: function() {
								if (this.firstPage < 0)
									return -1;
								return this.lastPage - this.firstPage + 1;
							}
						}
					})
				}

				//создание глав по оглавлению
				function createChapters(tableOfContents) {
					let pages = tableOfContents.pages;
					let firstPage;
					if (_chaptersMap.size === 0)
						firstPage = _firstPage;
					else {
						firstPage = _chaptersMap.get(TABLEOFCONTENTS)
							.lastPage + 1;
					}
					for (let i = 0; i < pages.length; i++) {
						let sections = pages[i].sections;
						for (let j = 0; j < sections.length; j++) {
							let items = sections[j].items;
							for (let k = 0; k < items.length; k++) {
								let item = items[k];
								if (item.ref) {
									let chapter = new Chapter(item.ref, 
										_chaptersMap.size);
									chapter.firstPage = firstPage;
									chapter.lastPage = firstPage 
										+ item.amount * 2 - 1;
									if (saveChapter(chapter)) {
										firstPage = chapter.lastPage + 1;
										_lastPage = chapter.lastPage;
										updatePageAmount();
									}
								}
							}
						}
					}
				}

				//создание главы для оглавления
				function createListChapter(tableOfContents) {
					if (!tableOfContents)
						return false;
					let pages = tableOfContents.pages;
					let listChapter = new Chapter(TABLEOFCONTENTS, 0);
					listChapter.firstPage = _firstPage;
					listChapter.lastPage = _firstPage 
						+ pages.length - 1;
					if (pages.length % 2 !== 0)
						listChapter.lastPage++;
					if (saveChapter(listChapter)) {
						_lastPage = listChapter.lastPage;
						updatePageAmount();
					}
					return true;
					
				}

				//быстрый поиск
				//start, stop - начальное и конечное значение соответственно
				//func - функция, принимающая на вход current,
				//и возвращающая 1, если больше, -1, если меньше,
				//и 0, если совпало.
				function fastSearch(start, stop, func) {
					if (func(stop) > 0)
						return stop + 1;
					if (func(start) < 0)
						return (start - 1);
					let maxCycle = stop - start + 1;
					let memCurrent = -1;
					let endFlag = -1;
					while (maxCycle >= 0 && endFlag || start > stop) {
						maxCycle--;
						let current = div(stop - start, 2) + start;
						if (current === memCurrent)
							current++;
						memCurrent = current;
						let endFlag = func(current);
						if (endFlag === 0) {
							return current;
						} else if (endFlag < 0) {
							stop = current;
						} else {
							start = current;
						}
					}
					return null;
				}

				//инициализация глав книги
				function init(tableOfContents) {
					if (!tableOfContents)
						return;
					createListChapter(tableOfContents);
					createChapters(tableOfContents);
				}

				//целочисленное деление
				function div(val, by) {
					return (val - val % by) / by;
				}

				//сохранение новой главы в массивы
				function saveChapter(chapter) {
					if (!(chapter instanceof Chapter))
						return false;
					//если уже есть, возвращаем false
					if (selfChapters.getChapterByLink(chapter.link))
						return false;
					_chaptersMap.set(chapter.link, chapter);
					_chaptersArray.push(chapter);
					return true;
				}

				//обновление кол-ва страниц в книге
				function updatePageAmount() {
					_pageAmount = _lastPage - _firstPage + 1;
				}

				init(tableOfContents);
			}

			//добавление события
			this.addEvent = function(nameEvent, func)  {
				return eventAct(nameEvent, func, "add");
			}

			//удаление события
			this.deleteEvent = function(nameEvent, func) {
				return eventAct(nameEvent, func, "delete");
			}

			//переход на страницу с номеро pageNumber
			this.gotopage = function(pageNumber) {
				if (book) {
					book.booklet("gotopage", pageNumber);
				}
			};

			//инициализация книги, необходимо вызывать
			//сразу после создания
			this.init = function() {
				new Promise(function(resolve, reject) {
					loadTableOfContents(resolve, reject);
				})
				.then(function() {
					_chapters = new Chapters(_tableOfContents);
					createEmptyPages(_chapters.pageAmount);
					_initBook();
					addChapterByLink(TABLEOFCONTENTS);
				})
				.then(function() {

				})
				.catch(function(error) {
					alert(error);
				});
			}

			//добавление главы по индексу
			function addChapterByIndex(index) {
				let chapter;
				if (index >= 0 && index < _chapters.length) {
					chapter = _chapters.getChapterByIndex(index);
					addChapterByLink(chapter.link);
				}
			}

			//добавление главы по ссылке
			function addChapterByLink(link) {
				if (_chapters.isChapterHas(link))
					return;
				let chapter = _chapters.getChapterByLink(link);
				if (!chapter)
					return;
				if (chapter.link === TABLEOFCONTENTS)
					loadListChapter(chapter)
				else
					loadChapter(chapter);
			}

			//добавление страниц в книгу
			//страница просто загружается, кол-во страниц в книге
			//при этом не увеличивается
			function addPages(firstPageNumber, pages) {
				for (let i = 0; i < pages.length; i++) {
					let page = pages[i];
					let emptyPage = getPage(firstPageNumber);
					emptyPage.innerHTML = "";
					emptyPage.appendChild(page);
					firstPageNumber++;
				}
			}

			//смена главы
			function changeChapter(pageNumber) {
				let chapter = _chapters.getChapterByPage(pageNumber);
				if (chapter)
					currentChapter = chapter;
			}

			//проверка изменилась ли глава
			function checkChapterChanged(pageNumber) {
				if (!currentChapter) {
					return true
				}
				if (currentChapter.firstPage > pageNumber 
					|| currentChapter.lastPage < pageNumber)
					return true;
				return false;
			}

			//добавление пустого тега div в книгу
			//теги необходимо добавлять до инициализации
			function createEmptyPages(amount) {
				for (let i = 0; i < amount; i++) {
					for (let j = 0; j < book.length; j++) {
						book[j].appendChild(createTag("div"));
					}
				}
			}

			//создание страницы с фото
			function createHonorPhotoPage(ref) {
				if (!ref || !ref.length)
					return null;
				let section = createTag("div", "honorBook__section");
				let photo = createTag("div", "honorBook__photo");
				photo.style.background = 'center / contain url("'+ ref + '") no-repeat';
				section.appendChild(photo);
				return section;
			}

			//создание страницы с текстом
			function createHonorTextPage(title, text) {
				let div = createTag("div", "honorBook__textContainer");
				let caption = createTag("h2", "caption_lvl2");
				caption.innerText = title;
				div.appendChild(caption);
				let paragraph = createTag("div");
				paragraph.innerHTML = text;
				div.appendChild(paragraph);
				return div;
			}

			//создание ссылки в оглавлении
			function createListItem(item) {
				let listItem;
				if (item.ref) {
					listItem = createTag("a", "honorBook__listItem");
					listItem.dataset.ref = item.ref;
				} else {
					listItem = createTag("p", "honorBook__listItem_disabled");
				}
				listItem.innerHTML = item.text;
				return listItem;
			}

			//создание секции в оглавлении
			function createListSection(section) {
				let listSection = createTag("div", "honorBook__listSection");
				let year = createYearListItem(section.year);
				listSection.appendChild(year);
				for (let i = 0; i < section.items.length; i++) {
					let item = createListItem(section.items[i]);
					listSection.appendChild(item);
				}
				return listSection;
			}

			//создание страницы оглавления
			function createListPage(page) {
				let listPage = createTag("div");
				for (let i = 0; i < page.sections.length; i++) {
					let section = createListSection(page.sections[i]);
					listPage.appendChild(section);
				}
				return listPage;
			}

			//создание страниц оглавления
			function createListPages(tableOfContents, chapter) {
				let pages = tableOfContents.pages;
				let amount = chapter.length > pages.length ?
					pages.length : chapter.length;
				let listPages = [];
				for (let i = 0; i < amount; i++) {
					listPages.push(createListPage(pages[i]));
				}
				return listPages;
			}

			//создание года в оглавлении
			function createYearListItem(year) {
				let yearItem = createTag("p", "honorBook__listYear");
				yearItem.innerHTML = year;
				return yearItem;
			}

			//создание страниц почетных членов
			function createPages(honor, chapter) {
				if (!honor || !honor.texts || honor.texts.length <= 0
					|| !chapter)
					return null;
				let maxPage = chapter.length;
				if (maxPage > honor.texts.length * 2)
					maxPage = honor.texts.length * 2;
				let pages = [];
				for (let i = 0; i < honor.texts.length; i++) {
					let photoPage = createHonorPhotoPage(honor.photo);
					let page = createHonorTextPage(honor.title, honor.texts[i]);
					pages.push(photoPage, page);
				}
				return pages;
			}

			function createTag(tagName, classNames) {
				let tag = document.createElement(tagName);
				for (let i = 1; i < arguments.length; i++) {
					if (arguments[i])
						tag.classList.add(arguments[i]);
				}
				return tag;
			}

			//действие с событием
			//nameEvent - имя события
			//func - функция, связанная с событием
			//act - дествие над событием (добавление, удаление)
			function eventAct(nameEvent, func, act) {
				if (typeof func !== "function")
					return false;
				let events = getEvents(nameEvent);
				if (events)
					return events[act](func);
				else
					return false;
			}

			//добавление события к ссылкам в оглавлении
			function formateListRef(pages) {
				for (let i = 0; i < pages.length; i++) {
					let page = pages[i];
					let links = page.querySelectorAll(".honorBook__listItem");
					if (links.length) {
						for (let j = 0; j < links.length; j++) {
							links[j].addEventListener("click", bookEvent.clickRef);
						}
					}
				}
			}

			//получения множества событий по имени
			function getEvents(nameEvent) {
				switch (nameEvent) {
					case this.INITIALISED:
						return _initialised;
					default:
						return null;
				}
			}

			//получение html страницы по номеру
			function getPage(number) {
				let selector = ".b-page-" + number + ">div";
				let page = book.find(selector)[0];
				return page;
			}

			function gotoChapter(link) {
				addChapterByLink(link);
				let chapter = _chapters.getChapterByLink(link);
				if (chapter) {
					book.booklet("gotopage", chapter.firstPage);
				}
			}

			//инициализация книги
			function _initBook() {
				book.booklet({
						closed: true,
						autoCenter: true,
						pageNumbers: false,
						covers: true,
						arrows: true,
						//shadows: true,
						//shadowBtmWidth: 50,
						//tabs: true,
						nextControlText: "Далее >>>",
						previousControlText: "<<< Назад",
						//overlays: false,
						//manual: false,
					});
				book.bind("bookletstart", bookEvent.start);
			}

			//загрузка главы
			function loadChapter(chapter) {
				let path = $.getPath() + chapter.link;
				$.ajax({
					url: path,
					success: function(xml) {
						let honor = parseHonor(xml);
						let pages = createPages(honor, chapter);
						if (pages) {
							addPages(chapter.firstPage, pages);
							_chapters.addChapter(chapter.link);
						}
					}
				});
			}

			//загрузка главы оглавления
			function loadListChapter(chapter) {
				if (!_tableOfContents)
					return;
				let pages = createListPages(_tableOfContents, chapter);
				formateListRef(pages);
				if (pages) {
					addPages(chapter.firstPage, pages);
					_chapters.addChapter(chapter.link);
				}
			}

			//загрузка оглавления
			function loadTableOfContents(resolve, reject) {
				let path = $.getPath() + option.listRef;
				$.ajax({
					url: path,
					success: function(xml) {
						if (_parseListXml(xml))
							resolve();
						else
							reject("Неверный формат содержания книги");
					},
					error: function() {
						reject("Не удалось загрузить содержание книги");
					},
				})
			}

			//парсим почетных членов из xml
			function parseHonor(xml) {
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
			}

			//парсим оглавление из xml
			function _parseListXml(xml) {
				let table = {pages: [],};
				let list = $(xml).children(TABLEOFCONTENTS)[0];
				if (!list)
					return false;
				$(list).find("page").each(function() {
					let page = {sections: [],}
					$(this).find("section").each(function() {
						let year = $(this).children("year")[0];
						if (year){
							year = $(year).text();
							let section = {
								year: year,
								items: [],
							}
							$(this).find("item").each(function(){
								let text = $(this).children("text")[0];
								let ref = $(this).children("ref")[0];
								let amount = $(this).children("amount")[0];
								if(text) {
									text = $(text).text();
									if (ref) {
										ref = $(ref).text()
									} else	if (!ref || ref.trim().length === 0) {
											ref = null;
									}
									if (amount) {
										amount = parseInt($(amount).text(), 10);
									} else {
										amount = 0;
									}
									let item = {
										text: text,
										ref: ref,
										amount: amount,
									}
									section.items.push(item);
								}
							});
							page.sections.push(section);
						}
					});
					table.pages.push(page);
				});
				_tableOfContents = table;
				return true;
			}

			//уведомление о событии всех подписавшихся
			function sendEvent(nameEvent, value) {
				let event = getEvents(nameEvent);
				if (!event)
					return;
				event.forEach(function(value1) {
					if (typeof value1 === "function")
						value1(value);
				});
			}
		}

		//настройки по умолчанию
		let defaults = {
			firstPage: 2,	//номер первой после обложки страницы,
			selector: ".honorBook", //селектор
			listRef: "",	//ссылка на файл содержания
		}
		let settings = $.extend(defaults, option);

		return new HonorBook(settings);
	}

});
})(jQuery);