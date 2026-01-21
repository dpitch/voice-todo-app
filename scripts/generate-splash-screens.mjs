import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// iOS splash screen sizes for different iPhone models
const splashSizes = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' }, // iPad Pro 12.9"
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' }, // iPhone 12/13/14
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556' }, // iPhone 14 Pro
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' }, // iPhone 12/13/14 Pro Max
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796' }, // iPhone 14 Pro Max
];

const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateSplashScreens() {
  for (const { width, height, name } of splashSizes) {
    // Calculate icon size (centered, about 20% of smallest dimension)
    const iconSize = Math.min(width, height) * 0.2;
    const iconX = (width - iconSize) / 2;
    const iconY = (height - iconSize) / 2;

    // Create splash screen with app icon centered
    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="#1a1a1a"/>

        <!-- Centered icon -->
        <g transform="translate(${iconX}, ${iconY})">
          <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.15}" fill="#8b5cf6"/>

          <g transform="translate(${iconSize * 0.2}, ${iconSize * 0.15}) scale(${iconSize / 100})">
            <!-- Clipboard body -->
            <rect x="5" y="12" width="50" height="60" rx="4" fill="white"/>

            <!-- Clipboard clip -->
            <rect x="15" y="6" width="30" height="12" rx="2" fill="white"/>
            <rect x="20" y="2" width="20" height="10" rx="3" fill="#8b5cf6" stroke="white" stroke-width="2"/>

            <!-- Checklist lines -->
            <rect x="12" y="26" width="8" height="8" rx="1" fill="#8b5cf6"/>
            <polyline points="13,30 16,33 21,27" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="25" y="28" width="25" height="4" rx="2" fill="#8b5cf6" opacity="0.6"/>

            <rect x="12" y="42" width="8" height="8" rx="1" fill="#8b5cf6"/>
            <polyline points="13,46 16,49 21,43" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="25" y="44" width="20" height="4" rx="2" fill="#8b5cf6" opacity="0.6"/>

            <rect x="12" y="58" width="8" height="8" rx="1" fill="none" stroke="#8b5cf6" stroke-width="2"/>
            <rect x="25" y="60" width="22" height="4" rx="2" fill="#8b5cf6" opacity="0.4"/>
          </g>
        </g>

        <!-- App name below icon -->
        <text x="${width / 2}" y="${iconY + iconSize + 60}"
              font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              font-size="${iconSize * 0.15}"
              fill="white"
              text-anchor="middle"
              font-weight="600">VoiceTodo</text>
      </svg>
    `;

    const outputPath = path.join(outputDir, `${name}.png`);

    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generateSplashScreens()
  .then(() => console.log('Splash screens generated successfully!'))
  .catch((err) => {
    console.error('Error generating splash screens:', err);
    process.exit(1);
  });
