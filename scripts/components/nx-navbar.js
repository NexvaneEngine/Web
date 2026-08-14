/*
 * <nx-navbar></nx-navbar>
 *
 * Drop this tag into any page to get the site navbar. It renders the
 * exact same markup/classes as the original hand-written <nav>, so all
 * existing CSS in base.css keeps working untouched. The host element
 * itself is `display: contents` (see components.css), so the real
 * <nav> landmark behaves as if it were a direct child of <body>
 * (sticky positioning, layout, accessibility tree all unaffected).
 *
 * It also owns:
 *  - the mobile hamburger menu (click-to-open panel + accordion dropdowns)
 *  - wiring the theme toggle button to window.NXTheme
 *  - publishing --nav-height so other components (e.g. the sidebar)
 *    can size themselves below a sticky navbar of any height.
 */
(function () {
	const MOBILE_BREAKPOINT = 900;

	class NxNavbar extends HTMLElement {
		connectedCallback() {
			if (this.dataset.enhanced) return;
			this.dataset.enhanced = 'true';
			this.innerHTML = NxNavbar.markup();
			this._wireHamburger();
			this._wireDropdowns();
			this._wireTheme();
			this._trackHeight();
		}

		static markup() {
			return `
	<nav>
		<div class="nav-top">
			<div class="nav-button nav-logo">
				<div class="nav-logo-img">
					<img class="nav-logo-light" src="/img/logo/light.png" alt="Nexvane logo">
					<img class="nav-logo-dark" src="/img/logo/dark.png" alt="Nexvane logo">
				</div>
				<p><b>Nexvane</b></p>
			</div>
			<div class="nav-hamburger" id="nav-hamburger" role="button" tabindex="0" aria-label="Toggle menu" aria-expanded="false">
				<i class="bi bi-list"></i>
			</div>
		</div>

		<div class="nav-links">
			<div class="nav-group nav-group-primary">
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

			<div class="nav-group nav-group-secondary">
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
		</div>
	</nav>`;
		}

		_wireHamburger() {
			const nav = this.querySelector('nav');
			const btn = this.querySelector('#nav-hamburger');

			const toggleMenu = () => {
				const open = nav.classList.toggle('nav-open');
				btn.setAttribute('aria-expanded', String(open));
			};

			btn.addEventListener('click', toggleMenu);
			btn.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					toggleMenu();
				}
			});

			// Closing the mobile panel after a real navigation keeps the
			// menu from staying open when the user comes back/forward.
			this.querySelectorAll('.nav-links a').forEach((a) => {
				a.addEventListener('click', () => nav.classList.remove('nav-open'));
			});
		}

		_wireDropdowns() {
			// Desktop keeps the original hover-to-open behaviour (see base.css).
			// On touch/mobile widths, hover doesn't exist, so a tap toggles
			// an `.open` class that responsive.css shows instead.
			this.querySelectorAll('.nav-button.dropdown').forEach((el) => {
				el.addEventListener('click', (e) => {
					if (window.innerWidth > MOBILE_BREAKPOINT) return;
					if (e.target.closest('a')) return; // let the link navigate
					el.classList.toggle('open');
				});
			});
		}

		_wireTheme() {
			const btn = this.querySelector('#theme-toggle');
			if (!btn || !window.NXTheme) return;
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				window.NXTheme.toggle();
			});
		}

		_trackHeight() {
			// Lets sticky/fixed elements below the navbar (like the sidebar)
			// offset themselves correctly, whatever the navbar's real height is.
			const nav = this.querySelector('nav');
			const update = () => {
				document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
			};
			update();
			window.addEventListener('resize', update);
		}
	}

	customElements.define('nx-navbar', NxNavbar);
})();
