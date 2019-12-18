$("#banner").load("banner.html");
$("nav.header").load("menu.html");

function whereIs()
{
	let bodyId = $("body").attr("id");
	let name = getBodyName(bodyId);
	if (name.length == 0)
		return;
	let a = $("nav").find("a:contains('" + name + "')");
	a.attr("onclick", "return false;");
	let li = a.parent("li");
	li.addClass("here");
}

function getBodyName(id)
{
	let name = "";
	switch(id) {
		case "home":
			name = "Главная";
			break;
	}
	return name;
}