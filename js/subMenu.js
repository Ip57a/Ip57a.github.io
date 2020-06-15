"use strict";
(function($){
$.fn.extend({
	/* Добавляет подменю в меню
	 * className - тэг меню,
	 * menuPath - путь к меню в html*/
	attributesSubMenu:function(options) {
		let defaults = {
			className: ".nav",
			menuPath: "/",
		}
		let settings = $.extend(defaults, options);


		let monitorSettings = {
			className: settings.className,
			elemAdded: elemAdded,
		};

		let menu = null;
		let path = $.getPath() + settings.menuPath;
		$.ajax({
			url: path,
			success: function(html) {
				menu = html;
				$().monitorTag(monitorSettings);
			},
		})

		function elemAdded(elem){
			if (menu && elem)
				$(elem).append(menu);
		}
	},

	updateSubMenu:function() {
		let updateHere = function(name) {
			let li = $(".subNav .here");
			li.removeClass("here");
			let str = ".subNav__item_lvl2 a[href*='" + name +"']";
			let a = $(li).find(str);
			li = a.parent("li");
			li.addClass("here");
			a.onclick = falseFunction;
		}

		function falseFunction() {
			return false;
		}

		function getName() {
			return $("body").attr("id");
		}

		updateHere(getName());
	},
});
})(jQuery);
