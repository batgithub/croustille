/**
 * Configuration du carousel Embla
 */

function initCarousel() {
	const emblaNode = document.querySelector('.embla');
	if (!emblaNode) {
		return;
	}

	function setupCarousel() {
		const EmblaCarousel = window.EmblaCarousel;
		if (!EmblaCarousel) {
			return;
		}

		const embla = EmblaCarousel(emblaNode, {
			align: 'start',
			loop: true,
			slidesToScroll: 1
		});

		const dots = document.querySelectorAll('.carousel__dot');
		const prevButton = document.querySelector('.carousel__button--prev');
		const nextButton = document.querySelector('.carousel__button--next');

		const updateDots = () => {
			const selectedIndex = embla.selectedScrollSnap();
			dots.forEach((dot, index) => {
				if (index === selectedIndex) {
					dot.classList.add('carousel__dot--active');
				} else {
					dot.classList.remove('carousel__dot--active');
				}
			});
		};

		const updateButtons = () => {
			if (prevButton) {
				prevButton.disabled = !embla.canScrollPrev();
			}
			if (nextButton) {
				nextButton.disabled = !embla.canScrollNext();
			}
		};

		embla.on('select', () => {
			updateDots();
			updateButtons();
		});

		if (prevButton) {
			prevButton.addEventListener('click', () => embla.scrollPrev());
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => embla.scrollNext());
		}

		dots.forEach((dot, index) => {
			dot.addEventListener('click', () => embla.scrollTo(index));
		});

		updateDots();
		updateButtons();
	}

	// Vérifier si Embla est déjà chargé
	if (window.EmblaCarousel) {
		setupCarousel();
		return;
	}

	// Charger Embla depuis CDN
	const script = document.createElement('script');
	script.src = 'https://cdn.jsdelivr.net/npm/embla-carousel@8.0.0/index.umd.min.js';
	script.onload = setupCarousel;
	script.onerror = () => {
		console.error('Erreur lors du chargement d\'Embla Carousel');
	};
	document.head.appendChild(script);
}

export default initCarousel;

