$(document).ready(function(){
	let a = newWindowLink();
	a.attr("onclick", "return !window.open(this.href);")	//открытие ссылок в отдельном окне, если не заблокировано настройками
})

//ссылки, которые нужно открывать в отдельном окне
function newWindowLink() {
	let a = $("a").filter(function(index, element) {
		let href = element.getAttribute("href");
		if (href == undefined)
			return false;
		let re = /(\.(docx?)|(png)|(jpe?g)|(gif)|(pdf))$/i;
		return re.test(href);
	})
	return a;
}