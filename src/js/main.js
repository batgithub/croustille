/**
 * Point d'entrée principal
 */

import initCarousel from './carousel.js';
import initReviews from './reviews.js';
import initTallyPopup from './tally-popup.js';

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

function init() {
	initCarousel();
	initReviews();
	initTallyPopup();
}

