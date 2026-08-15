/*
 * Docs sidebar tree behavior: clicking a node (.doc-tree-toggle) expands
 * or collapses its child list; clicking a leaf (.doc-tree-leaf) is a
 * normal link, highlighted here as the active one.
 *
 * Include this on any page that uses the .doc-tree markup, after
 * components.js/theme.js/nav.js.
 */

document.querySelectorAll('.doc-tree-toggle').forEach((toggle) => {
	const list = toggle.nextElementSibling;
	if (!list) return;
	toggle.addEventListener('click', () => {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		toggle.setAttribute('aria-expanded', String(!expanded));
		list.hidden = expanded;
	});
});

function highlightActiveLeaf() {
	const hash = window.location.hash;
	document.querySelectorAll('.doc-tree-leaf').forEach((leaf) => {
		leaf.classList.toggle('active', hash !== '' && leaf.getAttribute('href') === hash);
	});
}

document.querySelectorAll('.doc-tree-leaf').forEach((leaf) => {
	leaf.addEventListener('click', () => {
		setTimeout(highlightActiveLeaf, 0);
	});
});

window.addEventListener('hashchange', highlightActiveLeaf);
highlightActiveLeaf();
