/*
 * Shared theme controller.
 * Exposes window.NXTheme so any component (nx-navbar, future pages, etc.)
 * can read/toggle the theme without duplicating logic.
 * Runs immediately on load (kept in <head>) so the theme is applied
 * before first paint - avoids a light/dark flash.
 */
window.NXTheme = (function () {
	const root = document.documentElement;

	function current() {
		return root.getAttribute('data-theme') || 'light';
	}

	function apply(theme) {
		root.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	function init() {
		const saved = localStorage.getItem('theme');
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		apply(saved || (systemPrefersDark ? 'dark' : 'light'));
	}

	function toggle() {
		apply(current() === 'dark' ? 'light' : 'dark');
	}

	init();

	return { current, toggle, init };
})();
