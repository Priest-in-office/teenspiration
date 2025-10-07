// Mobile menu toggle + stats scroll animation
document.addEventListener('DOMContentLoaded', function () {
	const btn = document.getElementById('mobile-menu-button');
	const menu = document.getElementById('mobile-menu');
	if (btn && menu) {
		btn.addEventListener('click', () => {
			const opened = menu.classList.toggle('hidden') === false;
			btn.setAttribute('aria-expanded', String(opened));
		});
	}

	// Animate stat cards when they enter the viewport
	const statCards = document.querySelectorAll('.stat-card');
	const statValues = document.querySelectorAll('.stat-value');

	if ('IntersectionObserver' in window && statCards.length) {
		const io = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry, idx) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				// stagger animation based on index
				el.style.transitionDelay = `${idx * 120}ms`;
				el.classList.remove('opacity-0');
				el.classList.remove('translate-y-6');
				el.classList.add('opacity-100');
				el.classList.add('translate-y-0');

				// start count-up for numeric children
				const valueEl = el.querySelector('.stat-value');
				if (valueEl) {
					if (valueEl.dataset && valueEl.dataset.target) {
						startCountUp(valueEl, parseInt(valueEl.dataset.target, 10), valueEl.dataset.suffix || '');
					} else {
						// non-numeric value (like "Global") - fade it in with a slight stagger
						valueEl.style.transitionDelay = `${idx * 140 + 80}ms`;
						valueEl.classList.remove('opacity-0', 'translate-y-1');
						valueEl.classList.add('opacity-100', 'translate-y-0');
					}
				}

				observer.unobserve(el);
			});
		}, { threshold: 0.2 });

		statCards.forEach((c) => io.observe(c));
	} else {
		// Fallback: reveal immediately and run countups
		statCards.forEach((el) => el.classList.remove('opacity-0', 'translate-y-6'));
		statValues.forEach((valueEl) => {
			if (valueEl.dataset && valueEl.dataset.target) {
				startCountUp(valueEl, parseInt(valueEl.dataset.target, 10), valueEl.dataset.suffix || '');
			}
		});
	}

	function startCountUp(el, target, suffix) {
		if (isNaN(target)) return;
		const duration = 1200; // ms
		const start = performance.now();
		const initial = 0;

		function tick(now) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const current = Math.floor(initial + (target - initial) * easeOutCubic(progress));
			el.textContent = `${current}${suffix}`;
			if (progress < 1) requestAnimationFrame(tick);
			else el.textContent = `${target}${suffix}`;
		}

		requestAnimationFrame(tick);
	}

	function easeOutCubic(t) {
		return 1 - Math.pow(1 - t, 3);
	}
});

// Reveal animations for generic elements marked with .reveal
document.addEventListener('DOMContentLoaded', function () {
	const reveals = document.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window) || !reveals.length) {
		reveals.forEach((el) => el.classList.remove('opacity-0', 'translate-y-6'));
		return;
	}

	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry, idx) => {
			if (!entry.isIntersecting) return;
			const el = entry.target;
			// small stagger based on position in the NodeList
			const i = Array.from(reveals).indexOf(el);
			el.style.transition = `all 700ms cubic-bezier(.22,.9,.31,1) ${i * 120}ms`;
			el.classList.remove('opacity-0', 'translate-y-6');
			el.classList.add('opacity-100', 'translate-y-0');
			observer.unobserve(el);
		});
	}, { threshold: 0.15 });

	reveals.forEach((r) => revealObserver.observe(r));
});

// Newsletter form handling (separate scope)
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('newsletter-form');
	const emailInput = document.getElementById('newsletter-email');
	const msg = document.getElementById('newsletter-msg');
	if (!form || !emailInput || !msg) return;

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const value = emailInput.value.trim();
		if (!validateEmail(value)) {
			msg.textContent = 'Please enter a valid email address.';
			msg.classList.remove('hidden', 'text-emerald-300');
			msg.classList.add('text-red-400');
			emailInput.focus();
			return;
		}

		// Simulate success
		msg.textContent = 'Thanks — you’re subscribed!';
		msg.classList.remove('hidden', 'text-red-400');
		msg.classList.add('text-emerald-300');
		emailInput.value = '';

		// Hide message after a few seconds
		setTimeout(() => {
			msg.classList.add('hidden');
		}, 4000);
	});

	function validateEmail(email) {
		// simple email regex
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}
});
