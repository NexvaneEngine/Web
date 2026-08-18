/*
 * <nexvane-sidebar> — a generic, reusable, data-driven sidebar: a search
 * box (wired to SiteSearch, see scripts/components/search.js) plus a
 * collapsible tree of nodes and leafs, indented by depth and styled to
 * match the navbar. It has nothing docs-specific in it — any page can
 * drop one in and feed it whatever tree it needs via its own small
 * script (see e.g. scripts/manual/sidebar.js for the user manual page's
 * tree).
 *
 * Usage:
 *   <nexvane-sidebar id="my-sidebar" search-placeholder="Search..."></nexvane-sidebar>
 *   <script>
 *     document.getElementById('my-sidebar').tree = [
 *       {
 *         title: 'Getting Started',
 *         href: 'getting-started.html',   // optional — see below (relative; see index.html for why)
 *         description: 'Install and get running.', // optional, used by search
 *         keywords: ['setup', 'install'],           // optional, used by search
 *         children: [
 *           { title: 'Installation', href: 'getting-started/installation.html' },
 *         ],
 *       },
 *       { title: 'FAQ', href: 'faq.html' }, // no children => rendered as a leaf
 *     ];
 *   </script>
 *
 * Entry shape: { title, href?, description?, keywords?, children?, expanded? }
 *  - No `children` (or an empty array)  => a leaf: one link row.
 *  - Has `children`                     => a node: gets a chevron toggle.
 *      - With an `href` too: the chevron toggles, the label navigates —
 *        a node can both expand AND be a page of its own.
 *      - Without an `href`: there's nowhere to send it, so clicking the
 *        label also toggles (the whole row is one hit target).
 *  - `expanded: true` starts that node open (default: closed).
 *
 * Any entry with an `href` gets registered with SiteSearch automatically,
 * so this sidebar's own tree is searchable with no extra wiring. Load
 * scripts/components/search.js before this file.
 *
 * The node/leaf whose `href` matches the current page's path is marked
 * `.active`; any node(s) that CONTAIN it (its ancestors in the tree) get
 * `.ancestor-active` and are force-expanded so the active item isn't
 * hidden inside a collapsed section.
 */
class NexvaneSidebar extends HTMLElement {
	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this.classList.add('sidebar');
		this.setAttribute('role', 'complementary');

		const placeholder = this.getAttribute('search-placeholder') || 'Search...';
		this.innerHTML = `
			<div class="sidebar-search">
				<i class="bi bi-search"></i>
				<input type="search" placeholder="${placeholder}" aria-label="${placeholder}">
			</div>
			<div class="sidebar-tree" role="navigation" aria-label="Sections"></div>
		`;

		this._treeEl = this.querySelector('.sidebar-tree');

		if (window.SiteSearch) {
			window.SiteSearch.attach(this.querySelector('.sidebar-search input'));
		}

		// Real page navigations are full page loads (a fresh script run
		// recomputes this from scratch), so this listener only matters if
		// a tree mixes in same-page hash links alongside page URLs.
		window.addEventListener('hashchange', () => this._highlightActive());

