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

	// Simple carousel auto-advance
	document.addEventListener('DOMContentLoaded', function () {
		const carousels = document.querySelectorAll('.carousel');
		carousels.forEach((carousel) => {
			const track = carousel.querySelector('.carousel-track');
			const viewport = carousel.querySelector('.carousel-viewport');
			const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
			if (!track || slides.length <= 1 || !viewport) return;

			// compute a responsive gap (in px): prefer CSS var --carousel-gap on the carousel, else fallback by viewport width
			function getGap() {
				try {
					const cssVal = getComputedStyle(carousel).getPropertyValue('--carousel-gap').trim();
					if (cssVal) {
						if (cssVal.endsWith('px')) return parseFloat(cssVal);
						if (cssVal.endsWith('rem')) {
							const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
							return parseFloat(cssVal) * rootPx;
						}
						if (cssVal.endsWith('%')) return (parseFloat(cssVal) / 100) * viewport.offsetWidth;
						const n = parseFloat(cssVal);
						if (!Number.isNaN(n)) return n;
					}
				} catch (e) {
					// ignore and fallback
				}
				const vw = viewport.offsetWidth;
				if (vw < 640) return 8;
				if (vw < 1024) return 12;
				return 20;
			}

			let index = 0;
			const interval = parseInt(carousel.dataset.interval || '4000', 10);
			let timer = null;

			const indicatorsContainer = carousel.querySelector('.carousel-indicators');

			function updateIndicators() {
				if (!indicatorsContainer) return;
				Array.from(indicatorsContainer.children).forEach((btn, idx) => {
					if (idx === index) {
						btn.classList.remove('bg-white/40'); btn.classList.add('bg-white');
						btn.setAttribute('aria-current', 'true');
					} else {
						btn.classList.add('bg-white/40'); btn.classList.remove('bg-white');
						btn.removeAttribute('aria-current');
					}
				});
			}

			function createIndicators() {
				if (!indicatorsContainer) return;
				indicatorsContainer.innerHTML = '';
				slides.forEach((_, i) => {
					const btn = document.createElement('button');
					btn.className = 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/60 focus:outline-none';
					btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
					btn.addEventListener('click', () => { goTo(i, true); restart(); });
					indicatorsContainer.appendChild(btn);
				});
			}

			const prevBtn = carousel.querySelector('.carousel-prev');
			const nextBtn = carousel.querySelector('.carousel-next');
			if (prevBtn) prevBtn.addEventListener('click', () => { goTo(index - 1, true); restart(); });
			if (nextBtn) nextBtn.addEventListener('click', () => { goTo(index + 1, true); restart(); });

			function updateLayout() {
				const gap = getGap();
				const vw = viewport.offsetWidth;
				// make each slide exactly the viewport width so no partial peeking
				slides.forEach((s) => {
					s.style.flex = `0 0 ${vw}px`;
					s.style.width = `${vw}px`;
					s.style.marginRight = `${gap}px`;
				});
				// remove extra gap on the last slide
				if (slides[slides.length - 1]) slides[slides.length - 1].style.marginRight = '0px';
				track.style.display = 'flex';
				track.style.willChange = 'transform';
				track.style.transition = 'transform 600ms cubic-bezier(.22,.9,.31,1)';
				goTo(index, false);
				updateIndicators();
			}

			function goTo(i, animate = true) {
				index = ((i % slides.length) + slides.length) % slides.length;
				if (!animate) track.style.transition = 'none';
				const gap = getGap();
				const vw = viewport.offsetWidth;
				const offsetPx = -(index * (vw + gap));
				track.style.transform = `translateX(${offsetPx}px)`;
				if (!animate) requestAnimationFrame(() => track.style.transition = 'transform 600ms cubic-bezier(.22,.9,.31,1)');
				// reveal contents in the active slide
				slides.forEach((s, idx) => {
					const revealEls = s.querySelectorAll('.reveal');
					if (idx === index) {
						revealEls.forEach((el) => el.classList.remove('opacity-0', 'translate-y-6'));
					}
				});

				// Image fade + scale animation for the active slide
				const prefersReducedLocal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				slides.forEach((s, idx) => {
					const img = s.querySelector('img');
					if (!img) return;
					// Ensure transition is set
					img.style.transition = 'transform 420ms cubic-bezier(.22,.9,.31,1), opacity 420ms cubic-bezier(.22,.9,.31,1)';
					if (idx === index) {
						if (prefersReducedLocal) {
							img.style.opacity = '1';
							img.style.transform = 'scale(1)';
						} else {
							// small delay so the slide movement and image anim feel cohesive
							setTimeout(() => {
								img.style.opacity = '1';
								img.style.transform = 'scale(1)';
							}, 60);
						}
					} else {
						// non-active slides: slightly smaller and dimmed
						img.style.opacity = '0.88';
						img.style.transform = 'scale(0.98)';
					}
				});

				// Entrance animation for list items inside slides (staggered)
				const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				// hide all list items first
				const allListItems = carousel.querySelectorAll('.carousel-slide ul li');
				allListItems.forEach((li) => {
					li.style.opacity = '0';
					li.style.transform = 'translateY(8px)';
					li.style.transition = 'opacity 420ms cubic-bezier(.22,.9,.31,1), transform 420ms cubic-bezier(.22,.9,.31,1)';
				});

				// animate in active slide list items with a small stagger
				const activeListItems = slides[index].querySelectorAll('ul li');
				activeListItems.forEach((li, idx) => {
					const delay = 120 + idx * 80; // ms
					if (prefersReduced) {
						li.style.opacity = '1';
						li.style.transform = 'translateY(0)';
					} else {
						setTimeout(() => {
							li.style.opacity = '1';
							li.style.transform = 'translateY(0)';
						}, delay);
					}
				});

				updateIndicators();
			}

			function start() {
				stop();
				timer = setInterval(() => goTo(index + 1, true), interval);
			}

			function stop() { if (timer) { clearInterval(timer); timer = null; } }

			function restart() { stop(); start(); }

			// Pause on hover/focus
			carousel.addEventListener('mouseenter', stop);
			carousel.addEventListener('mouseleave', start);
			carousel.addEventListener('focusin', stop);
			carousel.addEventListener('focusout', start);

			// respect reduced motion: if user prefers reduced motion, don't auto-start
			const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			window.addEventListener('resize', () => updateLayout());

			// init
			createIndicators();
			updateLayout();
			if (!prefersReduced) start();
		});
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
