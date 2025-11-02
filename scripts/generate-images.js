const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const originalsDir = path.join(__dirname, '../src/images/originals');
const outputDir = path.join(__dirname, '../dist/images');
const widths = [400, 800, 1200, 1600];

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Lire tous les fichiers du dossier originals
fs.readdir(originalsDir, (err, files) => {
	if (err) {
		console.error('Erreur lors de la lecture du dossier:', err);
		process.exit(1);
	}

	const imageFiles = files.filter(file => {
		const ext = path.extname(file).toLowerCase();
		return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
	});

	if (imageFiles.length === 0) {
		console.log('Aucune image trouvée dans src/images/originals/');
		return;
	}

	let processedCount = 0;
	let errorCount = 0;

	console.log(`\n📸 Génération de ${imageFiles.length} image(s)...\n`);

	imageFiles.forEach((file, index) => {
		const inputPath = path.join(originalsDir, file);
		const baseName = path.parse(file).name;
		const originalExt = path.extname(file).toLowerCase();
		const isPng = originalExt === '.png';
		const isJpeg = ['.jpg', '.jpeg'].includes(originalExt);

		let promisesPerFile = 0;
		let completedPromisesPerFile = 0;

		// Génération des versions WebP pour chaque largeur
		widths.forEach(width => {
			const webpPath = path.join(outputDir, `${baseName}-${width}w.webp`);
			promisesPerFile++;

			sharp(inputPath)
				.resize(width, null, {
					withoutEnlargement: true,
					fit: 'inside'
				})
				.webp({ quality: 85 })
				.toFile(webpPath)
				.then(() => {
					completedPromisesPerFile++;
					checkFileCompletion();
				})
				.catch((error) => {
					errorCount++;
					console.error(`❌ Erreur pour ${baseName}-${width}w.webp:`, error.message);
					completedPromisesPerFile++;
					checkFileCompletion();
				});
		});

		// Génération d'une seule version format d'origine (fallback) si PNG ou JPEG
		if (isPng || isJpeg) {
			const fallbackWidth = 600;
			const originalFormatPath = path.join(outputDir, `${baseName}${originalExt}`);
			promisesPerFile++;

			let sharpInstance = sharp(inputPath)
				.resize(fallbackWidth, null, {
					withoutEnlargement: true,
					fit: 'inside'
				});

			if (isPng) {
				// PNG : compression optimisée
				sharpInstance = sharpInstance.png({ 
					compressionLevel: 9,
					adaptiveFiltering: true
				});
			} else if (isJpeg) {
				// JPEG : compression avec qualité
				sharpInstance = sharpInstance.jpeg({ 
					quality: 85,
					progressive: true
				});
			}

			sharpInstance
				.toFile(originalFormatPath)
				.then(() => {
					completedPromisesPerFile++;
					checkFileCompletion();
				})
				.catch((error) => {
					errorCount++;
					console.error(`❌ Erreur pour ${baseName}${originalExt}:`, error.message);
					completedPromisesPerFile++;
					checkFileCompletion();
				});
		}

		function checkFileCompletion() {
			if (completedPromisesPerFile === promisesPerFile) {
				processedCount++;
				const versionsCount = promisesPerFile;
				console.log(`✅ ${baseName}: ${versionsCount} version(s) générée(s)`);

				if (processedCount === imageFiles.length) {
					console.log(`\n✨ Génération terminée: ${processedCount} image(s) traitée(s)`);
					if (errorCount > 0) {
						console.log(`⚠️  ${errorCount} erreur(s) rencontrée(s)`);
					}
				}
			}
		}
	});
});

