/**
 * Generates the 3 PWA icons for IGO Manager:
 *   - icon-192.png        (192×192)
 *   - icon-512.png        (512×512)
 *   - icon-512-maskable.png (512×512, 20% safe-zone padding for Android)
 *
 * Design: black background (#0A0A0A), white "IGO" lettering, bold, centered.
 * Run once with: node scripts/generate-icons.mjs
 */

import { createRequire } from 'module';
import { mkdirSync, existsSync } from 'fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const OUT_DIR = 'public/icons';
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

/**
 * Build an SVG for the icon.
 * @param {number} size - canvas size in px
 * @param {number} paddingPct - fraction of size to use as padding (0 = none, 0.1 = 10%)
 */
function buildSvg(size, paddingPct = 0) {
  const pad        = Math.round(size * paddingPct);
  const innerSize  = size - pad * 2;
  const fontSize   = Math.round(innerSize * 0.32);
  const cx         = size / 2;
  const cy         = size / 2;
  const letterSpacing = Math.round(fontSize * 0.12);

  // Rounded rect radius scales with size
  const rx = Math.round(size * 0.18);

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${size}" height="${size}"
    viewBox="0 0 ${size} ${size}">

  <!-- Background: dark rounded square (like an app icon) -->
  <rect
    x="0" y="0"
    width="${size}" height="${size}"
    rx="${rx}" ry="${rx}"
    fill="#0A0A0A"
  />

  <!-- Subtle inner glow — a very faint lighter square -->
  <rect
    x="${Math.round(size * 0.06)}" y="${Math.round(size * 0.06)}"
    width="${Math.round(size * 0.88)}" height="${Math.round(size * 0.88)}"
    rx="${Math.round(rx * 0.85)}" ry="${Math.round(rx * 0.85)}"
    fill="none"
    stroke="rgba(255,255,255,0.07)"
    stroke-width="${Math.round(size * 0.012)}"
  />

  <!-- "IGO" logotype — white, bold, centered -->
  <text
    x="${cx}"
    y="${cy}"
    font-family="'Helvetica Neue', 'Arial Black', Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="900"
    fill="#FFFFFF"
    text-anchor="middle"
    dominant-baseline="central"
    letter-spacing="${letterSpacing}"
  >IGO</text>

</svg>`;
}

const ICONS = [
  { name: 'icon-192.png',          size: 192, padding: 0    },
  { name: 'icon-512.png',          size: 512, padding: 0    },
  { name: 'icon-512-maskable.png', size: 512, padding: 0.12 }, // 12% safe-zone
];

for (const { name, size, padding } of ICONS) {
  const svg    = buildSvg(size, padding);
  const outPath = `${OUT_DIR}/${name}`;

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);

  console.log(`✅  ${outPath}  (${size}×${size})`);
}

console.log('\n✔  All icons generated in public/icons/');
