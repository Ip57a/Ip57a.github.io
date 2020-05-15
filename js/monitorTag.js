"use strict";
(function($){
$.fn.extend({
	monitorTag:function(options) {
		let defaults = {
			className: "body",
			elemAdded: null,	//функция обратного вызова
			//на вход передается найденный добавленный элемент
			//elemAdded(elem)
		}
		let settings = $.extend(defaults, options);

		let documentObserver = new MutationObserver(
			function(mutationRecords, observer) {
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
			checkElem(document.body);
		}

		function bodyCallback(mutationRecords, observer) {
			for (let i = 0; i < mutationRecords.length; i++) {
				let records = mutationRecords[i];
				for (let j = 0; j < records.addedNodes.length; j++) {
					let elem = records.addedNodes[j];
					checkElem(elem);
				}
			}
		}

		function checkElem(elem) {
			if (elem.nodeType === 1) {
				$(elem).find(settings.className).each(function(){
					notify(this);
				});
				/*	notify(elem);
				else {
					let elements = elem.querySelectorAll(settings.className);
					for (let i = 0; i < elements.length; i++) {
						notify(elements[i]);
					}
				}*/
			}
		}

		function notify(elem) {
			if (typeof settings.elemAdded !== "function"
				|| !elem)
				return;
			settings.elemAdded(elem);
		}

	}
});
})(jQuery);