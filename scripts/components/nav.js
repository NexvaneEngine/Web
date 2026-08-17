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

	nav.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			if (isMobile()) {
				closeMenu();
			}
		});
	});

	mobileQuery.addEventListener('change', () => {
		closeMenu();
	});

	// Expose the navbar's real rendered height as --nav-height so other
	// page layouts (e.g. a sticky docs sidebar) can sit flush beneath it
	// instead of hardcoding a guessed value. Kept live since the mobile
	// nav's own height changes a lot between its closed/open states.
	const setNavHeightVar = () => {
		document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
	};
	setNavHeightVar();
	window.addEventListener('resize', setNavHeightVar);
	mobileQuery.addEventListener('change', setNavHeightVar);
	new MutationObserver(setNavHeightVar).observe(nav, { attributes: true, attributeFilter: ['class'] });
} else {
	console.warn('nav.js: #site-nav / #nav-hamburger not found — make sure <nexvane-nav> and scripts/components/nav-footer.js are on the page, loaded before scripts/components/nav.js.');
}
