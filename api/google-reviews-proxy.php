<?php
/**
 * Proxy PHP pour récupérer les avis Google Places
 * Version PHP: 8.2+
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Inclure la configuration
$configPath = dirname(__DIR__) . '/config.php';
if (!file_exists($configPath)) {
	http_response_code(500);
	echo json_encode([
		'error' => true,
		'message' => 'Configuration manquante'
	]);
	exit;
}

require_once $configPath;

// Vérifier que les constantes sont définies
if (!defined('GOOGLE_API_KEY') || !defined('GOOGLE_PLACE_ID') || !defined('CACHE_DURATION')) {
	http_response_code(500);
	echo json_encode([
		'error' => true,
		'message' => 'Configuration incomplète'
	]);
	exit;
}

// Chemin du fichier de cache
$cacheDir = dirname(__DIR__) . '/cache';
if (!is_dir($cacheDir)) {
	mkdir($cacheDir, 0755, true);
}
$cacheFile = $cacheDir . '/google_reviews.json';

/**
 * Lire le cache
 */
function readCache($cacheFile, $cacheDuration) {
	if (!file_exists($cacheFile)) {
		return null;
	}

	$cacheData = json_decode(file_get_contents($cacheFile), true);
	if (!$cacheData || !isset($cacheData['timestamp']) || !isset($cacheData['data'])) {
		return null;
	}

	$age = time() - $cacheData['timestamp'];
	if ($age > $cacheDuration) {
		return null;
	}

	return $cacheData['data'];
}

/**
 * Écrire dans le cache
 */
function writeCache($cacheFile, $data) {
	$cacheData = [
		'timestamp' => time(),
		'data' => $data
	];
	file_put_contents($cacheFile, json_encode($cacheData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
	chmod($cacheFile, 0644);
}

/**
 * Appeler l'API Google Places
 */
function fetchGoogleReviews($apiKey, $placeId) {
	$url = 'https://maps.googleapis.com/maps/api/place/details/json';
	$params = [
		'place_id' => $placeId,
		'fields' => 'rating,user_ratings_total,reviews',
		'language' => 'fr',
		'key' => $apiKey
	];

	$fullUrl = $url . '?' . http_build_query($params);

	$ch = curl_init($fullUrl);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

	$response = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$curlError = curl_error($ch);
	curl_close($ch);

	if ($curlError) {
		error_log('Erreur cURL Google Places: ' . $curlError);
		return null;
	}

	if ($httpCode !== 200) {
		error_log('Code HTTP inattendu: ' . $httpCode);
		return null;
	}

	$data = json_decode($response, true);

	if (!$data || !isset($data['status'])) {
		error_log('Réponse invalide de l\'API Google');
		return null;
	}

	if ($data['status'] !== 'OK') {
		error_log('Erreur API Google: ' . $data['status']);
		return null;
	}

	if (!isset($data['result'])) {
		error_log('Résultat manquant dans la réponse API');
		return null;
	}

	return [
		'rating' => $data['result']['rating'] ?? 0,
		'user_ratings_total' => $data['result']['user_ratings_total'] ?? 0,
		'reviews' => $data['result']['reviews'] ?? []
	];
}

// Vérifier le cache
$cached = readCache($cacheFile, CACHE_DURATION);

if ($cached !== null) {
	echo json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	exit;
}

// Appeler l'API Google
$data = fetchGoogleReviews(GOOGLE_API_KEY, GOOGLE_PLACE_ID);

if ($data === null) {
	http_response_code(503);
	echo json_encode([
		'error' => true,
		'message' => 'Service temporairement indisponible'
	]);
	exit;
}

// Sauvegarder dans le cache
writeCache($cacheFile, $data);

// Retourner les données
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

