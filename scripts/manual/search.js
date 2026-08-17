/*
 * Loads the User Manual page's search entries via manifest + per-page
 * JSON sidecars. This is a separate concern from scripts/manual/sidebar.js
 * (which only builds the tree) — this file's only job is search.
 *
 * A manifest is a flat JSON array of page URLs (see /search/*.json). For
 * each URL, SiteSearch.indexFromManifest (scripts/components/search.js)
 * fetches that PAGE'S OWN JSON sidecar (e.g.
 * /manual/getting-started/installation.json) and reads its page-meta for
 * the given language.
 *
 *  - /search/search-manual.json — the only URLs the manual's own
 *    searchbar draws from (this page's sub-pages).
 *  - /search/site-manual.json — the URLs any OTHER (non-manual)
 *    searchbar draws from (About, Downloads, etc.) — loaded here too so
 *    they still show up in the manual's search suggestions.
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

	window.SiteSearch.indexFromManifest('/search/search-manual.json', { lang: 'en' });
	window.SiteSearch.indexFromManifest('/search/site-manual.json', { lang: 'en' });
})();
