const toggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
root.setAttribute('data-theme', currentTheme);

toggleBtn.addEventListener('click', () => {
	currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
	root.setAttribute('data-theme', currentTheme);
	localStorage.setItem('theme', currentTheme);
});
