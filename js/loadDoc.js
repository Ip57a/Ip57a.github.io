$(document).ready(function(){
	let a = newWindowLink();
	//a.attr("onclick", "return !window.open(this.href);")	
	a.on("click", newOpenWindow);
	//открытие ссылок в отдельном окне, если не заблокировано настройками

	//ссылки, которые нужно открывать в отдельном окне
	function newWindowLink() {
		let a = $("a").filter(function(index, element) {
			let href = element.getAttribute("href");
			if (href == undefined)
				return false;
			let re = /^(https?:\/\/)|(\.(png)|(jpe?g)|(gif)|(pdf))$/i;
			return re.test(href);
		})
		return a;
	}

	function newOpenWindow(){
		return !window.open(this.href);
	}

	// $(".flexContainer__subNav").each(function() {
	// 	$(this).constantVisible2();
	// });
})

