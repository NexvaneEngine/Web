/*
 * <doc-sidebar> — a reusable, data-driven docs sidebar: a search box
 * (wired to DocSearch, see scripts/doc-search.js) plus a collapsible
 * tree of nodes and leafs, indented by depth and styled to match the
 * navbar. Write the structure once as plain data; the DOM/behavior is
 * generated from it, so nothing has to be hand-copied between pages.
 *
 * Usage:
 *   <doc-sidebar id="manual-sidebar" search-placeholder="Search the manual..."></doc-sidebar>
 *   <script>
 *     document.getElementById('manual-sidebar').tree = [
 *       {
 *         title: 'Getting Started',
 *         href: '/docs/getting-started.html',   // optional — see below
 *         description: 'Install and get running.', // optional, used by search
 *         keywords: ['setup', 'install'],           // optional, used by search
 *         children: [
 *           { title: 'Installation', href: '#installation' },
 *           { title: 'Quick Start', href: '#quick-start' },
 *         ],
 *       },
 *       { title: 'FAQ', href: '#faq' }, // no children => rendered as a leaf
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
 * Any entry with an `href` gets registered with DocSearch automatically,
 * so this page's own tree is searchable with no extra wiring. Load
 * scripts/doc-search.js before this file.
 */
class DocSidebar extends HTMLElement {
	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this.classList.add('doc-sidebar');

		const placeholder = this.getAttribute('search-placeholder') || 'Search...';
		this.setAttribute('role', 'complementary');
		this.innerHTML = `
			<div class="doc-search">
				<i class="bi bi-search"></i>
				<input type="search" placeholder="${placeholder}" aria-label="${placeholder}">
			</div>
			<div class="doc-tree" role="navigation" aria-label="Sections"></div>
		`;

		this._treeEl = this.querySelector('.doc-tree');

		if (window.DocSearch) {
			window.DocSearch.attach(this.querySelector('.doc-search input'));
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
		ul.className = 'doc-tree-list';
		entries.forEach((entry) => ul.appendChild(this._buildItem(entry)));
		return ul;
	}

	_buildItem(entry) {
		const li = document.createElement('li');
		li.className = 'doc-tree-item';

		const row = document.createElement('div');
		row.className = 'doc-tree-row';
		li.appendChild(row);

		const hasChildren = Array.isArray(entry.children) && entry.children.length > 0;
		let chevronBtn = null;

		if (hasChildren) {
			chevronBtn = document.createElement('button');
			chevronBtn.type = 'button';
			chevronBtn.className = 'doc-tree-chevron-hit';
			chevronBtn.setAttribute('aria-label', `Toggle ${entry.title}`);
			chevronBtn.setAttribute('aria-expanded', entry.expanded ? 'true' : 'false');
			chevronBtn.innerHTML = '<i class="bi bi-chevron-right doc-tree-chevron"></i>';
			row.appendChild(chevronBtn);
		} else {
			// Rows without a chevron still reserve its width, so every
			// row's icon/label lines up at the same offset — otherwise a
			// leaf's label (no chevron) sits further left than its own
			// parent node's label (which has one), making a child look
			// less indented than its parent instead of more.
			const spacer = document.createElement('span');
			spacer.className = 'doc-tree-spacer';
			spacer.setAttribute('aria-hidden', 'true');
			row.appendChild(spacer);
		}

		const label = document.createElement(entry.href ? 'a' : 'button');
		if (entry.href) {
			label.href = entry.href;
		} else {
			label.type = 'button';
		}
		label.className = 'doc-tree-link' + (hasChildren ? '' : ' doc-tree-leaf');
		const icon = document.createElement('i');
		icon.className = `bi ${hasChildren ? 'bi-folder2' : 'bi-file-earmark-text'} doc-tree-icon`;
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

		if (entry.href && window.DocSearch) {
			window.DocSearch.index([{
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
		this.querySelectorAll('.doc-tree-leaf').forEach((leaf) => {
			leaf.classList.toggle('active', hash !== '' && leaf.getAttribute('href') === hash);
		});
	}
}

customElements.define('doc-sidebar', DocSidebar);
