// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
	const btn = document.getElementById('mobile-menu-button');
	const menu = document.getElementById('mobile-menu');
	if (!btn || !menu) return;

	btn.addEventListener('click', () => {
		const opened = menu.classList.toggle('hidden') === false;
		btn.setAttribute('aria-expanded', String(opened));
	});
});
