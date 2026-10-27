const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const logoPath = path.resolve(__dirname, '../../Logo.jpeg');
  console.log('Reading from:', logoPath);

  const meta = await sharp(logoPath).metadata();
  console.log('Image dimensions:', meta.width, 'x', meta.height);

  const size = meta.width;
  const radius = Math.floor(size / 2) - 3;
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="#ffffff" /></svg>`
  );

  const transparentPath = path.resolve(__dirname, '../public/images/wpi-logo-transparent.png');
  const rootTransparentPath = path.resolve(__dirname, '../public/wpi-logo-transparent.png');
  const wpiLogoPng = path.resolve(__dirname, '../public/images/wpi-logo.png');
  const atLogoPng = path.resolve(__dirname, '../public/images/at-logo.png');

  // 1. Transparent round PNG
  await sharp(logoPath)
    .composite([{
      input: circleSvg,
      blend: 'dest-in'
    }])
    .png({ quality: 100 })
    .toFile(transparentPath);

  fs.copyFileSync(transparentPath, rootTransparentPath);
  fs.copyFileSync(transparentPath, wpiLogoPng);
  fs.copyFileSync(transparentPath, atLogoPng);

  // 2. High-contrast gold / monochrome watermark version for certificates
  const watermarkPath = path.resolve(__dirname, '../public/images/wpi-watermark.png');
  const rootWatermarkPath = path.resolve(__dirname, '../public/wpi-watermark.png');

  await sharp(transparentPath)
    .png()
    .toFile(watermarkPath);

  fs.copyFileSync(watermarkPath, rootWatermarkPath);

  console.log('All logo assets created successfully!');
}

processLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
