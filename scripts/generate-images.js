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

		widths.forEach(width => {
			const outputPath = path.join(outputDir, `${baseName}-${width}w.webp`);

			sharp(inputPath)
				.resize(width, null, {
					withoutEnlargement: true,
					fit: 'inside'
				})
				.webp({ quality: 85 })
				.toFile(outputPath)
				.then(() => {
					if (width === widths[widths.length - 1]) {
						processedCount++;
						console.log(`✅ ${baseName}: ${widths.length} version(s) générée(s)`);

						if (processedCount === imageFiles.length) {
							console.log(`\n✨ Génération terminée: ${processedCount} image(s) traitée(s)`);
							if (errorCount > 0) {
								console.log(`⚠️  ${errorCount} erreur(s) rencontrée(s)`);
							}
						}
					}
				})
				.catch((error) => {
					errorCount++;
					console.error(`❌ Erreur pour ${baseName}-${width}w.webp:`, error.message);
				});
		});
	});
});

