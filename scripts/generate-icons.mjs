/**
 * Generates PWA icons for all required sizes using Canvas API (Node.js)
 * Run: node scripts/generate-icons.mjs
 */
import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

try { mkdirSync(iconsDir, { recursive: true }); } catch {}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0A0A0A";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // Gold gradient background circle
  const grad = ctx.createRadialGradient(size/2, size/3, 0, size/2, size/2, size/1.5);
  grad.addColorStop(0, "rgba(255,215,0,0.15)");
  grad.addColorStop(1, "rgba(255,215,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // Gold lightning bolt (Zap icon)
  const s = size * 0.45;
  const x = (size - s) / 2;
  const y = (size - s * 1.1) / 2;

  const lightGrad = ctx.createLinearGradient(x, y, x + s, y + s);
  lightGrad.addColorStop(0, "#FFD700");
  lightGrad.addColorStop(1, "#DAA520");
  ctx.fillStyle = lightGrad;

  ctx.beginPath();
  ctx.moveTo(x + s * 0.58, y);
  ctx.lineTo(x + s * 0.15, y + s * 0.52);
  ctx.lineTo(x + s * 0.45, y + s * 0.52);
  ctx.lineTo(x + s * 0.42, y + s * 1.1);
  ctx.lineTo(x + s * 0.85, y + s * 0.58);
  ctx.lineTo(x + s * 0.55, y + s * 0.58);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer("image/png");
}

sizes.forEach((size) => {
  try {
    const buffer = drawIcon(size);
    const file = join(iconsDir, `icon-${size}x${size}.png`);
    writeFileSync(file, buffer);
    console.log(`✓ Generated ${size}x${size}`);
  } catch (e) {
    // If canvas module not available, create minimal placeholder
    console.log(`⚠ Skipping ${size}x${size} (canvas module not available)`);
  }
});

console.log("Done! Icons saved to public/icons/");
