/**
 * Gestion des avis Google
 */

const CACHE_KEY = 'google_reviews';
const CACHE_DURATION = 3600 * 1000; // 1 heure en millisecondes
const API_ENDPOINT = 'api/google-reviews-proxy.php';

function getCache() {
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (!cached) {
			return null;
		}
		const data = JSON.parse(cached);
		const now = Date.now();
		if (now - data.timestamp < CACHE_DURATION) {
			return data.reviews;
		}
		localStorage.removeItem(CACHE_KEY);
		return null;
	} catch (e) {
		return null;
	}
}

function setCache(data) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({
			timestamp: Date.now(),
			reviews: data
		}));
	} catch (e) {
		// Ignorer les erreurs de stockage
	}
}

function formatRelativeDate(timestamp) {
	const now = Date.now();
	const diff = now - timestamp * 1000;
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) {
		return "Aujourd'hui";
	} else if (days === 1) {
		return "Hier";
	} else if (days < 7) {
		return `Il y a ${days} jours`;
	} else if (days < 30) {
		const weeks = Math.floor(days / 7);
		return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
	} else if (days < 365) {
		const months = Math.floor(days / 30);
		return `Il y a ${months} mois`;
	} else {
		const years = Math.floor(days / 365);
		return `Il y a ${years} an${years > 1 ? 's' : ''}`;
	}
}

function renderStars(rating) {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	let html = '';

	for (let i = 0; i < fullStars; i++) {
		html += '<svg class="review__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
	}

	if (hasHalfStar) {
		html += '<svg class="review__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill-opacity="0.5"/></svg>';
	}

	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
	for (let i = 0; i < emptyStars; i++) {
		html += '<svg class="review__star" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
	}

	return html;
}

function createAvatarFallback(name) {
	const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	return `<svg class="review__avatar" width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="#5E1D0B" opacity="0.2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5E1D0B" font-size="18" font-weight="bold" font-family="Arial, sans-serif">${initials}</text></svg>`;
}

function renderReviews(data) {
	const container = document.querySelector('.reviews__list');
	if (!container) {
		return;
	}

	if (!data || !data.reviews || data.reviews.length === 0) {
		container.innerHTML = '<div class="reviews__empty">Soyez le premier à laisser un avis</div>';
		return;
	}

	const reviews = data.reviews.slice(0, 5);
	let html = '';

	reviews.forEach(review => {
		const avatar = review.profile_photo_url
			? `<img src="${review.profile_photo_url}" alt="${review.author_name}" class="review__avatar" loading="lazy" width="48" height="48">`
			: createAvatarFallback(review.author_name);

		html += `
			<article class="review">
				<div class="review__header">
					${avatar}
					<div>
						<div class="review__author">${review.author_name}</div>
						<div class="review__date">${formatRelativeDate(review.time)}</div>
					</div>
				</div>
				<div class="review__rating" aria-label="Note: ${review.rating} sur 5">
					${renderStars(review.rating)}
				</div>
				<p class="review__text">${review.text}</p>
			</article>
		`;
	});

	container.innerHTML = html;
}

function renderSummary(data) {
	const summaryContainer = document.querySelector('.reviews__summary');
	if (!summaryContainer) {
		return;
	}

	const rating = data.rating || 0;
	const total = data.user_ratings_total || 0;

	const starsHtml = renderStars(rating);

	summaryContainer.innerHTML = `
		<img src="https://www.google.com/favicon.ico" alt="Google" class="reviews__google-logo" width="32" height="32">
		<div class="reviews__rating">
			<span class="reviews__rating-value">${rating.toFixed(1)}</span>
			<div class="reviews__stars" aria-label="${rating} sur 5 étoiles">
				${starsHtml}
			</div>
		</div>
		<div class="reviews__count">${total} avis</div>
	`;
}

function showLoading() {
	const container = document.querySelector('.reviews__list');
	if (container) {
		container.innerHTML = '<div class="reviews__loading"><div class="reviews__spinner" aria-label="Chargement des avis"></div></div>';
	}
}

function showError() {
	const container = document.querySelector('.reviews__list');
	if (container) {
		container.innerHTML = '<div class="reviews__error">Avis temporairement indisponibles</div>';
	}
}

async function fetchReviews() {
	try {
		const response = await fetch(API_ENDPOINT);
		if (!response.ok) {
			throw new Error('Erreur réseau');
		}
		const data = await response.json();
		if (data.error) {
			throw new Error(data.message);
		}
		return data;
	} catch (error) {
		console.error('Erreur lors du chargement des avis:', error);
		throw error;
	}
}

async function initReviews() {
	const container = document.querySelector('.reviews');
	if (!container) {
		return;
	}

	// Vérifier le cache
	const cached = getCache();
	if (cached) {
		renderSummary(cached);
		renderReviews(cached);
		return;
	}

	// Afficher le loading
	showLoading();

	try {
		const data = await fetchReviews();
		setCache(data);
		renderSummary(data);
		renderReviews(data);
	} catch (error) {
		showError();
	}
}

export default initReviews;

