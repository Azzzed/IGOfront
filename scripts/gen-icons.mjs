/**
 * Genera los iconos PWA del IGO Manager.
 * Diseño: cuadrícula 2×2 que representa la Matriz IGO.
 *   Q2 (arriba-izq)  Estratégico  — blanco 22%
 *   Q1 (arriba-der)  ¡Hacer ya!   — blanco 96%  ← célula más brillante
 *   Q4 (abajo-izq)   Descartar    — blanco  7%
 *   Q3 (abajo-der)   Rutina       — blanco 15%
 *
 * Salida:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-512-maskable.png
 *   public/favicon.svg
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

/* ── SVG para icono regular (esquinas redondeadas, squircle) ───────── */
function svgRegular(size) {
  const rx       = Math.round(size * 0.22);   // radio esquinas
  const pad      = Math.round(size * 0.175);  // margen exterior
  const gap      = Math.max(2, Math.round(size * 0.062));
  const inner    = size - pad * 2;
  const cell     = Math.round((inner - gap) / 2);
  const cellR    = Math.max(2, Math.round(cell * 0.28));

  const x1 = pad;
  const x2 = pad + cell + gap;
  const y1 = pad;
  const y2 = pad + cell + gap;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#0A0A0A"/>
  <rect x="${x1}" y="${y1}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.22)"/>
  <rect x="${x2}" y="${y1}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.96)"/>
  <rect x="${x1}" y="${y2}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.07)"/>
  <rect x="${x2}" y="${y2}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.15)"/>
</svg>`;
}

/* ── SVG para icono maskable (fondo full-bleed, contenido en safe area) */
function svgMaskable(size) {
  /* Safe area: círculo del 80% → margen mínimo 10% por lado.
     Usamos 15% de margen para tener holgura. */
  const pad      = Math.round(size * 0.15);
  const gap      = Math.max(2, Math.round(size * 0.054));
  const inner    = size - pad * 2;
  const cell     = Math.round((inner - gap) / 2);
  const cellR    = Math.max(2, Math.round(cell * 0.22));

  const x1 = pad;
  const x2 = pad + cell + gap;
  const y1 = pad;
  const y2 = pad + cell + gap;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0A0A0A"/>
  <rect x="${x1}" y="${y1}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.22)"/>
  <rect x="${x2}" y="${y1}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.96)"/>
  <rect x="${x1}" y="${y2}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.07)"/>
  <rect x="${x2}" y="${y2}" width="${cell}" height="${cell}" rx="${cellR}" fill="rgba(255,255,255,0.15)"/>
</svg>`;
}

/* ── favicon.svg (vectorial, para browser tab) ─────────────────────── */
const faviconSVG = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" fill="#0A0A0A"/>
  <rect x="6"  y="6"  width="8" height="8" rx="2" fill="rgba(255,255,255,0.22)"/>
  <rect x="18" y="6"  width="8" height="8" rx="2" fill="rgba(255,255,255,0.96)"/>
  <rect x="6"  y="18" width="8" height="8" rx="2" fill="rgba(255,255,255,0.07)"/>
  <rect x="18" y="18" width="8" height="8" rx="2" fill="rgba(255,255,255,0.15)"/>
</svg>`;

/* ── Generar PNGs con sharp ─────────────────────────────────────────── */
async function run() {
  const iconsDir = join(ROOT, 'public', 'icons');

  console.log('Generando icon-192.png...');
  await sharp(Buffer.from(svgRegular(512)))
    .resize(192, 192)
    .png()
    .toFile(join(iconsDir, 'icon-192.png'));

  console.log('Generando icon-512.png...');
  await sharp(Buffer.from(svgRegular(512)))
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon-512.png'));

  console.log('Generando icon-512-maskable.png...');
  await sharp(Buffer.from(svgMaskable(512)))
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon-512-maskable.png'));

  console.log('Generando favicon.svg...');
  writeFileSync(join(ROOT, 'public', 'favicon.svg'), faviconSVG, 'utf8');

  console.log('✓ Todos los iconos generados.');
}

run().catch((e) => { console.error(e); process.exit(1); });
