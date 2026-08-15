const root = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', currentTheme);

// Delegated on document (rather than getElementById at load time) so this
// keeps working no matter when/how #theme-toggle ends up in the DOM —
// e.g. injected later by the <nexvane-nav> component.
document.addEventListener('click', (event) => {
	const toggleBtn = event.target.closest('#theme-toggle');
	if (!toggleBtn) return;
	event.preventDefault();
	currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
	root.setAttribute('data-theme', currentTheme);
	localStorage.setItem('theme', currentTheme);
});
