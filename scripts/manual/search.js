/*
 * Loads the User Manual page's search entries via manifest + per-page
 * JSON sidecars. This is a separate concern from scripts/manual/sidebar.js
 * (which only builds the tree) — this file's only job is search.
 *
 * A manifest is a flat JSON array of page URLs, written relative to the
 * SITE ROOT (see search/*.json) — SiteSearch.indexFromManifest
 * (scripts/components/search.js) combines each one with the current
 * page's own SITE_BASE to resolve it correctly, then fetches that
 * PAGE'S OWN JSON sidecar (e.g. manual/getting-started/installation.json)
 * and reads its page-meta for the given language.
 *
 *  - search/search-manual.json — the only URLs the manual's own
 *    searchbar draws from (this page's sub-pages).
 *  - search/site-manual.json — the URLs any OTHER (non-manual)
 *    searchbar draws from (About, Downloads, etc.) — loaded here too so
 *    they still show up in the manual's search suggestions.
 *
 * Indexing happens on langchange rather than eagerly at load — lang.js
 * dispatches that once on initial load (after it's picked the starting
 * language) and again on every switch, so this always fetches sidecars
 * with the CURRENT language rather than guessing one upfront and
 * re-fetching everything a moment later once the real language is known.
 *
 * Note: fetch() needs an actual HTTP server (e.g. `python3 -m
 * http.server`) — opening this file directly via file:// will have the
 * browser block the requests (CORS), so manifest-driven results
 * silently won't appear there; the sidebar tree's own entries
 * (scripts/manual/sidebar.js) stay searchable regardless, since those
 * are indexed directly rather than fetched.
 */
(function () {
	if (!window.SiteSearch) return;
	const base = window.SITE_BASE || '';

	document.addEventListener('langchange', (event) => {
		const lang = event.detail.langId;
		window.SiteSearch.indexFromManifest(`${base}search/search-manual.json`, { lang });
		window.SiteSearch.indexFromManifest(`${base}search/site-manual.json`, { lang });
	});
})();
