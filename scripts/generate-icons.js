import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// SVG Icon definition
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>
  </defs>

  <!-- Base App Tile Background with Rounded Corners -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)" />

  <!-- Outer Pulse Ring -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#334155" stroke-width="6" stroke-dasharray="16 12" />

  <!-- Atmospheric Isobars & Air Flow Streams -->
  <path d="M 120 180 C 180 140, 310 140, 370 170 C 400 185, 410 220, 390 240 C 370 260, 330 250, 330 230 C 330 200, 360 180, 390 190" 
        fill="none" stroke="url(#windGrad)" stroke-width="24" stroke-linecap="round" />
        
  <path d="M 100 256 C 160 216, 290 216, 360 256 C 390 274, 380 310, 350 316 C 320 322, 290 290, 310 270" 
        fill="none" stroke="#38BDF8" stroke-width="20" stroke-linecap="round" />

  <path d="M 140 330 C 200 370, 320 370, 380 330" 
        fill="none" stroke="#F43F5E" stroke-width="18" stroke-linecap="round" />

  <!-- Cloudburst & Thunder Lightning Symbol in Center -->
  <path d="M 270 180 L 210 270 L 260 270 L 230 350 L 310 250 L 260 250 Z" 
        fill="url(#boltGrad)" stroke="#FEF08A" stroke-width="4" stroke-linejoin="round" />

  <!-- Radar Scan Beacon Dot -->
  <circle cx="390" cy="190" r="14" fill="#10B981" />
  <circle cx="390" cy="190" r="24" fill="none" stroke="#10B981" stroke-width="4" opacity="0.6" />
</svg>
`;

// Helper to draw clean circular badge and atmospheric wind icon directly onto PNG buffer
function drawAppIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = isMaskable ? size * 0.40 : size * 0.46; // maskable safe-zone padding: 15-20% margin!
  const bgRoundRadius = isMaskable ? 0 : size * 0.20;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Distance from center
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full bleed background for Android maskable icon
        // Subtle dark slate gradient
        const t = (x + y) / (2 * size);
        const r = Math.round(15 * (1 - t) + 30 * t);
        const g = Math.round(23 * (1 - t) + 41 * t);
        const b = Math.round(42 * (1 - t) + 59 * t);
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      } else {
        // Rounded squircle check
        const cornerDistX = Math.max(0, Math.abs(dx) - (center - bgRoundRadius));
        const cornerDistY = Math.max(0, Math.abs(dy) - (center - bgRoundRadius));
        const cornerDist = Math.sqrt(cornerDistX * cornerDistX + cornerDistY * cornerDistY);

        if (cornerDist > bgRoundRadius) {
          // Transparent outside rounded corners
          png.data[idx] = 0;
          png.data[idx + 1] = 0;
          png.data[idx + 2] = 0;
          png.data[idx + 3] = 0;
          continue;
        }

        const t = (x + y) / (2 * size);
        const r = Math.round(15 * (1 - t) + 30 * t);
        const g = Math.round(23 * (1 - t) + 41 * t);
        const b = Math.round(42 * (1 - t) + 59 * t);
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }

      // Draw radar circle guide
      const ringDist = Math.abs(dist - radius * 0.85);
      if (ringDist < size * 0.012) {
        png.data[idx] = 71;
        png.data[idx + 1] = 85;
        png.data[idx + 2] = 105;
        png.data[idx + 3] = 180;
      }

      // Draw AirSense Wind lines (top swoop, middle swoop, bottom swoop)
      const nx = (x - center) / radius; // -1 to 1 normalized
      const ny = (y - center) / radius; // -1 to 1 normalized

      // Top Wind Arc (PM2.5 to Ozone gradient: Sky blue to rose)
      const topArcY = -0.28 + 0.35 * Math.sin((nx + 0.3) * 2.2);
      const topArcDist = Math.abs(ny - topArcY);
      if (nx >= -0.75 && nx <= 0.70 && topArcDist < 0.09) {
        const u = (nx + 0.75) / 1.45;
        png.data[idx] = Math.round(56 * (1 - u) + 244 * u);
        png.data[idx + 1] = Math.round(189 * (1 - u) + 63 * u);
        png.data[idx + 2] = Math.round(248 * (1 - u) + 94 * u);
        png.data[idx + 3] = 255;
      }

      // Bottom Wind Arc (Indian AQI Red/Orange)
      const btmArcY = 0.38 - 0.25 * Math.sin((nx + 0.2) * 2.5);
      const btmArcDist = Math.abs(ny - btmArcY);
      if (nx >= -0.65 && nx <= 0.65 && btmArcDist < 0.08) {
        png.data[idx] = 239;
        png.data[idx + 1] = 68;
        png.data[idx + 2] = 68;
        png.data[idx + 3] = 255;
      }

      // Center Lightning Bolt (Cloudburst / Convection icon)
      // Segment 1: top to mid-left
      // Polygon check or simplified lightning coordinates
      let inLightning = false;
      // Top point (0.05, -0.35), mid elbow (-0.18, 0.05), inner crook (0.02, 0.05),
      // bottom point (-0.08, 0.45), mid right crook (0.22, -0.05), inner right (0.04, -0.05)
      // Check if inside bolt bounding box
      if (nx >= -0.22 && nx <= 0.24 && ny >= -0.35 && ny <= 0.45) {
        // Upper triangle
        if (ny < 0.05) {
          const w = (ny - -0.35) / 0.4;
          const leftX = 0.05 - w * 0.23;
          const rightX = 0.08 + w * 0.14;
          if (nx >= leftX && nx <= rightX) inLightning = true;
        } else {
          // Lower triangle
          const w = (ny - 0.05) / 0.4;
          const leftX = -0.05 - (1 - w) * 0.12;
          const rightX = 0.18 - w * 0.26;
          if (nx >= leftX && nx <= rightX) inLightning = true;
        }
      }

      if (inLightning) {
        png.data[idx] = 250;
        png.data[idx + 1] = 204;
        png.data[idx + 2] = 21;
        png.data[idx + 3] = 255;
      }

      // Emerald Radar Beacon Dot at (0.65, -0.2)
      const beaconDist = Math.sqrt((nx - 0.55) ** 2 + (ny + 0.15) ** 2);
      if (beaconDist < 0.065) {
        png.data[idx] = 16;
        png.data[idx + 1] = 185;
        png.data[idx + 2] = 129;
        png.data[idx + 3] = 255;
      }
    }
  }

  return png;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write public/icon.svg
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Wrote public/icon.svg');

// 2. Generate PNGs: 192x192, 512x512, maskable 512x512, apple-touch 180x180
const iconsToGenerate = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
  { file: 'favicon.png', size: 64, maskable: false }
];

for (const icon of iconsToGenerate) {
  const png = drawAppIcon(icon.size, icon.maskable);
  const outPath = path.join(publicDir, icon.file);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`Generated ${icon.file} (${icon.size}x${icon.size}, maskable=${icon.maskable})`);
}

console.log('All PWA and Android icons generated successfully!');
