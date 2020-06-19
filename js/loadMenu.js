let mainMenuNameSearch = ".nav";
let subMenuNameSearch = "nav.subNav";
$("#banner").load("banner.html");
$(".nav").load("menu.html");

//установка текущего тэга li в основном меню
function setHeaderCurrentLi()
{
	let bodyName = getBodyName();
	if (!bodyName || bodyName == "")
		return;
	let name = getMainMenuName(bodyName);
	let li = getNavLiWhereIs(mainMenuNameSearch, name);
	setLiHere(li);
	name = getSubMenuName(bodyName);
	if (!name)
		return;
	li = getNavLiWhereIs(mainMenuNameSearch, name);
	setLiHere(li);
}

//установка текущего тэга li в дополнительном меню
function setLeftNavCurrentLi()
{
	let name = getNavName();
	if (name == "")
		return;
	let li = getNavLiWhereIs(subMenuNameSearch, name);
	setLiHere(li);
}

//возвращает текущий тег li из навигации
function getNavLiWhereIs(navSelector, text)
{
	if (navSelector.length == 0)
		return;
	let a = $(navSelector).find("a:contains('" + text + "')");
	return a.parent("li");
}

function setLiHere(li)
{
	li.addClass("here");
	let a = li.find(">a");
	a.attr("onclick", "return false;")
}

function getBodyName()
{
	return $("body").attr("id");
}

function getNavName()
{
	return getSubMenuName(getBodyName());
}

function getMainMenuName(id)
{
	let name = "";
	switch(id) {
		case "home":
			name = "Главная";
			break;
		case "generalInfo":
		case "structure":
		case "docs":
		case "education":
		case "educationStandarts":
		case "pedSostav":
		case "equipment":
		case "grants":
		case "paidServices":
		case "finActivity":
		case "vacancy":
		case "npb":
			name = "Сведения об ОО";
			break;
		case "progress":
		case "gia9":
		case "gia11":
		case "ovz":
		case "vpr":
			name = "Учебная работа";
			break;
		case "methodicalCouncil":
		case "methodicalAssociation":
		case "innovations":
		case "olympiads":
		case "nouDoc":
		case "nouSections":
		case "nouPublications":
		case "nouNews":
			name = "Методическая работа";
			break;
		case "educationalSystem":
		case "sportPage":
		case "classWork":
		case "schoolCamp":
		case "worldwar":
			name = "Воспитательная работа";
			break;
		case "graduates":
		case "honorBook":
		case "attributes":
		case "parents":
		case "childHands":
		case "childMistakes":
		case "speachReady":
		case "reasonMistakes":
			name = "Общий раздел";
			break;
	}
	return name;
}

function getSubMenuName(id)
{
	let name = "";
	switch(id) {
		case "generalInfo":
			name = "Основные сведения";
			break;
		case "structure":
			name = "Структура ОО";
			break;
		case "docs":
			name = "Документы";
			break;
		case "education":
			name = "Образование";
			break;
		case "educationStandarts":
			name = "Образовательные стандарты";
			break;
		case "pedSostav":
			name = "Руководство. Педагогический состав";
			break;
		case "equipment":
			name = "Материально-техническое обеспечение";
			break;
		case "grants":
			name = "Стипендии и иные виды материальной поддержки";
			break;
		case "paidServices":
			name = "Платные образовательные услуги";
			break;
		case "finActivity":
			name = "Финансово-хозяйственная деятельность";
			break;
		case "vacancy":
			name = "Вакантные места";
			break;
		case "ovz":
			name = "ОВЗ";
			break;
		case "progress":
			name = "Успеваемость";
			break;
		case "gia9":
			name = "ГИА-9";
			break;
		case "gia11":
			name = "ГИА-11";
			break;
		case "vpr":
			name = "ВПР";
			break;
		case "npb":
			name = "Нормативно-правовая база";
			break;
		case "methodicalCouncil":
			name = "Методический совет";
			break;
		case"methodicalAssociation":
			name = "Методические объединения";
			break;
		case "innovations":
			name = "Инновационная работа";
			break;
		case "olympiads":
			name = "Олимпиады";
			break;
		case "nouDoc":
		case "nouSections":
		case "nouPublications":
		case "nouNews":
			name = "НОУ «Творчество, поиск, открытие»";
			break;
		case "educationalSystem":
			name = "Воспитательная система гимназии";
			break;
		case "sportPage":
			name = "Спортивная страничка";
			break;
		case "classWork":
			name = "Классные часы";
			break;
		case "schoolCamp":
			name = "Школьный лагерь";
			break;
		case "worldwar":
			name = "Они защищали Родину";
			break;
		case "graduates":
			name = "Выпускники";
			break;
		case "honorBook":
			name = "Книга почета";
			break;
		case "attributes":
			name = "Атрибутика";
			break;
		case "parents":
			name = "Родителям";
			break;
		case "childHands":
		case "childMistakes":
		case "speachReady":
		case "reasonMistakes":
			name = "Советы логопеда";
			break;
	}
	return name;
}