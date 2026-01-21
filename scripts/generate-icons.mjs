import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  for (const size of sizes) {
    // Create a simple clipboard/checklist icon SVG
    // Purple background (#8b5cf6) with a white clipboard icon
    const svgContent = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background with rounded corners for maskable icon -->
        <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#8b5cf6"/>

        <!-- Clipboard base -->
        <g transform="translate(${size * 0.2}, ${size * 0.15}) scale(${size / 100})">
          <!-- Clipboard body -->
          <rect x="5" y="12" width="50" height="60" rx="4" fill="white"/>

          <!-- Clipboard clip -->
          <rect x="15" y="6" width="30" height="12" rx="2" fill="white"/>
          <rect x="20" y="2" width="20" height="10" rx="3" fill="#8b5cf6" stroke="white" stroke-width="2"/>

          <!-- Checklist lines -->
          <!-- Item 1 - checked -->
          <rect x="12" y="26" width="8" height="8" rx="1" fill="#8b5cf6"/>
          <polyline points="13,30 16,33 21,27" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="25" y="28" width="25" height="4" rx="2" fill="#8b5cf6" opacity="0.6"/>

          <!-- Item 2 - checked -->
          <rect x="12" y="42" width="8" height="8" rx="1" fill="#8b5cf6"/>
          <polyline points="13,46 16,49 21,43" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="25" y="44" width="20" height="4" rx="2" fill="#8b5cf6" opacity="0.6"/>

          <!-- Item 3 - unchecked -->
          <rect x="12" y="58" width="8" height="8" rx="1" fill="none" stroke="#8b5cf6" stroke-width="2"/>
          <rect x="25" y="60" width="22" height="4" rx="2" fill="#8b5cf6" opacity="0.4"/>
        </g>
      </svg>
    `;

    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generateIcons()
  .then(() => console.log('Icons generated successfully!'))
  .catch((err) => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
