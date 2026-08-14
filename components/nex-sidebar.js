/**
 * <nex-sidebar> ... </nex-sidebar>
 *
 * A reusable, nested tree sidebar: expandable "nodes" (folders) and
 * clickable "leafs" (links). Items are styled with the same .nav-button
 * class the top navbar uses, so the interaction/look matches it.
 *
 * Usage (declare the tree as plain markup, any depth):
 *
 *   <nex-sidebar>
 *     <nex-node label="Getting Started" icon="bi-rocket-takeoff-fill" open>
 *       <nex-leaf label="Installation" href="/docs/manual.html#installation"></nex-leaf>
 *       <nex-leaf label="Quick Start" href="/docs/manual.html#quick-start"></nex-leaf>
 *     </nex-node>
 *     <nex-node label="Editor" icon="bi-joystick">
 *       <nex-node label="Assets" icon="bi-box-seam">
 *         <nex-leaf label="Importing Assets" href="/docs/manual.html#importing-assets"></nex-leaf>
 *       </nex-node>
 *     </nex-node>
 *     <nex-leaf label="API Reference" href="/docs/api.html" icon="bi-journal-code"></nex-leaf>
 *   </nex-sidebar>
 *
 * <nex-node> attributes: label, icon (bootstrap-icons class, optional),
 *   href (optional - makes the node itself a link as well as a toggle),
 *   open (boolean attribute - starts expanded).
 * <nex-leaf> attributes: label, icon (optional), href.
 *
 * Multiple <nex-sidebar> "instances" can be dropped on any page, each with
 * its own tree - the navbar/footer/sidebar are all reusable the same way.
 */
(function () {
	const MOBILE_QUERY = "(max-width: 900px)";

	class NexSidebar extends HTMLElement {
		connectedCallback() {
			if (this.dataset.rendered) return;
			// Children (<nex-node>/<nex-leaf>) may not be parsed yet if the
			// browser upgrades this element the instant its start tag is seen.
			// Waiting for the document to finish parsing guarantees they're
			// all there before we read them.
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => this._init(), {
					once: true,
				});
			} else {
				this._init();
			}
		}

		_init() {
			if (this.dataset.rendered) return;
			this.dataset.rendered = "true";

			const tree = this._parse(this);
			this.classList.add("sidebar");
			this.innerHTML = "";

			const mobileBar = document.createElement("div");
			mobileBar.className = "nav-button sidebar-mobile-bar";
			mobileBar.id = "sidebar-toggle-" + NexSidebar._uid++;
			mobileBar.setAttribute("role", "button");
			mobileBar.setAttribute("tabindex", "0");
			mobileBar.setAttribute("aria-expanded", "false");
			mobileBar.innerHTML = `
				<i class="bi bi-list"></i>
				<span>${this.getAttribute("label") || "Contents"}</span>
				<i class="bi bi-chevron-down sidebar-mobile-caret"></i>
			`;

			const treeEl = this._buildList(tree, 0);
			treeEl.classList.add("sidebar-tree");

			this.appendChild(mobileBar);
			this.appendChild(treeEl);

			const toggleMobile = () => {
				const open = this.classList.toggle("sidebar-mobile-open");
				mobileBar.setAttribute("aria-expanded", String(open));
			};
			mobileBar.addEventListener("click", toggleMobile);
			mobileBar.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					toggleMobile();
				}
			});

			window.addEventListener("resize", () => {
				if (!window.matchMedia(MOBILE_QUERY).matches) {
					this.classList.remove("sidebar-mobile-open");
					mobileBar.setAttribute("aria-expanded", "false");
				}
			});

			window.addEventListener("hashchange", () => this._refreshActive());
		}

		_parse(container) {
			const items = [];
			for (const child of Array.from(container.children)) {
				const tag = child.tagName.toLowerCase();
				if (tag === "nex-node") {
					items.push({
						type: "node",
						label: child.getAttribute("label") || "",
						icon: child.getAttribute("icon"),
						href: child.getAttribute("href"),
						open: child.hasAttribute("open"),
						children: this._parse(child),
					});
				} else if (tag === "nex-leaf") {
					items.push({
						type: "leaf",
						label: child.getAttribute("label") || "",
						icon: child.getAttribute("icon"),
						href: child.getAttribute("href") || "#",
					});
				}
			}
			return items;
		}

		_buildList(items, depth) {
			const list = document.createElement("div");
			list.className = "sidebar-list";
			for (const item of items) {
				list.appendChild(
					item.type === "node"
						? this._buildNode(item, depth)
						: this._buildLeaf(item, depth)
				);
			}
			return list;
		}

		_buildLeaf(item, depth) {
			const a = document.createElement("a");
			a.className = "nav-button sidebar-item sidebar-leaf";
			a.href = item.href;
			a.style.setProperty("--sidebar-depth", depth);
			a.innerHTML = `${
				item.icon ? `<i class="bi ${item.icon} nav-button-icon sidebar-icon"></i>` : ""
			}<span>${item.label}</span>`;
			if (this._isCurrent(item.href)) a.classList.add("sidebar-active");
			return a;
		}

		_buildNode(item, depth) {
			const wrap = document.createElement("div");
			wrap.className = "sidebar-node";

			const header = document.createElement(item.href ? "a" : "div");
			header.className = "nav-button sidebar-item sidebar-node-header";
			header.style.setProperty("--sidebar-depth", depth);
			if (item.href) header.setAttribute("href", item.href);
			else {
				header.setAttribute("role", "button");
				header.setAttribute("tabindex", "0");
			}

			const containsActive = this._containsCurrent(item);
			const isOpen = item.open || containsActive;

			header.innerHTML = `
				<i class="bi bi-chevron-right sidebar-caret"></i>
				${item.icon ? `<i class="bi ${item.icon} nav-button-icon sidebar-icon"></i>` : ""}
				<span>${item.label}</span>
			`;
			header.setAttribute("aria-expanded", String(isOpen));

			const childrenEl = this._buildList(item.children, depth + 1);
			childrenEl.classList.add("sidebar-children");

			if (isOpen) wrap.classList.add("sidebar-open");

			const toggle = (event) => {
				event.preventDefault();
				event.stopPropagation();
				const open = wrap.classList.toggle("sidebar-open");
				header.setAttribute("aria-expanded", String(open));
			};

			header.querySelector(".sidebar-caret").addEventListener("click", toggle);

			if (!item.href) {
				header.addEventListener("click", toggle);
				header.addEventListener("keydown", (event) => {
					if (event.key === "Enter" || event.key === " ") toggle(event);
				});
			}
			if (item.href && this._isCurrent(item.href)) {
				header.classList.add("sidebar-active");
			}

			wrap.appendChild(header);
			wrap.appendChild(childrenEl);
			return wrap;
		}

		_isCurrent(href) {
			if (!href || href === "#") return false;
			try {
				const url = new URL(href, window.location.href);
				return (
					url.pathname === window.location.pathname &&
					url.hash === window.location.hash
				);
			} catch (e) {
				return false;
			}
		}

		_containsCurrent(item) {
			if (item.href && this._isCurrent(item.href)) return true;
			if (item.children) return item.children.some((c) => this._containsCurrent(c));
			return false;
		}

		_refreshActive() {
			this.querySelectorAll(".sidebar-item[href]").forEach((el) => {
				el.classList.toggle("sidebar-active", this._isCurrent(el.getAttribute("href")));
			});
		}
	}
	NexSidebar._uid = 0;

	customElements.define("nex-sidebar", NexSidebar);
})();
