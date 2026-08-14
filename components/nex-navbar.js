/**
 * <nex-navbar></nex-navbar>
 *
 * Reusable site navbar. Renders the exact same markup/classes the original
 * static navbar used, so every rule already in styles/base.css keeps
 * applying unchanged (no shadow DOM - this is plain light-DOM templating).
 *
 * Include this script once per page (before the <nex-navbar> tag is used,
 * e.g. in <head>) and drop <nex-navbar></nex-navbar> wherever the nav goes.
 *
 * Adds mobile behaviour on top of the original desktop-only design:
 *  - a hamburger toggle that shows/hides the nav content below 900px
 *  - dropdowns become tap-to-open accordions below 900px (hover keeps
 *    working unchanged above that width)
 */
(function () {
	const MOBILE_QUERY = "(max-width: 900px)";

	class NexNavbar extends HTMLElement {
		connectedCallback() {
			if (this.dataset.rendered) return;
			this.dataset.rendered = "true";
			this.innerHTML = NexNavbar.template();
			this._wireEvents();
		}

		static template() {
			return `
			<nav>
				<div class="nav-bar-row">
					<div class="nav-button nav-logo">
						<div class="nav-logo-img">
							<img class="nav-logo-light" src="/img/logo/light.png" alt="Nexvane logo">
							<img class="nav-logo-dark" src="/img/logo/dark.png" alt="Nexvane logo">
						</div>
						<p><b>Nexvane</b></p>
					</div>
					<div class="nav-button nav-toggle" id="nav-toggle" role="button" tabindex="0" aria-label="Toggle navigation menu" aria-expanded="false">
						<i class="bi bi-list"></i>
					</div>
				</div>

				<div class="nav-links">
					<div class="nav-button dropdown">
						<p>Download <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
						<div class="dropdown-content">
							<a href="/download/windows.html"><i class="bi bi-windows nav-button-icon"></i>Windows</a>
							<a href="/download/linux.html"><i class="bi bi-tux nav-button-icon"></i>Linux</a>
							<a href="/download/source.html"><i class="bi bi-git nav-button-icon"></i>Source</a>
						</div>
					</div>

					<div class="nav-button dropdown">
						<p>Documentation <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
						<div class="dropdown-content">
							<a href="/docs/manual.html"><i class="bi bi-person-fill-down nav-button-icon"></i>User Manual</a>
							<a href="/docs/api.html"><i class="bi bi-journal-code nav-button-icon"></i>API Reference</a>
						</div>
					</div>

					<div class="nav-button dropdown">
						<p>About <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
						<div class="dropdown-content">
							<a href="/about/engine.html"><i class="bi bi-joystick nav-button-icon"></i>Nexvane</a>
							<a href="/about/fotosop.html"><i class="bi bi-building-fill nav-button-icon"></i>Fotosop</a>
							<a href="/about/acrux.html"><i class="bi bi-building-fill nav-button-icon"></i>Acrux</a>
						</div>
					</div>
				</div>

				<div class="nav-right">
					<div class="nav-button dropdown">
						<i class="bi bi-person-circle"></i>
						<p>Username <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
						<div class="dropdown-content dropdown-right">
							<a href="/profile.html"><i class="bi bi-person-fill nav-button-icon"></i>Profile</a>
							<a href="/settings.html"><i class="bi bi-gear-fill nav-button-icon"></i>Settings</a>
							<a href="#"><i class="bi bi-box-arrow-right nav-button-icon"></i>Log Out</a>
						</div>
					</div>
					<div class="nav-button dropdown">
						<i class="bi bi-gear-fill"></i>
						<div class="dropdown-content dropdown-right">
							<a href="#" id="theme-toggle"><i class="bi bi-moon-fill nav-button-icon"></i>Dark Mode</a>
							<a href="#"><i class="bi bi-translate nav-button-icon"></i>Language</a>
						</div>
					</div>
				</div>
			</nav>
			`;
		}

		_wireEvents() {
			const nav = this.querySelector("nav");
			const toggle = this.querySelector("#nav-toggle");
			const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

			const closeMenu = () => {
				nav.classList.remove("nav-open");
				toggle.setAttribute("aria-expanded", "false");
				this.querySelectorAll(".dropdown.dropdown-open").forEach((d) =>
					d.classList.remove("dropdown-open")
				);
			};

			const toggleMenu = () => {
				const open = nav.classList.toggle("nav-open");
				toggle.setAttribute("aria-expanded", String(open));
			};

			toggle.addEventListener("click", toggleMenu);
			toggle.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					toggleMenu();
				}
			});

			// On small screens, tapping a dropdown header opens/closes it as an
			// accordion instead of relying on :hover. Links inside still navigate.
			this.querySelectorAll(".dropdown").forEach((dropdown) => {
				dropdown.addEventListener("click", (event) => {
					if (!isMobile()) return;
					if (event.target.closest("a")) return;
					event.preventDefault();
					dropdown.classList.toggle("dropdown-open");
				});
			});

			// Closing the whole menu after following a real link (except the
			// theme toggle, which isn't navigation).
			this.querySelectorAll(".nav-links a[href], .nav-right a[href]").forEach((link) => {
				link.addEventListener("click", () => {
					if (link.id === "theme-toggle") return;
					closeMenu();
				});
			});

			document.addEventListener("click", (event) => {
				if (!nav.classList.contains("nav-open")) return;
				if (this.contains(event.target)) return;
				closeMenu();
			});

			window.addEventListener("resize", () => {
				if (!isMobile()) closeMenu();
			});
		}
	}

	customElements.define("nex-navbar", NexNavbar);
})();
