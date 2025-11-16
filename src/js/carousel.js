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

		const dotsNode = document.querySelector('.carousel__dots');
		const prevButton = document.querySelector('.carousel__button--prev');
		const nextButton = document.querySelector('.carousel__button--next');

		let dotNodes = [];

		// Fonction pour générer automatiquement les dots
		const addDotBtnsWithClickHandlers = () => {
			if (!dotsNode) {
				return;
			}

			dotsNode.innerHTML = embla
				.scrollSnapList()
				.map((_, index) => `<button class="carousel__dot" type="button" aria-label="Aller à la slide ${index + 1}"></button>`)
				.join('');

			const scrollTo = (index) => {
				embla.scrollTo(index);
			};

			dotNodes = Array.from(dotsNode.querySelectorAll('.carousel__dot'));
			dotNodes.forEach((dotNode, index) => {
				dotNode.addEventListener('click', () => scrollTo(index), false);
			});
		};

		// Fonction pour mettre à jour l'état actif des dots
		const toggleDotBtnsActive = () => {
			if (dotNodes.length === 0) {
				return;
			}

			const previous = embla.previousScrollSnap();
			const selected = embla.selectedScrollSnap();

			if (dotNodes[previous]) {
				dotNodes[previous].classList.remove('carousel__dot--active');
			}
			if (dotNodes[selected]) {
				dotNodes[selected].classList.add('carousel__dot--active');
			}
		};

		const updateButtons = () => {
			if (prevButton) {
				prevButton.disabled = !embla.canScrollPrev();
			}
			if (nextButton) {
				nextButton.disabled = !embla.canScrollNext();
			}
		};

		// Initialisation des dots
		embla
			.on('init', addDotBtnsWithClickHandlers)
			.on('reInit', addDotBtnsWithClickHandlers)
			.on('init', toggleDotBtnsActive)
			.on('reInit', toggleDotBtnsActive)
			.on('select', () => {
				toggleDotBtnsActive();
				updateButtons();
			});

		if (prevButton) {
			prevButton.addEventListener('click', () => embla.scrollPrev());
		}

		if (nextButton) {
			nextButton.addEventListener('click', () => embla.scrollNext());
		}

		// Initialisation initiale
		updateButtons();
	} catch (error) {
		console.error('Erreur lors du chargement d\'Embla Carousel:', error);
	}
}

export default initCarousel;

