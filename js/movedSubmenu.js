"use strict";
(function ($) {
$.fn.extend({
	constantVisible:function(){
		let objects = [];
		window.addEventListener("scroll", scrollAll);
		let oldWindowOffset = window.pageYOffset;
		return this.each(function() {
			this.style.position = "relative";
			objects.push(this);
		})

		function scrollAll() {
			for (let i = 0; i < objects.length; i++) {
				scrollElem(objects[i]);
			}
			oldWindowOffset = window.pageYOffset;
		}

		function scrollElem(elem) {
			let offset = getOffset(elem);
			elem.style.top = offset + "px";
		}

		function getOffset(elem) {
			let offset = elem.offsetTop - window.pageYOffset;
			let offTop = parseInt(elem.style.top) || 0;
			let maxOff = maxOffset(elem);
			if (elem.offsetHeight < 
				document.documentElement.clientHeight) {
				offset = getOffsetTop(elem);
			} else {
				let direction = getDirection();
				if (direction >= 0) {
					offset = getOffsetBottom(elem);
				}else {
					offset = getOffsetTop(elem);
				}
			}
			return maxOff < offset ? maxOff : offset;

		}

		function getDirection() {
			return window.pageYOffset - oldWindowOffset;
		}

		function maxOffset(elem) {
			let parent = elem.parentElement;
			let parentStyle = window.getComputedStyle(parent);
			let elemStyle = window.getComputedStyle(elem);
			return parent.clientHeight - elem.offsetHeight -
				(parseInt(parentStyle.paddingBottom) || 0) -
				(parseInt(parentStyle.paddingTop) || 0) -
				(parseInt(elemStyle.marginBottom) || 0) - 
				(parseInt(elemStyle.marginTop) || 0);
		}

		function getOffsetTop(elem) {
			let offset = getCurrentOffset(elem) + 5;
			let offTop = getCurrentOffTop(elem);
			let direction = getDirection();
			if ((direction >= 0 
				&& (elem.offsetTop - 5 < window.pageYOffset))
				|| (direction < 0 && (elem.offsetTop + 5 > window.pageYOffset))) {
				if (offset > 0 || offTop > 0) {
					offset += offTop;
				}
			} else 
				return offTop;
			if (offset < 0) 
				return 0;
			return offset;
		}

		function getOffsetBottom(elem) {
			let offTop = getCurrentOffTop(elem);
			let offset = offTop;
			if (window.pageYOffset + 
				document.documentElement.clientHeight > 
				5 + elem.offsetHeight + elem.offsetTop) {
				offset = window.pageYOffset + 
				document.documentElement.clientHeight - 
				(5 + elem.clientHeight + elem.offsetTop - offTop);
				if (offset < 0)
					return 0;
			}
			return offset;
		}

		function getCurrentOffset(elem) {
			return window.pageYOffset - elem.offsetTop;
		}

		function getCurrentOffTop(elem) {
			return parseInt(elem.style.top) || 0;
		}
	}
});
})(jQuery);