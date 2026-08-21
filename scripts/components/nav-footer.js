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
 *
 * Every internal link/asset path below is built from window.SITE_BASE
 * (set inline near the top of each page's <head>) rather than hardcoded
 * as absolute ("/...") paths, so the exact same nav renders correctly
 * regardless of how deep the current page lives or what sub-path the
 * site is hosted under.
 *
 * Every piece of visible text is wrapped in its own <span lang="key">
 * (see scripts/lang.js) so it can be translated WITHOUT touching its
 * sibling icon — applyLang() replaces an element's whole innerHTML, so
 * if the lang="..." attribute sat directly on a <p> or <a> that also
 * contains an <i> icon, translating it would wipe the icon out too.
 * Translations for these keys live in nav-footer.lang.json, registered
 * below as a lang.js source — not copied into every page's own JSON.
 */

(window.LANG_SOURCES = window.LANG_SOURCES || [])
	.push(`${window.SITE_BASE || ''}scripts/components/nav-footer.lang.json`);

function buildNavHtml() {
	const base = window.SITE_BASE || '';
	return `
	<nav id="site-nav">
		<div class="nav-topbar">
			<a class="nav-button nav-logo" href="${base}index.html">
				<div class="nav-logo-mark"></div>
				<p><b>Nexvane</b></p>
			</a>
			<button class="nav-button nav-hamburger" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">
				<i class="bi bi-list"></i>
			</button>
		</div>

		<div class="nav-menu" id="nav-menu">
			<div class="nav-links" id="nav-links">
				<div class="nav-button dropdown">
					<p><span lang="nav-download">Download</span> <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
					<div class="dropdown-content">
						<a href="${base}download/windows.html"><i class="bi bi-windows nav-button-icon"></i><span lang="nav-windows">Windows</span></a>
						<a href="${base}download/linux.html"><i class="bi bi-tux nav-button-icon"></i><span lang="nav-linux">Linux</span></a>
						<a href="${base}download/source.html"><i class="bi bi-git nav-button-icon"></i><span lang="nav-source">Source</span></a>
					</div>
				</div>

				<div class="nav-button dropdown">
					<p><span lang="nav-documentation">Documentation</span> <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
					<div class="dropdown-content">
						<a href="${base}manual.html"><i class="bi bi-person-fill-down nav-button-icon"></i><span lang="nav-user-manual">User Manual</span></a>
						<a href="${base}manual/api.html"><i class="bi bi-journal-code nav-button-icon"></i><span lang="nav-api-reference">API Reference</span></a>
					</div>
				</div>

				<div class="nav-button dropdown">
					<p><span lang="nav-about">About</span> <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
					<div class="dropdown-content">
						<a href="${base}about/engine.html"><i class="bi bi-joystick nav-button-icon"></i><span lang="nav-about-nexvane">Nexvane</span></a>
						<a href="${base}about/fotosop.html"><i class="bi bi-building-fill nav-button-icon"></i><span lang="nav-about-fotosop">Fotosop</span></a>
						<a href="${base}about/acrux.html"><i class="bi bi-building-fill nav-button-icon"></i><span lang="nav-about-acrux">Acrux</span></a>
					</div>
				</div>
			</div>

			<div class="nav-right" id="nav-right">
				<div class="nav-button dropdown">
					<i class="bi bi-person-circle"></i>
					<p><span lang="nav-username">Username</span> <i class="bi bi-chevron-down" style="font-size: 0.8em;"></i></p>
					<div class="dropdown-content dropdown-right">
						<a href="${base}user/profile.html"><i class="bi bi-person-fill nav-button-icon"></i><span lang="nav-profile">Profile</span></a>
						<a href="${base}user/settings.html"><i class="bi bi-gear-fill nav-button-icon"></i><span lang="nav-settings">Settings</span></a>
						<a href="#"><i class="bi bi-box-arrow-right nav-button-icon"></i><span lang="nav-logout">Log Out</span></a>
					</div>
				</div>
				<div class="nav-button dropdown">
					<i class="bi bi-gear-fill"></i>
					<div class="dropdown-content dropdown-right">
						<a href="#" id="theme-toggle"><i class="bi bi-moon-fill nav-button-icon"></i><span lang="nav-dark-mode">Dark Mode</span></a>
						<a href="#" id="lang-switch"><i class="bi bi-translate nav-button-icon"></i><span lang="nav-language">Language</span></a>
					</div>
				</div>
			</div>
		</div>
	</nav>
`;
}

const FOOTER_HTML = `
	<footer>
		<div class="dashed-text-div">
			<p lang="footer-engine">Nexvane Engine</p>
			<p lang="footer-companies">Acrux &amp; Fotosop</p>
			<p lang="footer-copyright">(c) 2026</p>
		</div>
	</footer>
`;

class NexvaneNav extends HTMLElement {
	connectedCallback() {
		if (this.dataset.rendered) return;
		this.dataset.rendered = 'true';
		this.innerHTML = buildNavHtml();
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
