/*
 * <nx-footer></nx-footer>
 *
 * Drop this tag in any page to get the site footer. Same idea as
 * nx-navbar: renders the original <footer> markup untouched, host
 * element is `display: contents` so it doesn't affect layout.
 */
(function () {
	class NxFooter extends HTMLElement {
		connectedCallback() {
			if (this.dataset.enhanced) return;
			this.dataset.enhanced = 'true';
			this.innerHTML = `
	<footer>
		<div class="dashed-text-div">
			<p>Nexvane Engine</p>
			<p>Acrux &amp; Fotosop</p>
			<p>(c) 2026</p>
		</div>
	</footer>`;
		}
	}

	customElements.define('nx-footer', NxFooter);
})();
