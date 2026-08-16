/*
 * <nexvane-sidebar> — a generic, reusable, data-driven sidebar: a search
 * box (wired to SiteSearch, see scripts/search.js) plus a collapsible
 * tree of nodes and leafs, indented by depth and styled to match the
 * navbar. It has nothing docs-specific in it — any page can drop one in
 * and feed it whatever tree it needs via its own small script (see e.g.
 * scripts/sidebar-user-manual.js for the user manual page's tree).
 *
 * Usage:
 *   <nexvane-sidebar id="my-sidebar" search-placeholder="Search..."></nexvane-sidebar>
 *   <script>
 *     document.getElementById('my-sidebar').tree = [
 *       {
 *         title: 'Getting Started',
 *         href: '/docs/getting-started.html',   // optional — see below
 *         description: 'Install and get running.', // optional, used by search
 *         keywords: ['setup', 'install'],           // optional, used by search
 *         children: [
 *           { title: 'Installation', href: '/docs/installation.html' },
 *         ],
 *       },
 *       { title: 'FAQ', href: '/faq.html' }, // no children => rendered as a leaf
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
 * scripts/search.js before this file.
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
		const hash = window.location.hash;
		this.querySelectorAll('.sidebar-tree-leaf').forEach((leaf) => {
			leaf.classList.toggle('active', hash !== '' && leaf.getAttribute('href') === hash);
		});
	}
}

customElements.define('nexvane-sidebar', NexvaneSidebar);
