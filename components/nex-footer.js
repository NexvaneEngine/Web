/**
 * <nex-footer></nex-footer>
 *
 * Reusable site footer. Same markup/classes as the original static footer,
 * so styles/base.css keeps styling it unchanged.
 */
(function () {
	class NexFooter extends HTMLElement {
		connectedCallback() {
			if (this.dataset.rendered) return;
			this.dataset.rendered = "true";
			this.innerHTML = `
			<footer>
				<div class="dashed-text-div">
					<p>Nexvane Engine</p>
					<p>Acrux &amp; Fotosop</p>
					<p>(c) 2026</p>
				</div>
			</footer>
			`;
		}
	}

	customElements.define("nex-footer", NexFooter);
})();
