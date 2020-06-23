"use strict";
(function($){
$.fn.extend({
	/* changingPhoto - применяется к тэгу div
	 * options:
	 * delay - задержка в мс между сменой фото,
	 * duration - время смены фото в мс,
	 * photoPath - массив путей к фотографии*/
	changingPhoto:function(options){
		let defaults = {
			delay: 5000,
			duration: 1000,
			photoPath:[],
		}
		let settings = $.extend(defaults, options);
		const centerMove = "center";
		let photoNumber = 0;
		const url = "url('";

		return this.each(function(){
			init(this);
			if (settings.photoPath.length > 1) {
				run(this);
			}
		});

		function init(tag) {
			let backgroundImage = null;
			let path = settings.photoPath;
			let backgroundPosition;
			if (path.length > 0){
				backgroundImage = url + path[0] + "')";
				backgroundPosition = "center";
			}
			if (path.length > 1){
				backgroundImage += ", " + url + path[1] + "')";
				backgroundPosition += ", " + getRightMove(tag);
			}
			if (backgroundImage){
				tag.style.backgroundImage = backgroundImage;
				tag.style.backgroundPosition = backgroundPosition;
			}
		}

		function run(tag){
			setTimeout(function(){
				changePhoto(tag);
			}, settings.delay);
		}

		function changePhoto(tag){
			$(tag).on("transitionend webkitTransitionEnd oTransitionEnd",
				function(){
					replacePhoto(tag);
				});
			tag.style.transition = "all "+ settings.duration + "ms";
			if (photoNumber % 2 === 0){
				tag.style.backgroundPosition = getLeftMove(tag) + ", " + centerMove;
			} else {
				tag.style.backgroundPosition = centerMove + ", " + getLeftMove(tag);
			}
		}

		function replacePhoto(tag) {
			$(tag).off("transitionend webkitTransitionEnd oTransitionEnd");
			tag.style.transition = "";
			photoNumber++;
			if (photoNumber >= settings.photoPath.length)
				photoNumber = 0;
			let i = photoNumber < settings.photoPath.length - 1 ?
				photoNumber + 1 : 0;
			let oldImage = settings.photoPath[photoNumber];
			let newImage = settings.photoPath[i];
			if (photoNumber % 2 === 1){
				tag.style.backgroundPosition = getRightMove(tag) + ", " + centerMove;
				tag.style.backgroundImage = url + newImage 
					+ "'), " + url + oldImage + "')";
			} else {
				tag.style.backgroundPosition = centerMove + ", " + getRightMove(tag);
				tag.style.backgroundImage = url + oldImage
					+ "'), " + url + newImage + "')";
			}
			setTimeout(function(){
				changePhoto(tag);
			}, settings.delay);
		}

		function getLeftMove(tag) {
			return "-" + getWidthImage(tag) + "px center";
		}

		function getRightMove(tag) {
			return getWidthTag(tag) + "px center";
		}

		function getWidthTag(tag){
			return tag.clientWidth;
		}

		function getWidthImage(tag){
			let img = document.createElement("img");
			img.src = settings.photoPath[photoNumber];
			if (img.width < img.height)
				return tag.clientWidth;
			let ratio = tag.clientHeight / img.height;
			let width = Math.ceil(img.width * ratio);
			return width;
		}
	}
});
})(jQuery);