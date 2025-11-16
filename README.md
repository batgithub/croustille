# Cantine de quartier - Landing Page

Landing page pour le restaurant végétalien "Cantine de quartier" à Toulouse.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Générer les images (placez vos images dans src/images/originals/)
npm run build:images

# Builder les assets CSS et JS
npm run build

# Mode développement avec watch
npm run watch
```

## 📁 Structure

```
/
├── src/
│   ├── css/              # Fichiers CSS sources
│   ├── js/               # Fichiers JavaScript sources
│   └── images/originals/ # Images sources haute résolution
├── dist/                 # Assets générés (CSS, JS, images)
├── api/                  # API PHP pour Google Reviews
├── cache/                # Cache des avis Google
└── index.html            # Page principale
```

## 🔧 Configuration

### Google Reviews

1. Copier `config.example.php` en `config.php`
2. Ajouter votre clé API Google Places
3. Voir `GOOGLE_SETUP.md` pour plus de détails

### Tally Form

Dans `src/js/tally-popup.js`, remplacer `[VOTRE_ID_FORMULAIRE]` par l'ID de votre formulaire Tally.

### Images

1. Placer vos images dans `src/images/originals/`
2. Exécuter `npm run build:images`
3. Les versions WebP seront générées dans `dist/images/`

## 🎨 Personnalisation

### Couleurs

Modifier les variables dans `src/css/variables.css` :

```css
:root {
	--dark-brown: #5E1D0B;
	--light-beige: #FEF0E9;
	--light-orange-1: #ED805B;
	--light-orange-2: #FFD2BF;
}
```


## 📦 Build

```bash
# Build complet
npm run build

# Build CSS uniquement
npm run build:css

# Build JS uniquement
npm run build:js

# Build images uniquement
npm run build:images
```

## 🚢 Déploiement

Le déploiement se fait automatiquement via GitHub Actions lors d'un push sur `main`.

### Configuration GitHub Secrets

- `FTP_SERVER` : ftp.votre-domaine.ch
- `FTP_USERNAME` : votre-user-infomaniak
- `FTP_PASSWORD` : votre-mot-de-passe

## 📝 Notes

- Les fichiers dans `src/` ne sont jamais déployés
- Seuls les fichiers dans `dist/` et les fichiers PHP sont déployés
- `config.php` n'est jamais commité (déjà dans `.gitignore`)

