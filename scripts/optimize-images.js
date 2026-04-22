const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '../public/homepage_villa');

async function processImages() {
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    return;
  }

  const files = fs.readdirSync(targetDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    // Kita targetkan JPG, JPEG, dan PNG (juga HEIC jika didukung local sharp engine)
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.heic') {
      const filePath = path.join(targetDir, file);
      const outputName = file.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
      const outputPath = path.join(targetDir, outputName);

      // Skip jika versi webp sudah ada sebelumnya (untuk jaga-jaga)
      if (fs.existsSync(outputPath)) {
        console.log(`[SKIP] - Sudah dioptimasi: ${outputName}`);
        continue;
      }

      console.log(`[MENGKONVERSI] - Memproses ${file}...`);

      try {
        await sharp(filePath)
          .webp({ quality: 80, effort: 4 }) // Kualitas 80% WebP nyaris sama persis tapi filesize super ringan
          .toFile(outputPath);

        console.log(`[SUKSES] -> Dibuat: ${outputName}`);
      } catch (err) {
        console.error(`[ERROR] - Gagal memproses ${file}: ${err.message}`);
      }
    }
  }
}

processImages()
  .then(() => console.log('===================\nPROSES OPTIMASI SELESAI!\n==================='))
  .catch(console.error);
