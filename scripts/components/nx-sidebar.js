/*
 * Sidebar component family: <nx-sidebar>, <nx-sidebar-node>, <nx-sidebar-leaf>
 *
 * Authored declaratively, e.g.:
 *
 *   <nx-sidebar label="User Manual">
 *     <nx-sidebar-node label="Getting Started" icon="bi-rocket-takeoff" open>
 *       <nx-sidebar-leaf label="Installation" href="/docs/manual.html#install"></nx-sidebar-leaf>
 *       <nx-sidebar-leaf label="Quick Start" href="/docs/manual.html#quickstart"></nx-sidebar-leaf>
 *     </nx-sidebar-node>
 *     <nx-sidebar-leaf label="FAQ" icon="bi-question-circle" href="/docs/manual.html#faq"></nx-sidebar-leaf>
 *   </nx-sidebar>
 *
 * - <nx-sidebar-leaf> is a clickable link. It reuses the `.nav-button`
 *   class so it looks/feels exactly like the navbar buttons, and marks
 *   itself active when its href matches the current page.
 * - <nx-sidebar-node> is expandable/collapsible: clicking (or pressing
 *   Enter/Space on) its header toggles its children. Nodes can nest
 *   other nodes and leafs freely.
 * - <nx-sidebar> is the instance wrapper: give it a `label` and its own
 *   tree of nodes/leafs. Each page can declare its own instance with
 *   completely different content - that's the "reuse" story: the
 *   behaviour/styling is shared, the data is per-instance.
 *
 * Pair it with `.page-with-sidebar` (see components.css) to lay it out
 * next to a <main>:
 *
 *   <div class="page-with-sidebar">
 *     <nx-sidebar label="...">...</nx-sidebar>
 *     <main>...</main>
 *   </div>
 */
(function () {
	const MOBILE_BREAKPOINT = 900;

	class NxSidebar extends HTMLElement {
		connectedCallback() {
			if (this.dataset.enhanced) return;
			this.dataset.enhanced = 'true';

			const title = this.getAttribute('label');
			const existingChildren = Array.from(this.children);

			const aside = document.createElement('aside');
			aside.className = 'sidebar';

			const toggle = document.createElement('button');
			toggle.type = 'button';
			toggle.className = 'nav-button sidebar-toggle';
			toggle.setAttribute('aria-label', 'Toggle sidebar');
			toggle.innerHTML = `<i class="bi bi-list"></i><p>${title || 'Menu'}</p>`;

			const nav = document.createElement('nav');
			nav.className = 'sidebar-nav';
			nav.setAttribute('aria-label', title || 'Sidebar');

			if (title) {
				const heading = document.createElement('p');
				heading.className = 'sidebar-title';
				heading.textContent = title;
				nav.appendChild(heading);
			}

			existingChildren.forEach((el) => nav.appendChild(el));

			const backdrop = document.createElement('div');
			backdrop.className = 'sidebar-backdrop';

			aside.appendChild(nav);

			this.innerHTML = '';
			this.appendChild(toggle);
			this.appendChild(aside);
			this.appendChild(backdrop);

			const open = () => {
				aside.classList.add('sidebar-open');
				backdrop.classList.add('visible');
				toggle.setAttribute('aria-expanded', 'true');
			};
			const close = () => {
				aside.classList.remove('sidebar-open');
				backdrop.classList.remove('visible');
				toggle.setAttribute('aria-expanded', 'false');
			};

			toggle.addEventListener('click', () => {
				aside.classList.contains('sidebar-open') ? close() : open();
			});
			backdrop.addEventListener('click', close);

			// Tapping a leaf on mobile should close the drawer behind it.
			nav.addEventListener('click', (e) => {
				if (window.innerWidth <= MOBILE_BREAKPOINT && e.target.closest('.sidebar-leaf-link')) {
					close();
				}
			});
			window.addEventListener('resize', () => {
				if (window.innerWidth > MOBILE_BREAKPOINT) close();
			});
		}
	}
	customElements.define('nx-sidebar', NxSidebar);

	class NxSidebarNode extends HTMLElement {
		connectedCallback() {
			if (this.dataset.enhanced) return;
			this.dataset.enhanced = 'true';

			const label = this.getAttribute('label') || '';
			const icon = this.getAttribute('icon');
			const startOpen = this.hasAttribute('open');
			const existingChildren = Array.from(this.children);

			const header = document.createElement('div');
			header.className = 'nav-button sidebar-node-header';
			header.setAttribute('role', 'button');
			header.tabIndex = 0;
			header.setAttribute('aria-expanded', String(startOpen));
			header.innerHTML = `${icon ? `<i class="bi ${icon} nav-button-icon"></i>` : ''}<p>${label}</p><i class="bi bi-chevron-right sidebar-chevron" style="font-size: 0.8em;"></i>`;

			const childrenWrap = document.createElement('div');
			childrenWrap.className = 'sidebar-node-children';
			existingChildren.forEach((el) => childrenWrap.appendChild(el));

			this.innerHTML = '';
			this.classList.add('sidebar-node');
			this.appendChild(header);
			this.appendChild(childrenWrap);
			if (startOpen) this.classList.add('open');

			const toggle = () => {
				const isOpen = this.classList.toggle('open');
				header.setAttribute('aria-expanded', String(isOpen));
			};

			header.addEventListener('click', toggle);
			header.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					toggle();
				}
			});
		}
	}
	customElements.define('nx-sidebar-node', NxSidebarNode);

	class NxSidebarLeaf extends HTMLElement {
		connectedCallback() {
			if (this.dataset.enhanced) return;
			this.dataset.enhanced = 'true';

			const label = this.getAttribute('label') || this.textContent.trim();
			const href = this.getAttribute('href') || '#';
			const icon = this.getAttribute('icon');

			this.innerHTML = '';
			this.classList.add('sidebar-leaf');

			const a = document.createElement('a');
			a.className = 'nav-button sidebar-leaf-link';
			a.href = href;
			a.innerHTML = `${icon ? `<i class="bi ${icon} nav-button-icon"></i>` : ''}<p>${label}</p>`;

			try {
				const url = new URL(href, window.location.href);
				const samePath = url.pathname === window.location.pathname;
				// If the link points at an in-page anchor, only count it as
				// active once that anchor is actually the current one -
				// otherwise every anchor on the page would light up at once.
				const sameHash = url.hash ? url.hash === window.location.hash : true;
				if (samePath && sameHash) {
					a.classList.add('active');
					a.setAttribute('aria-current', 'page');
				}
			} catch (err) {
				/* relative/placeholder href - skip active-state check */
			}

			this.appendChild(a);
		}
	}
	customElements.define('nx-sidebar-leaf', NxSidebarLeaf);
})();
