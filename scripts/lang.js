/*
 * Basic client-side localization.
 *
 * Each page has its own JSON sidecar (page.html -> page.json) holding
 * page-specific text under lang.<code>.<key>. Shared UI text that
 * appears on every page (the nav, the manual sidebar's chrome, ...)
 * lives in its OWN JSON file instead of being copied into every page's
 * sidecar — whichever script renders that UI registers its own JSON as
 * an extra source by pushing onto window.LANG_SOURCES, e.g.:
 *
 *   (window.LANG_SOURCES = window.LANG_SOURCES || [])
 *     .push(`${window.SITE_BASE || ''}scripts/components/nav-footer.lang.json`);
 *
 * This works regardless of script load order: registering just adds a
 * URL to a plain array, and lang.js doesn't read that array until
 * DOMContentLoaded — by which point every script that ran during the
 * initial parse has already had the chance to register what it needs.
 *
 * All sources get merged into one lang.<code> object per language (a
 * source read later wins on key collisions; the page's own JSON is
 * always read first, so a page COULD override a shared key if it ever
 * needed to — in practice key names shouldn't collide if components
 * and pages use their own prefixes, e.g. "nav-..." vs "card-...").
 *
 * Elements opt into translation with a `lang="key"` attribute — this
 * repurposes the attribute as a lookup key rather than its usual
 * "this element's content is in language X" meaning. By default the
 * matching string replaces the element's innerHTML; add
 * data-lang-attr="attributeName" to set that attribute instead (e.g.
 * placeholder text, aria-label) — the lookup key still comes from
 * `lang`. data-lang-attr can list more than one attribute
 * (space-separated, e.g. "placeholder aria-label") to set all of them
 * from the same translated value. The actual page language is set
 * separately, on <html lang="...">, so screen readers/browsers still
 * see a normal, correct language code there.
 *
 * Each page must set window.PAGE_LANG_JSON (alongside window.SITE_BASE
 * — see index.html) to its own sidecar's relative path, e.g.
 * 'index.json'. This can't be derived from the URL reliably: a server
 * serving index.html for a bare directory request (site.com/ instead
 * of site.com/index.html) leaves document.URL with no ".html" in it to
 * swap for ".json", so guessing from the URL silently breaks on any
 * host/setup that does this (which is extremely common).
 */
window.lang = null;
window.langId = null;
window.meta = null;

const SUPPORTED_LANGS = ['en', 'es'];
const DEFAULT_LANG = 'en';

function getPageMetadataUrl() {
	if (window.PAGE_LANG_JSON) return window.PAGE_LANG_JSON;
	// Best-effort fallback for a page that forgot to set PAGE_LANG_JSON.
	// Only works if document.URL happens to end in an explicit ".html"
	// filename — see the note above for why that's not guaranteed.
	const guessed = document.URL.replace(/\.html(?=$|[?#])/, '.json');
	console.warn('lang.js: window.PAGE_LANG_JSON is not set on this page — falling back to guessing from the URL, which breaks if the URL omits the .html filename. Set window.PAGE_LANG_JSON explicitly (see index.html).');
	return guessed;
}

function langSourceUrls() {
	const urls = [getPageMetadataUrl()];
	(window.LANG_SOURCES || []).forEach((url) => {
		if (!urls.includes(url)) urls.push(url);
	});
	return urls;
}

async function loadMeta() {
	const merged = { lang: {} };
	await Promise.all(langSourceUrls().map(async (url) => {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				console.warn(`lang.js: ${url} responded ${response.status}`);
				return;
			}
			const data = await response.json();
			Object.entries(data.lang || {}).forEach(([code, entries]) => {
				merged.lang[code] = Object.assign(merged.lang[code] || {}, entries);
			});
		} catch (error) {
			console.warn(`lang.js: couldn't load ${url}`, error);
		}
	}));
	window.meta = merged;
	return true;
}

function elementsWithLangKey(langKey) {
	return document.querySelectorAll(`[lang="${langKey}"]`);
}

async function applyLang() {
	for (const langKey in window.lang) {
		const value = window.lang[langKey];
		if (typeof value !== 'string') continue; // skip page-meta and other non-string entries
		for (const element of elementsWithLangKey(langKey)) {
			const attrList = element.getAttribute('data-lang-attr');
			if (attrList) {
				attrList.split(/\s+/).forEach((attrName) => element.setAttribute(attrName, value));
			} else {
				element.innerHTML = value;
			}
		}
	}
}

async function setLang(langId) {
	if (!window.meta) await loadMeta();

	if (!window.meta.lang[langId]) {
		console.warn(`lang.js: no "${langId}" translations found, falling back to "${DEFAULT_LANG}"`);
		langId = DEFAULT_LANG;
	}

	window.langId = langId;
	window.lang = window.meta.lang[langId];
	document.documentElement.setAttribute('lang', langId);
	localStorage.setItem('langId', langId);

	await applyLang();
	document.dispatchEvent(new CustomEvent('langchange', { detail: { langId } }));
}
window.setLang = setLang;
window.applyLang = applyLang;
window.SUPPORTED_LANGS = SUPPORTED_LANGS;

document.addEventListener('DOMContentLoaded', async () => {
	const saved = localStorage.getItem('langId');
	const browserLang = (navigator.language || DEFAULT_LANG).slice(0, 2);
	const initial = saved || (SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG);
	await setLang(initial);
});
