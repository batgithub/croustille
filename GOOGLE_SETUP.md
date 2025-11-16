# Configuration Google Places API

## Prérequis

1. Compte Google Cloud Platform
2. Projet Google Cloud configuré
3. API Places activée dans votre projet

## Étapes de configuration

### 1. Créer une clé API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner votre projet (ou en créer un)
3. Aller dans "APIs & Services" > "Credentials"
4. Cliquer sur "Create Credentials" > "API Key"
5. Copier la clé générée

### 2. Restreindre la clé API (Recommandé)

1. Dans "APIs & Services" > "Credentials"
2. Cliquer sur votre clé API
3. Dans "API restrictions", sélectionner "Restrict key"
4. Cocher uniquement "Places API"
5. Dans "Application restrictions", configurer selon vos besoins (par exemple : IP du serveur)

### 3. Configurer le fichier config.php

1. Copier `config.example.php` en `config.php`
2. Remplacer `VOTRE_CLE_API_ICI` par votre clé API
3. Le Place ID est déjà configuré : `ChIJsxT2fFW7rhIR6bxz6SAKcGc`

```php
define('GOOGLE_API_KEY', 'Votre-vraie-clé-API-ici');
define('GOOGLE_PLACE_ID', 'ChIJsxT2fFW7rhIR6bxz6SAKcGc');
define('CACHE_DURATION', 3600); // 1 heure
```

### 4. Tester l'API

L'endpoint `api/google-reviews-proxy.php` devrait retourner :

```json
{
	"rating": 5.0,
	"user_ratings_total": 12,
	"reviews": [...]
}
```

## Place ID

Le Place ID utilisé est : `ChIJsxT2fFW7rhIR6bxz6SAKcGc`

Pour trouver votre propre Place ID :
1. Utiliser [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Ou utiliser l'outil [Find Place ID](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)

## Tarification

L'API Places est facturée selon l'utilisation. Voir la [grille tarifaire](https://developers.google.com/maps/billing/understanding-cost-of-use#places).

Avec le cache mis en place (1 heure), les appels à l'API sont limités.

## Dépannage

### Erreur "Configuration manquante"

Vérifier que `config.php` existe et contient toutes les constantes requises.

### Erreur "Service temporairement indisponible"

- Vérifier que la clé API est valide
- Vérifier que l'API Places est activée dans Google Cloud
- Vérifier les logs PHP (`error_log()`)

### Erreur CORS

Si vous testez en local, les headers CORS sont configurés pour `Access-Control-Allow-Origin: *`. En production, ajuster selon votre domaine.

