/*
 * Language-selection modal, opened from the nav's "Language" item
 * (#lang-switch). Lists whatever languages lang.js knows about
 * (window.SUPPORTED_LANGS) and calls window.setLang(code) on selection.
 *
 * Load this after scripts/lang.js (needs window.setLang /
 * window.SUPPORTED_LANGS / window.applyLang). The trigger is handled
 * via a delegated document click listener (like theme.js does for
 * #theme-toggle) rather than getElementById, so it doesn't matter
 * whether this loads before or after the nav markup itself has been
 * injected.
 *
 * Language names (LANG_NAMES below) are shown in their OWN language —
 * "English", "Español" — rather than translated into whatever's
 * currently selected; that's deliberate, matching how most language
 * switchers work, so it's not wired through lang.js.
 */

(window.LANG_SOURCES = window.LANG_SOURCES || [])
	.push(`${window.SITE_BASE || ''}scripts/components/lang-modal.lang.json`);

const LANG_NAMES = {
	en: 'English',
	es: 'Español',
};

let modalEl = null;
let triggerEl = null;

function buildModal() {
	const overlay = document.createElement('div');
	overlay.className = 'lang-modal-overlay';
	overlay.hidden = true;

	const codes = window.SUPPORTED_LANGS || ['en'];
	const optionsHtml = codes.map((code) => `
		<button type="button" class="lang-modal-option" data-lang-id="${code}">
			<span>${LANG_NAMES[code] || code}</span>
			<i class="bi bi-check-lg lang-modal-check"></i>
		</button>
	`).join('');

	overlay.innerHTML = `
		<div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="lang-modal-title">
			<div class="lang-modal-header">
				<p id="lang-modal-title" lang="nav-language">Language</p>
				<button type="button" class="lang-modal-close" aria-label="Close" lang="lang-modal-close" data-lang-attr="aria-label">
					<i class="bi bi-x-lg"></i>
				</button>
			</div>
			<div class="lang-modal-options">${optionsHtml}</div>
		</div>
	`;

	document.body.appendChild(overlay);

	// This DOM didn't exist the last time setLang()/applyLang() ran (the
	// modal is only built on first open, not at page load), so it still
	// shows the untranslated fallback text above until we catch it up.
	if (window.applyLang) window.applyLang();

	overlay.addEventListener('click', (event) => {
		if (event.target === overlay) closeModal();
	});
	overlay.querySelector('.lang-modal-close').addEventListener('click', closeModal);
	overlay.querySelectorAll('.lang-modal-option').forEach((button) => {
		button.addEventListener('click', async () => {
			await window.setLang(button.dataset.langId);
			closeModal();
		});
	});

	return overlay;
}

function markActiveOption() {
	if (!modalEl) return;
	modalEl.querySelectorAll('.lang-modal-option').forEach((button) => {
		button.classList.toggle('active', button.dataset.langId === window.langId);
	});
}

function onKeydown(event) {
	if (event.key === 'Escape') closeModal();
}

function openModal(trigger) {
	if (!modalEl) modalEl = buildModal();
	triggerEl = trigger || null;
	markActiveOption();
	modalEl.hidden = false;
	document.addEventListener('keydown', onKeydown);
	const activeOption = modalEl.querySelector('.lang-modal-option.active') || modalEl.querySelector('.lang-modal-option');
	if (activeOption) activeOption.focus();
}

function closeModal() {
	if (!modalEl || modalEl.hidden) return;
	modalEl.hidden = true;
	document.removeEventListener('keydown', onKeydown);
	if (triggerEl) triggerEl.focus();
}

// Keep the checkmark in sync if the language changes some other way
// (e.g. restored from localStorage on load, after the modal already exists).
document.addEventListener('langchange', markActiveOption);

document.addEventListener('click', (event) => {
	const trigger = event.target.closest('#lang-switch');
	if (!trigger) return;
	event.preventDefault();
	openModal(trigger);
});
