const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function buildJS() {
	const entryFile = path.join(__dirname, '../src/js/main.js');
	const outputFile = path.join(__dirname, '../dist/js/main.min.js');

	try {
		const result = await esbuild.build({
			entryPoints: [entryFile],
			bundle: true,
			minify: true,
			sourcemap: false,
			outfile: outputFile,
			format: 'esm',
			target: 'es2020',
			platform: 'browser',
			treeShaking: true,
			legalComments: 'none'
		});

		console.log(`✅ JavaScript bundlé et minifié : ${outputFile}`);
		
		// Copier le fichier Embla Carousel UMD dans dist/js
		const emblaSource = path.join(__dirname, '../src/js/embla-carousel.umd.js');
		const emblaDest = path.join(__dirname, '../dist/js/embla-carousel.umd.js');
		
		if (fs.existsSync(emblaSource)) {
			fs.copyFileSync(emblaSource, emblaDest);
			console.log(`✅ Fichier Embla Carousel copié : ${emblaDest}`);
		}
		
		// Calculer la taille du fichier
		const stats = fs.statSync(outputFile);
		const sizeInKB = (stats.size / 1024).toFixed(2);
		console.log(`📦 Taille : ${sizeInKB} KB`);
	} catch (error) {
		console.error('❌ Erreur lors du build JavaScript:', error);
		process.exit(1);
	}
}

buildJS();

