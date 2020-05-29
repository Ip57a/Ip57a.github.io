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
	},

	constantVisible2: function(options){
		let defaults = {
			top: 5,
			bottom: 5,
		}
		const FIXED = "fixed";
		const ABSOLUTE = "absolute";
		const UNFIXED = "unFixed";

		let settings = $.extend(defaults, options);
		settings.top = parseInt(settings.top) || 0;
		settings.bottom = parseInt(settings.bottom) || 0;
		let objects = [];
		let direction = 1;	//направление скрола
		let directionChanged;	//смена направления скрола
		window.addEventListener("scroll", scrollAll);
		let oldWindowOffset = window.pageYOffset;

		return this.each(function() {
			let copyNode = this.cloneNode(true);
			copyNode.style.display = "none";
			copyNode.style.position = "fixed";
			copyNode.style.top = settings.top + "px";
			copyProperty(this, copyNode);
			document.body.appendChild(copyNode);
			objects.push({
				node: this,
				copyNode: copyNode,
				state: UNFIXED,
				top: getOffsetTop(this),
				bottom: getOffsetBottom(this),
				// TODO: включить границы элемента с учетом родителей
			});
			let node = this;
			window.addEventListener("resize", function() {
				copyProperty(node, copyNode);
			})
		})

		function getOffsetTop(node) {
			let parent = node;
			let offset = 0;
			do {
				offset += parent.offsetTop;
				parent = parent.offsetParent;
			} while (parent)
			return offset;
		}

		function getOffsetBottom(node) {
			let offset = getOffsetTop(node);
			offset += node.offsetHeight;
			let style = window.getComputedStyle(node);
			offset += parseInt(style.marginBottom) || 0;
			return offset;
		}

		function copyProperty(node, copyNode) {
			let style = window.getComputedStyle(node);
			copyNode.style.width = node.offsetWidth +"px";
			let height = node.offsetHeight;
			copyNode.style.height = height + "px";
			copyNode.style.left = node.offsetLeft - parseInt(style.marginLeft) + "px";
		}

		function scrollAll(){
			let direct = getDirection();
			if (direct === - direction)
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
					command = fixedCommand;
					break;
				case ABSOLUTE:
					command = absoluteCommand;
					break;
				case UNFIXED:
				default:
					command = unfixedCommand;
					break;
			}
			console.log("command");
			/*if (command(object))
				scrollElem(object);*/
				command(object);
		}

		function fixedCommand(object) {
			let upLimit = object.top - settings.top;
			if (window.pageYOffset < upLimit) {
				unFixed(object);
				return true;
			}else {
				let parent = object.node.parentElement;
				if (!parent)
					return false;
				let node = object.node;
				let style = window.getComputedStyle(node);
				let scroll = window.pageYOffset;
				let screenHeight = document.documentElement.clientHeight;
				let visibleHeight = node.offsetHeight
					+ settings.top + settings.bottom;
				if (visibleHeight > screenHeight)
					visibleHeight = screenHeight;
				let parentOffset = getOffsetTop(parent);
				let parentHeight = parent.offsetHeight;
				if ((scroll + visibleHeight > parentOffset + parentHeight)
					|| (visibleHeight >= screenHeight 
						&& directionChanged)) {
						absolute(object);
						return true;
					}
			}
			return false;
		}

		function unfixedCommand(object) {
			let upLimit = object.top - settings.top;
			let downLimit = object.bottom 
				- document.documentElement.clientHeight;
			if (window.pageYOffset > upLimit 
					&& window.pageYOffset > downLimit) {
				fixed(object);
				return true;
			}
			return false;
		}

		function absoluteCommand(object) {
			let upLimit = getOffsetTop(object.copyNode) 
				- settings.top;
			let downLimit = getOffsetBottom(object.copyNode)
				- document.documentElement.clientHeight;
			let parent = object.node.parentElement;
			let maxDownLimit;
			if (parent) {
				maxDownLimit = getOffsetBottom(parent)
					- document.documentElement.clientHeight;
			} else {
				maxDownLimit = 
					document.documentElement.offsetHeight;
			}
			if (window.pageYOffset < upLimit
				|| (window.pageYOffset > downLimit 
					&& window.pageYOffset < maxDownLimit)) {
				fixed(object);
				return true;
			}
			return false;
		}

		function getDirection(){
			let direct = window.pageYOffset - oldWindowOffset
			return direct > 0 ? 1 : (direct < 0 ? -1 : 0);
		}

		function fixed(object) {
			if (object.state === FIXED)
				return;
			console.log("fixed");
			let node = object.node;
			setFixed(object.copyNode);
			setInvisible(node);
			let offset;
			let screenHeight = 
				document.documentElement.clientHeight;
			if (node.offsetHeight + settings.top <
				screenHeight || direction < 0) {
				offset = settings.top;
			} else {
				offset = screenHeight 
					- node.clientHeight
					- settings.top;
			}
			object.copyNode.style.top = offset + "px";
			object.state = FIXED;
		}

		function unFixed(object) {
			if (object.state === UNFIXED)
				return;
			console.log("unFixed");
			setVisible(object.node);
			setDisplayNone(object.copyNode);
			object.state = UNFIXED;
		}

		function absolute(object) {
			if (object.state === ABSOLUTE)
				return;
			console.log("absolute");
			setInvisible(object.node);
			setAbsolute(object.copyNode);
			let node = object.node;
			let parent = node.parentElement;
			let parentOffset;
			let parentMarginBottom, parentPaddingBottom;
			if (parent) {
				parentOffset = getOffsetBottom(parent);
				let style = getComputedStyle(parent);
				parentMarginBottom = 
					parseInt(style.marginBottom) || 0;
				parentPaddingBottom = 
					parseInt(style.paddingBottom) || 0;
			} else {
				parentOffset = document.documentElement.offsetHeight;
				parentMarginBottom = 0;
				parentPaddingBottom = 0;
			}
			let style = window.getComputedStyle(node);
			let marginBottom = parseInt(style.marginBottom) || 0;
			let downLimit = parentOffset
				- node.offsetHeight 
				- marginBottom
				- parentMarginBottom
				- parentPaddingBottom
				- settings.bottom;
			let offset;
			if (window.pageYOffset > downLimit) {
				offset = downLimit;
			} else {
				if (direction < 0) {
					offset = oldWindowOffset
					- node.offsetHeight
					+ document.documentElement.clientHeight;
				} else {
					offset = oldWindowOffset 
						+ settings.top;
				}
			}
			object.copyNode.style.top = offset + "px";
			object.state = ABSOLUTE;
		}

		function setVisible(node) {
			return setProperty(node, "visibility", "visible");
		}

		function setInvisible(node) {
			return setProperty(node, "visibility", "hidden");	
		}

		function setDisplayNone(node) {
			return setProperty(node, "display", "none");
		}

		function setFixed(node) {
			setProperty(node, "display", "");
			setProperty(node, "position", "fixed");
		}

		function setAbsolute(node) {
			return setProperty(node, "position", "absolute");
		}

		function setProperty(node, property, value) {
			if (!node)
				return false;
			let style = window.getComputedStyle(node);
			if (style[property] === value)
				return false;
			node.style[property] = value;
			return true;
		}
	},

	constantVisible3: function(options) {
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
		let direction = 1;	//направление скрола
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
			window.addEventListener("resize", function() {
				if (object.state === FIXED)
					copyProperty(node);
			});
		})

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
			if (direct === - direction)
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
			}else if(parent && bottom > parentBottom) {
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
					- parentTop + settings.top;
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
						&& bottom < parentBottom) {
						fixed(object);
						node.style.top = settings.top + "px";
						node.style.bottom = "";
					}
				} else if (direction === -1) {
					//скролл вверх
					if (top >= settings.top
						&& bottom >= parentBottom
						&& top > parentTop) {
						fixed(object);
						node.style.top = settings.top + "px";
						node.style.bottom = "";
					}
				}
			} else {
				// размеры меню больше экрана
				if (direction === 1){
					//направление вниз
					if (bottom > parentBottom
						&& bottom + settings.bottom > screenHeight) {
						fixed(object);
						node.style.top = "";
						node.style.bottom = settings.bottom + "px";
					}
				} else if (direction === -1) {
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