const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '../public/homepage_villa');

async function processHeic() {
  const files = fs.readdirSync(targetDir);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    if (ext === '.heic') {
      const filePath = path.join(targetDir, file);
      const outputName = file.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
      const outputPath = path.join(targetDir, outputName);

      if (fs.existsSync(outputPath)) {
        continue;
      }

      console.log(`[HEIC] - Memproses ${file}...`);

      try {
        const inputBuffer = fs.readFileSync(filePath);
        
        // Convert HEIC buffer to raw JPEG buffer using heic-convert
        const jpegBuffer = await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.9
        });
        
        // Pass JPEG buffer to Sharp to convert to WebP
        await sharp(jpegBuffer)
          .webp({ quality: 80, effort: 4 })
          .toFile(outputPath);

        console.log(`[SUKSES] -> Dibuat: ${outputName}`);
      } catch (err) {
        console.error(`[ERROR] - Gagal memproses HEIC ${file}: ${err.message}`);
      }
    }
  }
}

processHeic()
  .then(() => console.log('Selesai konversi HEIC!'))
  .catch(console.error);
