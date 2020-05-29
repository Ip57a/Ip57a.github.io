"use strict";
(function ($) {
$.fn.extend({
	constantVisible: function(options) {
		let defaults = {
			top: 5,
			bottom: 5,
		}
		const FIXED = "fixed";
		const ABSOLUTE = "absolute";

		let settings = $.extend(defaults, options);
		settings.top = parseInt(settings.top) || 0;
		settings.bottom = parseInt(settings.bottom) || 0;
		let objects = [];
		let direction = 0;	//направление скрола
		let directionChanged;	//смена направления скрола
		window.addEventListener("scroll", scrollAll);
		let oldWindowOffset = window.pageYOffset;

		return this.each(function() {
			if (!this.classList.contains("movedMenu__item_unfixed"))
				this.classList.add("movedMenu__item_unfixed");
			if (this.classList.contains("movedMenu__item_fixed"))
				this.classList.remove("movedMenu__item_fixed");
			let parent = this.parentElement;
			let object = {
				node: this,
				state: ABSOLUTE
			};
			objects.push(object);
			let node = this;
			setMinWidth(object);
			window.addEventListener("resize", function() {
				if (object.state === FIXED) {
					copyProperty(node);
				}
				setMinWidth(object);
				fixedStateCommand(object);
				absoluteStateCommand(object);
			});
		})

		function setMinWidth(object) {
			let parent = object.node.parentElement;
			if (parent.clientWidth > object.node.offsetWidth) {
				let style = window.getComputedStyle(object.node);
				let width = parent.clientWidth 
					- (parseInt(style.marginLeft) || 0)
					- (parseInt(style.marginRight) || 0);
				object.node.style.minWidth = width + "px";
			}
		}

		function copyProperty(node) {
			let parent = node.parentElement;
			if (!parent)
				return;
			let style = window.getComputedStyle(node);
			let margin = (parseInt(style.marginLeft) || 0)
				+ (parseInt(style.marginRight)|| 0);
			node.style.maxWidth = parent.clientWidth
				- margin + "px";
		}

		function clearProperty(node) {
			node.style.maxWidth = "";
		}

		function scrollAll(){
			let direct = getDirection();
			if (direct === 0 && direction !== 0)
				return;
			if (direct === - direction 
				&& direction !== 0)
				directionChanged = true;
			else
				directionChanged = false;
			direction = direct;
			for (let i = 0; i < objects.length; i++) {
				scrollElem(objects[i]);
			}
			oldWindowOffset = window.pageYOffset;
		}

		function scrollElem(object) {
			let command;
			switch (object.state) {
				case FIXED:
					command = fixedStateCommand;
					break;
				case ABSOLUTE:
				default:
					command = absoluteStateCommand;
					break;
			}
				command(object);
		}

		function fixedStateCommand(object) {
			let node = object.node;
			let rect = node.getBoundingClientRect();
			let top = rect.top;
			let bottom = rect.bottom;
			let height = node.offsetHeight + settings.top
				+ settings.bottom;
			let parent = node.parentElement;
			let parentTop, parentBottom;
			let screenHeight = document.documentElement
				.clientHeight;
			if (parent) {
				let parentRect = parent.getBoundingClientRect();
				parentTop = parentRect.top;
				parentBottom = parentRect.bottom;
			} else {
				parentTop = 0;
				parentBottom = screenHeight;
			}

			if (top <= parentTop + settings.top) {
				//находимся выше начального положения
				absolute(object);
				node.style.top = "0";
				node.style.bottom = "";
			}else if(parent && bottom - parentBottom > 1) {
				//находимся ниже родителя
				absolute(object);
				node.style.top = parent.offsetHeight
					- node.offsetHeight + "px";
				node.style.bottom = "";
			}else if (height > screenHeight) {
				//размеры меню больше экрана
				if (directionChanged) {
					absolute(object);
					let offset = oldWindowOffset
					- parent.offsetTop + settings.top;
					if (direction === -1) {
						offset += screenHeight - height;
					}
					node.style.top = offset + "px" ;
					node.style.bottom = "";
				}
			}
		}

		function absoluteStateCommand(object) {
			let node = object.node;
			let rect = node.getBoundingClientRect();
			let top = rect.top;
			let bottom = rect.bottom;
			let parent = node.parentElement;
			let parentTop, parentBottom;
			let screenHeight = document.documentElement
				.clientHeight;
			if (parent) {
				let parentRect = parent.getBoundingClientRect();
				parentTop = parentRect.top;
				parentBottom = parentRect.bottom;
			} else {
				parentTop = 0;
				parentBottom = screenHeight;
			}

			if (node.offsetHeight + settings.top
				+ settings.bottom < screenHeight) {
				// размеры меню меньше экрана
				if (direction === 1) {
					//скролл вниз
					if (top <= settings.top 
						&& bottom - parentBottom < -1) {
						fixed(object);
						node.style.top = settings.top + "px";
						node.style.bottom = "";
					}
				} else {
					//скролл вверх
					if (top >= settings.top
						&& bottom - parentBottom >= -1
						&& top > parentTop) {
						fixed(object);
						node.style.top = settings.top + "px";
						node.style.bottom = "";
					}
				}
			} else {
				// размеры меню больше экрана
				if (direction >= 0){
					//направление вниз
					if (bottom - parentBottom < -1
						&& bottom + settings.bottom < screenHeight) {
						fixed(object);
						node.style.top = "";
						node.style.bottom = settings.bottom + "px";
					}
				} else {
					// направление вверх
					if (top >= settings.top 
						&& top > parentTop + settings.top) {
						fixed(object);
						node.style.bottom = "";
						node.style.top = settings.top + "px";
					}
				}
			}
		}

		function fixed(object) {
			if (object.state === FIXED)
				return;
			let node = object.node;
			copyProperty(node);
			node.classList.remove("movedMenu__item_unfixed");
			node.classList.add("movedMenu__item_fixed");
			object.state = FIXED;
		}

		function absolute(object) {
			if (object.state === ABSOLUTE)
				return;
			let node = object.node;
			node.classList.remove("movedMenu__item_fixed");
			node.classList.add("movedMenu__item_unfixed");
			clearProperty(node);
			object.state = ABSOLUTE;
		}

		function getDirection(){
			let direct = window.pageYOffset - oldWindowOffset
			return direct > 0 ? 1 : (direct < 0 ? -1 : 0);
		}
	}
});
})(jQuery);