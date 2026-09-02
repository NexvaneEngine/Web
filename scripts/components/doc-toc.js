/*
 * <doc-toc target=".doc-content"></doc-toc>
 *
 * Auto-generates an "on this page" table of contents from the h2/h3
 * headings found inside `target` (a CSS selector, default
 * ".doc-content"), nesting each h2's immediately-following h3s under
 * it, and highlights whichever section is currently in view while
 * scrolling.
 *
 * Rebuilt around a single native <details>/<summary> panel instead
 * of a bare list, so there's exactly one markup shape everywhere.
 * CSS alone (see base.css) turns it from a sticky aside next to the
 * content on wide screens into a plain static card ahead of the
 * content once the viewport is too narrow for that third column —
 * no separate mobile branch here, no manual open/close state, no
 * risk of it drifting out of sync with the layout again.
 *
 * Headings without an id get one auto-assigned (slugified from their
 * own text), so this works even on content that didn't add ids by
 * hand — just write normal <h2>/<h3> tags.
 *
 * If the target has no h2/h3 headings, the element hides itself
 * entirely rather than showing an empty "on this page" box.
 */

(window.LANG_SOURCES = window.LANG_SOURCES || [])
	.push(`${window.SITE_BASE || ''}scripts/components/doc-toc.lang.json`);

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Matches the breakpoint in base.css where the TOC stops being a
// third column and drops into the normal document flow. Only used
// to pick a sensible *initial* open/closed state — someone can still
// toggle it by hand either way afterwards.
const WIDE_LAYOUT_QUERY = '(min-width: 1201px)';

class DocToc extends HTMLElement {
	connectedCallback() {
		if (this._built) return;
		this._built = true;

		const targetSelector = this.getAttribute('target') || '.doc-content';
		const target = document.querySelector(targetSelector);
		const headings = target ? [...target.querySelectorAll('h2, h3')] : [];

		if (!headings.length) {
			this.hidden = true;
			return;
		}

		headings.forEach((heading) => {
			if (!heading.id) heading.id = slugify(heading.textContent);
		});

		const startOpen = window.matchMedia(WIDE_LAYOUT_QUERY).matches;

		this.innerHTML = `
			<details class="doc-toc-panel"${startOpen ? ' open' : ''}>
				<summary class="doc-toc-summary">
					<span class="doc-toc-heading" lang="doc-toc-heading">On this page</span>
					<i class="bi bi-chevron-right doc-toc-chevron"></i>
				</summary>
				<nav class="doc-toc-nav" aria-label="On this page"></nav>
			</details>
		`;

		this.querySelector('.doc-toc-nav').appendChild(this._buildList(headings));
		this._links = new Map(headings.map((h) => [h.id, this.querySelector(`a[href="#${h.id}"]`)]));
		this._observeHeadings(headings);
	}

	// h2s become top-level items; any h3s immediately following an h2
	// (before the next h2) nest under it as a sub-list.
	_buildList(headings) {
		const ul = document.createElement('ul');
		ul.className = 'doc-toc-list';
		let i = 0;
		while (i < headings.length) {
			const heading = headings[i];
			const li = document.createElement('li');
			li.appendChild(this._buildLink(heading));

			if (heading.tagName === 'H2') {
				const sub = [];
				let j = i + 1;
				while (j < headings.length && headings[j].tagName === 'H3') {
					sub.push(headings[j]);
					j++;
				}
				if (sub.length) li.appendChild(this._buildList(sub));
				i = j;
			} else {
				i++;
			}
			ul.appendChild(li);
		}
		return ul;
	}

	_buildLink(heading) {
		const a = document.createElement('a');
		a.className = 'doc-toc-link';
		a.href = `#${heading.id}`;
		a.textContent = heading.textContent;
		return a;
	}

	_observeHeadings(headings) {
		const setActive = (id) => {
			this.querySelectorAll('.doc-toc-link.active').forEach((el) => el.classList.remove('active'));
			const link = this._links.get(id);
			if (link) link.classList.add('active');
		};

		const navHeight = (getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '4rem').trim();

		// A thin trigger band near the top of the viewport (below the
		// sticky nav): whichever heading enters that band is "active".
		const observer = new IntersectionObserver((entries) => {
			const visible = entries.filter((entry) => entry.isIntersecting);
			if (!visible.length) return;
			visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
			setActive(visible[0].target.id);
		}, {
			rootMargin: `-${navHeight} 0px -70% 0px`,
			threshold: 0,
		});

		headings.forEach((heading) => observer.observe(heading));
		setActive(headings[0].id);
	}
}

customElements.define('doc-toc', DocToc);