		// tree may have been set before connectedCallback ran (e.g. the
		// element wasn't upgraded yet when the page's inline script ran).
		if (this._pendingTree) {
			this.tree = this._pendingTree;
			this._pendingTree = null;
		}
	}

	set tree(data) {
		this._data = data || [];
		if (!this._treeEl) {
			this._pendingTree = data;
			return;
		}
		this._treeEl.innerHTML = '';
		this._treeEl.appendChild(this._buildList(this._data));
		this._highlightActive();
	}

	get tree() {
		return this._data || [];
	}

	_buildList(entries) {
		const ul = document.createElement('ul');
		ul.className = 'sidebar-tree-list';
		entries.forEach((entry) => ul.appendChild(this._buildItem(entry)));
		return ul;
	}

	_buildItem(entry) {
		const li = document.createElement('li');
		li.className = 'sidebar-tree-item';

		const row = document.createElement('div');
		row.className = 'sidebar-tree-row';
		li.appendChild(row);

		const hasChildren = Array.isArray(entry.children) && entry.children.length > 0;
		let chevronBtn = null;

		if (hasChildren) {
			chevronBtn = document.createElement('button');
			chevronBtn.type = 'button';
			chevronBtn.className = 'sidebar-tree-chevron-hit';
			chevronBtn.setAttribute('aria-label', `Toggle ${entry.title}`);
			chevronBtn.setAttribute('aria-expanded', entry.expanded ? 'true' : 'false');
			chevronBtn.innerHTML = '<i class="bi bi-chevron-right sidebar-tree-chevron"></i>';
			row.appendChild(chevronBtn);
		} else {
			// Rows without a chevron still reserve its width, so every
			// row's icon/label lines up at the same offset — otherwise a
			// leaf's label (no chevron) sits further left than its own
			// parent node's label (which has one), making a child look
			// less indented than its parent instead of more.
			const spacer = document.createElement('span');
			spacer.className = 'sidebar-tree-spacer';
			spacer.setAttribute('aria-hidden', 'true');
			row.appendChild(spacer);
		}

		const label = document.createElement(entry.href ? 'a' : 'button');
		if (entry.href) {
			label.href = entry.href;
		} else {
			label.type = 'button';
		}
		label.className = 'sidebar-tree-link' + (hasChildren ? '' : ' sidebar-tree-leaf');
		const icon = document.createElement('i');
		icon.className = `bi ${hasChildren ? 'bi-folder2' : 'bi-file-earmark-text'} sidebar-tree-icon`;
		const text = document.createElement('span');
		text.textContent = entry.title;
		label.appendChild(icon);
		label.appendChild(text);
		row.appendChild(label);

		if (hasChildren) {
			const childList = this._buildList(entry.children);
			childList.hidden = !entry.expanded;
			li.appendChild(childList);

			const toggle = () => {
				const expanded = chevronBtn.getAttribute('aria-expanded') === 'true';
				chevronBtn.setAttribute('aria-expanded', String(!expanded));
				childList.hidden = expanded;
			};
			chevronBtn.addEventListener('click', (event) => {
				event.preventDefault();
				toggle();
			});
			if (!entry.href) {
				label.addEventListener('click', (event) => {
					event.preventDefault();
					toggle();
				});
			}
		}

		if (entry.href && window.SiteSearch) {
			window.SiteSearch.index([{
				title: entry.title,
				href: entry.href,
				description: entry.description,
				keywords: entry.keywords,
			}]);
		}

		return li;
	}

	_highlightActive() {
		const current = window.location.pathname;

		this.querySelectorAll('.sidebar-tree-row.active, .sidebar-tree-row.ancestor-active').forEach((row) => {
			row.classList.remove('active', 'ancestor-active');
		});

		this.querySelectorAll('.sidebar-tree-link[href]').forEach((link) => {
			// link.pathname (unlike getAttribute('href')) is the browser's
			// own fully-resolved absolute path, so this still matches
			// correctly now that hrefs are written relative rather than
			// absolute from the site root.
			if (link.pathname !== current) return;

			const row = link.closest('.sidebar-tree-row');
			if (row) row.classList.add('active');

			// Walk up the ancestor nodes (their own <li> wraps the <ul> this
			// item lives in) so the section(s) containing the active page
			// are marked too, and expanded if they were collapsed — the
			// active leaf/node shouldn't be hidden inside a closed parent.
			let list = link.closest('li').parentElement;
			while (list && list.classList.contains('sidebar-tree-list')) {
				const ancestorLi = list.closest('li');
				if (!ancestorLi) break;
				const ancestorRow = ancestorLi.querySelector(':scope > .sidebar-tree-row');
				if (ancestorRow) {
					ancestorRow.classList.add('ancestor-active');
					const chevron = ancestorRow.querySelector('.sidebar-tree-chevron-hit');
					if (chevron) chevron.setAttribute('aria-expanded', 'true');
				}
				list.hidden = false;
				list = ancestorLi.parentElement;
			}
		});
	}
}

customElements.define('nexvane-sidebar', NexvaneSidebar);
