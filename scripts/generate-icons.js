/**
 * SVG-based PWA icon generator - no external dependencies
 */
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");
try { fs.mkdirSync(iconsDir, { recursive: true }); } catch {}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVG(size) {
  const r = Math.round(size * 0.18);
  const s = Math.round(size * 0.45);
  const x = Math.round((size - s) / 2);
  const y = Math.round((size - s * 1.1) / 2);
  
  // Lightning bolt path points
  const p = {
    x1: x + Math.round(s * 0.58), y1: y,
    x2: x + Math.round(s * 0.15), y2: y + Math.round(s * 0.52),
    x3: x + Math.round(s * 0.45), y3: y + Math.round(s * 0.52),
    x4: x + Math.round(s * 0.42), y4: y + Math.round(s * 1.1),
    x5: x + Math.round(s * 0.85), y5: y + Math.round(s * 0.58),
    x6: x + Math.round(s * 0.55), y6: y + Math.round(s * 0.58),
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="100%" style="stop-color:#DAA520"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="33%" r="60%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.12"/>
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:0"/>
    </radialGradient>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#0A0A0A"/>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bgGlow)"/>
  <polygon points="${p.x1},${p.y1} ${p.x2},${p.y2} ${p.x3},${p.y3} ${p.x4},${p.y4} ${p.x5},${p.y5} ${p.x6},${p.y6}" fill="url(#goldGrad)"/>
</svg>`;
}

sizes.forEach((size) => {
  const svg = generateSVG(size);
  const file = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`✓ Generated icon-${size}x${size}.svg`);
});

console.log("\nIcons saved to public/icons/");
