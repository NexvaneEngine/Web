/*
 * Small, dependency-free search index for docs pages.
 *
 * DocSearch.index([entry, ...])
 *   Register entries. Each entry: { title, href, description?, keywords? }.
 *   Entries are deduplicated by href — indexing the same href again just
 *   replaces the earlier entry, so it's safe to call this repeatedly
 *   (e.g. once per page, or once per fetched lang.json).
 *
 * DocSearch.search(query, limit = 8)
 *   Returns matching entries, best match first. Title matches score
 *   highest, then keyword matches, then description matches.
 *
 * DocSearch.attach(inputEl, { limit, container, onSelect })
 *   Wires a text input to a live suggestions dropdown: renders results as
 *   the user types, closes on outside click / Escape, and lets you hook
 *   selection (e.g. to close a mobile menu) via onSelect(entry, event).
 *
 * DocSearch.clear()
 *   Empties the index (rarely needed — mostly for tests/hot-reload).
 *
 * <doc-sidebar> (scripts/doc-sidebar.js) already indexes its own tree
 * automatically and calls attach() on its own search box. Use
 * DocSearch.index() directly to add entries from elsewhere, e.g. your
 * own lang.json files:
 *
 *   fetch('/docs/manual.lang.json')
 *     .then((r) => r.json())
 *     .then((pages) => DocSearch.index(pages.map((p) => ({
 *       title: p.title,
 *       href: p.url,
 *       description: p.summary,
 *       keywords: p.tags,
 *     }))));
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
		const container = opts.container || input.closest('.doc-search') || input.parentElement;

		const results = document.createElement('div');
		results.className = 'doc-search-results';
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
				a.className = 'doc-search-result';
				a.href = item.href;

				const title = document.createElement('span');
				title.className = 'doc-search-result-title';
				title.textContent = item.title;
				a.appendChild(title);

				if (item.description) {
					const desc = document.createElement('span');
					desc.className = 'doc-search-result-desc';
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

	window.DocSearch = { index, search, clear, attach };
})();
