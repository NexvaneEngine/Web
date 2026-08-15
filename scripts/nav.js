const nav = document.getElementById('site-nav');
const hamburger = document.getElementById('nav-hamburger');

if (nav && hamburger) {
	const mobileQuery = window.matchMedia('(max-width: 860px)');

	const isMobile = () => mobileQuery.matches;

	const closeAllDropdowns = () => {
		document.querySelectorAll('.nav-button.dropdown.open').forEach((el) => {
			el.classList.remove('open');
		});
	};

	const closeMenu = () => {
		nav.classList.remove('nav-open');
		hamburger.setAttribute('aria-expanded', 'false');
		closeAllDropdowns();
	};

	hamburger.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		const isOpen = nav.classList.toggle('nav-open');
		hamburger.setAttribute('aria-expanded', String(isOpen));
		if (!isOpen) {
			closeAllDropdowns();
		}
	});

	document.querySelectorAll('.nav-button.dropdown').forEach((dropdown) => {
		dropdown.addEventListener('click', (event) => {
			if (!isMobile()) {
				return;
			}
			if (event.target.closest('a')) {
				// Let links inside the dropdown navigate normally.
				return;
			}
			event.preventDefault();
			const wasOpen = dropdown.classList.contains('open');
			closeAllDropdowns();
			if (!wasOpen) {
				dropdown.classList.add('open');
			}
		});
	});

	document.addEventListener('click', (event) => {
		if (!isMobile()) {
			return;
		}
		if (!nav.contains(event.target)) {
			closeMenu();
		}
	});

	document.querySelectorAll('nav a').forEach((link) => {
		link.addEventListener('click', () => {
			if (isMobile()) {
				closeMenu();
			}
		});
	});

	mobileQuery.addEventListener('change', () => {
		closeMenu();
	});
} else {
	console.warn('nav.js: #site-nav / #nav-hamburger not found — make sure <nexvane-nav> and scripts/components.js are on the page, loaded before scripts/nav.js.');
}
