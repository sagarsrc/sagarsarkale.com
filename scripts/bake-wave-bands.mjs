// Run from the repo root with: node scripts/bake-wave-bands.mjs
// Flattens the six nested ink layers of public/indigo-curl.svg into one
// grayscale band map (0 = paper, 6 = deepest ink) for the homepage shader.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(new URL('../public/indigo-curl.svg', import.meta.url));
const output = fileURLToPath(new URL('../public/indigo-bands.png', import.meta.url));
let svg = await readFile(source, 'utf8');
svg = svg.replace(/(<rect id="paper"[^>]*fill=")[^"]+/, '$1#000000');
for (let i = 1; i <= 6; i++) {
  const v = Math.round((i / 6) * 255).toString(16).padStart(2, '0');
  svg = svg.replace(new RegExp(`(<g id="ink-${i}" fill=")[^"]+`), `$1#${v}${v}${v}`);
}
await sharp(Buffer.from(svg), { density: 96 * 1620 / 1080 })
  .resize(1620, 1620)
  .toColourspace('b-w')
  .png({ compressionLevel: 9, palette: true, colours: 32, dither: 0 })
  .toFile(output);
console.log('wrote', output);
