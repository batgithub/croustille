/**
 * Configuration du carousel Embla
 */

// Chargement dynamique du fichier UMD
let EmblaCarousel;

async function loadEmbla() {
	if (EmblaCarousel) {
		return EmblaCarousel;
	}

	// Charger le fichier UMD dynamiquement depuis dist/js
	const script = document.createElement('script');
	script.src = 'dist/js/embla-carousel.umd.js';
	
	return new Promise((resolve, reject) => {
		script.onload = () => {
			// Le fichier UMD expose EmblaCarousel globalement
			EmblaCarousel = globalThis.EmblaCarousel || window.EmblaCarousel;
			if (!EmblaCarousel) {
				reject(new Error('EmblaCarousel n\'a pas été chargé correctement'));
				return;
			}
			resolve(EmblaCarousel);
		};
		script.onerror = () => {
			reject(new Error('Erreur lors du chargement d\'Embla Carousel'));
		};
		document.head.appendChild(script);
	});
}

async function initCarousel() {
	const emblaNode = document.querySelector('.embla');
	if (!emblaNode) {
		return;
	}

	try {
		const EmblaCarouselLoader = await loadEmbla();
		const embla = EmblaCarouselLoader(emblaNode, {
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
	} catch (error) {
		console.error('Erreur lors du chargement d\'Embla Carousel:', error);
	}
}

export default initCarousel;

