window.lang = null;
window.langId = null;
window.meta = null;

function getMetadataUrl()
{
	return document.URL.replaceAll('.html', '.json');
}

async function loadMeta()
{
	const metaUrl = getMetadataUrl();
	const response = await fetch(metaUrl);
	if(!response.ok)
	{
		console.error("Unable to get page metadata response.");
		return false;
	}

	window.meta = await response.json();
	return true;
}

function elementsWithLangKey(langKey)
{
	return document.querySelectorAll(`[lang="${langKey}"]`);

}

async function applyLang()
{
	for(langKey in window.lang)
	{
		for(element of elementsWithLangKey(langKey))
		{
			element.innerHTML = window.lang[langKey];
		};
	}
}

async function setLang(langId)
{
	if(!window.meta)
		await loadMeta();

	window.langId = langId;
	window.lang = window.meta['lang'][langId];
	await applyLang();
}

document.addEventListener('DOMContentLoaded', async () => {
	await setLang('es');
});

