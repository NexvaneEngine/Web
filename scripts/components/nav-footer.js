/*
 * Reusable site chrome.
 *
 * Drop <nexvane-nav></nexvane-nav> and <nexvane-footer></nexvane-footer>
 * anywhere in a page's <body> and this file renders the real markup into
 * them. Edit the nav or footer in exactly one place (below) and every page
 * that uses these tags picks up the change automatically.
 *
 * This must be the FIRST of the site's <script> tags (before theme.js and
 * nav.js) so the nav/footer markup exists before those scripts look for it.
 * Works from a plain file:// page too, since nothing is fetched over the
 * network — the markup lives right here as a template string.
 */

const NAV_HTML = `
	<nav id="site-nav">
		<div class="nav-topbar">
			<div class="nav-button nav-logo">
				<div class="nav-logo-img">
					<img class="nav-logo-light" src="/img/logo/light.png" alt="Nexvane logo">
					<img class="nav-logo-dark" src="/img/logo/dark.png" alt="Nexvane logo">
				</div>
				<p><b>Nexvane</b></p>
			</div>
			<button class="nav-button nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">
				<i class="bi bi-list"></i>
			</button>
		</div>

		<div class="nav-menu" id="nav-menu">
			<div class="nav-links" id="nav-links">
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
						<a href="/manual.html"><i class="bi bi-person-fill-down nav-button-icon"></i>User Manual</a>
						<a href="/manual/api.html"><i class="bi bi-journal-code nav-button-icon"></i>API Reference</a>
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

			<div class="nav-right" id="nav-right">
				<div class="nav-button dropdown">
					<i class="bi bi-person-circle"></i>
					<p>Username <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
					<div class="dropdown-content dropdown-right">
						<a href="/user/profile.html"><i class="bi bi-person-fill nav-button-icon"></i>Profile</a>
						<a href="/user/settings.html"><i class="bi bi-gear-fill nav-button-icon"></i>Settings</a>
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
	</nav>
`;

const FOOTER_HTML = `
	<footer>
		<div class="dashed-text-div">
			<p>Nexvane Engine</p>
			<p>Acrux &amp; Fotosop</p>
			<p>(c) 2026</p>
		</div>
	</footer>
`;

class NexvaneNav extends HTMLElement {
	connectedCallback() {
		if (this.dataset.rendered) return;
		this.dataset.rendered = 'true';
		this.innerHTML = NAV_HTML;
	}
}

class NexvaneFooter extends HTMLElement {
	connectedCallback() {
		if (this.dataset.rendered) return;
		this.dataset.rendered = 'true';
		this.innerHTML = FOOTER_HTML;
	}
}

customElements.define('nexvane-nav', NexvaneNav);
customElements.define('nexvane-footer', NexvaneFooter);
