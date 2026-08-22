/*
 * <doc-callout type="info|tip|warning|danger">...</doc-callout>
 *
 * A documentation admonition box: an icon + bold label above the
 * element's own content. `type` defaults to "info" if omitted or
 * unrecognized. The label is the translated type name (see
 * doc-callout.lang.json) unless overridden with a label="..." attribute.
 *
 * Usage:
 *   <doc-callout type="info">
 *     These docs cover version 2. For the old docs, see <a href="#">here</a>.
 *   </doc-callout>
 */

(window.LANG_SOURCES = window.LANG_SOURCES || [])
	.push(`${window.SITE_BASE || ''}scripts/components/doc-callout.lang.json`);

const CALLOUT_ICONS = {
	info: 'bi-info-circle-fill',
	tip: 'bi-lightbulb-fill',
	warning: 'bi-exclamation-triangle-fill',
	danger: 'bi-x-octagon-fill',
};

class DocCallout extends HTMLElement {
	connectedCallback() {
		if (this._built) return;
		this._built = true;

		const requestedType = this.getAttribute('type');
		const type = CALLOUT_ICONS[requestedType] ? requestedType : 'info';
		this.setAttribute('type', type);
		this.setAttribute('role', 'note');

		const customLabel = this.getAttribute('label');
		const labelSpan = customLabel
			? `<span>${customLabel}</span>`
			: `<span lang="doc-callout-${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;

		const bodyHtml = this.innerHTML;

		this.innerHTML = `
			<div class="doc-callout-label">
				<i class="bi ${CALLOUT_ICONS[type]}"></i>
				${labelSpan}
			</div>
			<div class="doc-callout-body">${bodyHtml}</div>
		`;
	}
}

customElements.define('doc-callout', DocCallout);
