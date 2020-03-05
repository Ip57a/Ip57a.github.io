let documentObserver = new MutationObserver(function(mutationRecords, observer) {
	if (document.body) {
		observeBody();
		observer.disconnect();
	}
});
let bodyObserver = new MutationObserver(bodyCallback);

/* При добавлении скрипта в head в начальный момент body == null*/
if (!document.body) {
	documentObserver.observe(document.documentElement, {childList: true});
} else {
	observeBody();
}

function observeBody() {
	bodyObserver.observe(document.body, {childList: true, subtree: true});
	updatePhotoGalery(document.body);
}

/* Обработка элементов фотогалереи.
 * При добавлении элементов в документ начинают загружаться
 * фотографии. Пока фото не загрузились в элементе будет 
 * крутиться progressBar*/
function bodyCallback (mutationRecords, observer) {
	for (let i = 0; i < mutationRecords.length; i++) {
		let record = mutationRecords[i];
		for (let j = 0; j < record.addedNodes.length; j++) {
			updatePhotoGalery(record.addedNodes[j]);
		}
	}
}

function updatePhotoGalery(element) {
	let elements = findPhotoGalery(element);
	preloadImages(elements);
}

function findPhotoGalery(element) {
	if (element.nodeType == 1) {
		if (element.classList.contains("photoGalery")) {
			return element;
		}else {
			let elements = element.querySelectorAll(".photoGalery");
			return elements.length > 0 ? elements : null;
		}
	}
	return null;
}

/* Получение элемента photoGalery 
 * src - массив url фотографий
 * width - ширина элемента
 * height - высота элемента
 *  */
function getPhotoGalery(src, width, height) {
	let arraySrc = src ? (Array.isArray(src) ? src : [src]) : [];
	let tag = createTag("div", "photoGalery");
	tag.photoSrc = arraySrc;
	if (width) {
		tag.style.width = width + "px";
	}
	if (height) {
		tag.style.height = height + "px";
	}
	return tag;
}

function createTag(tagName, classNames) {
	let tag = document.createElement(tagName);
	for (let i = 1; i < arguments.length; i++) {
		tag.classList.add(arguments[i]);
	}
	return tag;
}

function preloadImages(tags) {
	if (!tags)
		return;
	if (tags.length) {
		for (let i = 0; i < tags.length; i++) {
			preloadImage(tags[i]);
		}
	}else {
		preloadImage(tags);
	}
}

/* Предзагрузка картинок*/
function preloadImage(tag) {
	/* TODO: проверить, если в IE метод contains работает, 
	 * тогда заменить везде $.hasClass на этот*/
	let src = tag.photoSrc;
	if (src) {
		tag.loadedImage = 0;
		tag.errorImage = 0;
		tag.imgList = [];
		for (let i = 0; i < src.length; i++) {
			let url = src[i];
			let img = createTag("img");
			img.src = url;

			img.onload = function() {
				tag.loadedImage++;
				tag.imgList.push(img);
				if (checkResLoaded(tag)) {
					updateTag(tag);
				}
				this.onload = null;
			}
			img.onerror = function() {
				tag.errorImage++;
				if (checkResLoaded(tag)) {
					updateTag(tag);
				}
				this.onerror = null;
			}
		}
	}
}

/* Обновление тэга*/
function updateTag(tag) {
	if (!tag || !tag.imgList || !Array.isArray(tag.imgList))
		return;
	let average = getAverageWidthHeight(tag.imgList);
	let column = 0, row = 0;
	let table = getColumnRowAmount(average.width, average.height, 
		tag.imgList.length, tag.clientWidth / tag.clientHeight);
	fillTagBackground(tag, table.column, table.row, tag.imgList);

}

/* Проверка, все ли изображения загружены*/
function checkResLoaded(tag) {
	if (!tag || !tag.photoSrc || !Array.isArray(tag.photoSrc))
		return false;
	return tag.loadedImage + tag.errorImage >= tag.photoSrc.length;
}

/* Получение средних величин размеров изображений*/
function getAverageWidthHeight(imgList) {
	let sumWidth = 0;
	let sumHeight = 0;
	for (let i = 0; i < imgList.length; i++) {
		let img = imgList[i];
		sumWidth += img.width;
		sumHeight += img.height;
	}
	let average = {
		width: sumWidth / imgList.length,
		height: sumHeight / imgList.length,
	}
	return average;
}

/* Определение оптимального кол-ва строк и колонок*/
function getColumnRowAmount(width, height, amount, koef) {
	if (!width || width <= 0 
		|| !height || height <= 0)
		return null;
	if (!koef || koef <= 0)
		koef = 1;
	let column = 1, row = 1;
	let sumWidth = width, sumHeight = height;
	while (column * row < amount) {
		let newWidth = sumWidth + width;
		let newHeight = sumHeight + height;
		let koefWidth = newWidth / sumHeight
		let koefHeight = sumWidth / newHeight
		if (Math.abs(koefWidth - koef) < Math.abs(koefHeight - koef)) {
			column++;
			sumWidth += width;
		} else {
			row++;
			sumHeight += height;
		}
	}
	return {
		column: column, 
		row: row,
	}
}

/* Заполнений фона тэга картинками*/
function fillTagBackground(tag, column, row, imgList) {
	if (!column || !row)
		return;
	let offsetLeft = 0, offsetTop = 0;
	let width = tag.clientWidth / column;
	let height = tag.clientHeight / row;
	let lastOffset = (column * row - imgList.length) * width / 2;
	let color = window.getComputedStyle(tag).backgroundColor;
	let background = "";
	let c = r = 0;
	for (let i = 0; i < imgList.length; i++) {
		let img = imgList[i];
		background += offsetLeft +"px " + offsetTop + "px / "
			+ width + "px " + height + "px url('" 
			+ img.src 
			+ "') no-repeat, ";
			c++;
			offsetLeft += width;
			if (c >= column) {
				c = 0;
				offsetLeft = 0;
				offsetTop += height;
				r++;
				if (r === row - 1) {
					offsetLeft += lastOffset;
				}
			}
	}
	background += color;
	tag.style.background = background;
}