"use strict";
(function($){
$.fn.extend({
	/* changingPhoto - применяется к тэгу div
	 * options:
	 * delay - задержка в мс между сменой фото,
	 * duration - время смены фото в мс,
	 * photoPath - массив путей к фотографии,
	 * left/right - смещение фото влево/вправо
	 * за экран в px*/
	changingPhoto:function(options){
		let defaults = {
			delay: 5000,
			duration: 1000,
			photoPath:[],
			left: 300,
			right: 300,
		}
		let settings = $.extend(defaults, options);

		const leftMove = "-" + settings.left + "px center";
		const centerMove = "center";
		const rightMove = settings.right + "px center";

		let photoNumber = 0;
		const url = "url('";

		return this.each(function(){
			$(this).on("transitionend webkitTransitionEnd oTransitionEnd",
				function(){
					replacePhoto(this);
				});
			init(this);
			if (settings.photoPath.length > 1) {
				run(this);
			}
		});

		function init(tag) {
			let backgroundImage = null;
			let path = settings.photoPath;
			if (path.length > 0)
				backgroundImage = url + path[0] + "')";
			if (path.length > 1)
				backgroundImage += ", " + url + path[1] + "')";
			if (backgroundImage)
				tag.style.backgroundImage = backgroundImage;
		}

		function run(tag){
			setTimeout(function(){
				changePhoto(tag);
			}, settings.delay);
		}

		function changePhoto(tag){
			tag.style.transition = "all "+ settings.duration + "ms";
			if (photoNumber % 2 === 0){
				tag.style.backgroundPosition = leftMove +", " 
					+ centerMove;
			} else {
				tag.style.backgroundPosition = centerMove + ", " 
					+ leftMove;
			}
		}

		function replacePhoto(tag) {
			tag.style.transition = "";
			photoNumber++;
			if (photoNumber >= settings.photoPath.length)
				photoNumber = 0;
			let i = photoNumber < settings.photoPath.length - 1 ?
				photoNumber + 1 : 0;
			let oldImage = settings.photoPath[photoNumber];
			let newImage = settings.photoPath[i];
			if (photoNumber % 2 === 1){
				tag.style.backgroundPosition = rightMove + ", " 
					+ centerMove;
				tag.style.backgroundImage = url + newImage 
					+ "'), " + url + oldImage + "')";
			} else {
				tag.style.backgroundPosition = centerMove + ", "
					+ rightMove;
				tag.style.backgroundImage = url + oldImage
					+ "'), " + url + newImage + "')";
			}
			setTimeout(function(){
				changePhoto(tag);
			}, settings.delay);
		}
	}
});
})(jQuery);