/**
 * Gestion du popup Tally pour le formulaire de réservation
 */

function initTallyPopup() {
	const button = document.querySelector('.reservation__button');
	if (!button) {
		return;
	}

	// Charger le script Tally
	const script = document.createElement('script');
	script.src = 'https://tally.so/widgets/embed.js';
	script.onload = () => {
		if (window.Tally) {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				// Remplacez cette URL par votre URL Tally réelle
				const tallyFormUrl = 'https://tally.so/r/3lP81W';
				window.Tally.openPopup(tallyFormUrl, {
					layout: 'modal',
					width: 640,
					alignLeft: false,
					hideTitle: false,
					overlay: true
				});
			});
		}
	};
	document.head.appendChild(script);
}

export default initTallyPopup;

