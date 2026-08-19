function switchLang()
{
	if(window.langId == "es") window.setLang("en");
	else window.setLang("es");
}

const langSwitchButton = document.getElementById("lang-switch");
langSwitchButton.addEventListener('click', (event) => {
	event.preventDefault();
	switchLang();
})
