/*
 * Small, dependency-free search index. Not tied to docs pages — anything
 * with a title and a URL can be indexed here.
 *
 * SiteSearch.index([entry, ...])
 *   Register entries directly. Each entry: { title, href, description?, keywords? }.
 *   Entries are deduplicated by href — indexing the same href again just
 *   replaces the earlier entry, so it's safe to call this repeatedly.
 *
 * SiteSearch.indexFromManifest(manifestUrl, { lang, fallbackLang })
 *   The higher-level, convention-driven way to populate the index: fetch
 *   a manifest — a plain JSON array of page URLs, e.g. manual-search.json:
 *
 *     ["/manual/getting-started/installation.html", ...]
 *
 *   then for each URL, fetch that PAGE'S OWN JSON sidecar (same path,
 *   .html swapped for .json — e.g. /manual/getting-started/installation.json)
 *   and read its page-meta for `lang` (default 'en', falling back to
 *   `fallbackLang` or the first available language if that's missing):
 *
 *     {
 *       "lang": {
 *         "en": { "page-meta": { "title": "...", "description": "...", "keyphrases": [...] } },
 *         "es": { "page-meta": { ... } }
 *       }
 *     }
 *
 *   Every page indexes independently, so one missing/404ing sidecar
 *   doesn't stop the rest from loading. Returns a Promise.
 *
 * SiteSearch.search(query, limit = 8)
 *   Returns matching entries, best match first. Title matches score
 *   highest, then keyword matches, then description matches.
 *
 * SiteSearch.attach(inputEl, { limit, container, onSelect })
 *   Wires a text input to a live suggestions dropdown: renders results as
 *   the user types, closes on outside click / Escape, and lets you hook
 *   selection (e.g. to close a mobile menu) via onSelect(entry, event).
 *
 * SiteSearch.clear()
 *   Empties the index (rarely needed — mostly for tests/hot-reload).
 *
 * <nexvane-sidebar> (scripts/sidebar.js) already indexes its own tree
 * automatically and calls attach() on its own search box.
 *
 * Note: both fetch-based methods need an actual HTTP server — opening
 * pages directly via file:// will have the browser block the requests
 * (CORS), so manifest/sidecar-driven results silently won't appear
 * there. A tree's own directly-indexed entries aren't affected.
 */
(function () {
	const entriesByHref = new Map();

	function normalize(value) {
		return (value || '').toString().toLowerCase();
	}

	function index(list) {
		(list || []).forEach((item) => {
			if (item && item.title && item.href) {
				entriesByHref.set(item.href, item);
			}
		});
	}

	function pickPageMeta(sidecar, lang, fallbackLang) {
		const byLang = (sidecar && sidecar.lang) || {};
		const chosen = byLang[lang] || byLang[fallbackLang] || byLang[Object.keys(byLang)[0]];
		return chosen ? chosen['page-meta'] : null;
	}

	function indexFromManifest(manifestUrl, options) {
		const opts = options || {};
		const lang = opts.lang || 'en';
		const fallbackLang = opts.fallbackLang || 'en';

		return fetch(manifestUrl)
			.then((response) => response.json())
			.then((urls) => Promise.all((urls || []).map((pageUrl) => {
				const sidecarUrl = pageUrl.replace(/\.html?$/i, '.json');
				return fetch(sidecarUrl)
					.then((response) => response.json())
					.then((sidecar) => {
						const meta = pickPageMeta(sidecar, lang, fallbackLang);
						if (!meta || !meta.title) return;
						index([{
							title: meta.title,
							href: pageUrl,
							description: meta.description,
							keywords: meta.keyphrases,
						}]);
					})
					.catch((error) => {
						console.warn(`SiteSearch: couldn't load sidecar for ${pageUrl} (${sidecarUrl}):`, error);
					});
			})));
	}

	function scoreEntry(entry, terms) {
		const title = normalize(entry.title);
		const description = normalize(entry.description);
		const keywords = (entry.keywords || []).map(normalize);
		let score = 0;
		terms.forEach((term) => {
			if (!term) return;
			if (title === term) score += 6;
			else if (title.startsWith(term)) score += 4;
			else if (title.includes(term)) score += 3;
			if (keywords.some((k) => k === term)) score += 3;
			else if (keywords.some((k) => k.includes(term))) score += 1;
			if (description.includes(term)) score += 1;
		});
		return score;
	}

	function search(query, limit) {
		const q = normalize(query).trim();
		if (!q) return [];
		const terms = q.split(/\s+/);
		const results = [];
		entriesByHref.forEach((entry) => {
			const score = scoreEntry(entry, terms);
			if (score > 0) results.push({ entry, score });
		});
		results.sort((a, b) => b.score - a.score);
		return results.slice(0, limit || 8).map((r) => r.entry);
	}

	function clear() {
		entriesByHref.clear();
	}

	function attach(input, options) {
		if (!input) return;
		const opts = options || {};
		const limit = opts.limit || 8;
		const container = opts.container || input.closest('.sidebar-search') || input.parentElement;

		const results = document.createElement('div');
		results.className = 'sidebar-search-results';
		results.hidden = true;
		container.appendChild(results);

		function render(list) {
			results.innerHTML = '';
			if (!list.length) {
				results.hidden = true;
				return;
			}
			list.forEach((item) => {
				const a = document.createElement('a');
				a.className = 'sidebar-search-result';
				a.href = item.href;

				const title = document.createElement('span');
				title.className = 'sidebar-search-result-title';
				title.textContent = item.title;
				a.appendChild(title);

				if (item.description) {
					const desc = document.createElement('span');
					desc.className = 'sidebar-search-result-desc';
					desc.textContent = item.description;
					a.appendChild(desc);
				}

				a.addEventListener('click', (event) => {
					results.hidden = true;
					if (opts.onSelect) opts.onSelect(item, event);
				});

				results.appendChild(a);
			});
			results.hidden = false;
		}

		input.addEventListener('input', () => {
			render(search(input.value, limit));
		});
		input.addEventListener('focus', () => {
			if (input.value) render(search(input.value, limit));
		});
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				results.hidden = true;
			}
		});
		document.addEventListener('click', (event) => {
			if (event.target !== input && !results.contains(event.target)) {
				results.hidden = true;
			}
		});
	}

	window.SiteSearch = { index, indexFromManifest, search, clear, attach };
})();
