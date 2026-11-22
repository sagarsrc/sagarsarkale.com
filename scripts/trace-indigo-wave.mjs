// Run from any directory with: node scripts/trace-indigo-wave.mjs
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { contours } from 'd3-contour';
import sharp from 'sharp';

const source = new URL('../public/indigo-curl.webp', import.meta.url);
const output = new URL('../public/indigo-curl.svg', import.meta.url);
const { data, info } = await sharp(fileURLToPath(source)).resize(810).removeAlpha().raw()
  .toBuffer({ resolveWithObject: true });

// Lightness orders the paper and ink. Average the original RGB samples inside
// each band so intermediate blue-grey colours come from the print itself.
const cuts = [217, 184, 150, 113, 80, 57];
const samples = Array.from({ length: cuts.length + 1 }, () => [0, 0, 0, 0]);
const ink = new Float32Array(info.width * info.height);
for (let p = 0; p < ink.length; p++) {
  const offset = p * info.channels;
  const [r, g, b] = data.subarray(offset, offset + 3);
  const light = 0.299 * r + 0.587 * g + 0.114 * b;
  ink[p] = 255 - light;
  let band = 0;
  while (band < cuts.length && light < cuts[band]) band++;
  const sample = samples[band];
  sample[0] += r;
  sample[1] += g;
  sample[2] += b;
  sample[3]++;
}
const colors = samples.map(([r, g, b, n]) =>
  '#' + [r, g, b].map(c => Math.round(c / n).toString(16).padStart(2, '0')).join(''));

// Retain contour points wherever the straight-line approximation would stray
// more than a fraction of a source pixel. Closed rings include their holes.
function simplify(points, start, end, result) {
  const [ax, ay] = points[start];
  const [bx, by] = points[end];
  const dx = bx - ax;
  const dy = by - ay;
  const norm = dx * dx + dy * dy;
  let largest = 0.36 ** 2;
  let split = -1;
  for (let i = start + 1; i < end; i++) {
    const [x, y] = points[i];
    const t = norm ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / norm)) : 0;
    const distance = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2;
    if (distance > largest) {
      largest = distance;
      split = i;
    }
  }
  if (split < 0) {
    result.push(points[start]);
    return;
  }
  simplify(points, start, split, result);
  simplify(points, split, end, result);
}

function pathRing(ring) {
  const vertices = [];
  simplify(ring, 0, ring.length - 1, vertices);
  if (vertices.length < 3) return '';
  let x = 0;
  let y = 0;
  return vertices.map(([px, py], i) => {
    const nextX = Math.round(2 * px);
    const nextY = Math.round(2 * py);
    const step = i ? (i === 1 ? 'l' : ' ') + (nextX - x) + ' ' + (nextY - y) : 'M' + nextX + ' ' + nextY;
    x = nextX;
    y = nextY;
    return step;
  }).join('') + 'z';
}

const trace = contours().size([info.width, info.height]);
const layers = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 ' +
    (2 * info.width) + ' ' + (2 * info.height) + '" role="img" aria-labelledby="title">',
  '<title id="title">Breaking wave in indigo ink on ivory paper</title>',
  '<rect id="paper" width="100%" height="100%" fill="' + colors[0] + '"/>',
];
for (const [i, cut] of cuts.entries()) {
  layers.push('<g id="ink-' + (i + 1) + '" fill="' + colors[i + 1] + '" fill-rule="evenodd">');
  const polygons = trace.contour(ink, 255 - cut).coordinates;
  for (const [outer, ...holes] of polygons) {
    const outline = pathRing(outer);
    if (outline) layers.push('<path d="' + outline + holes.map(pathRing).join('') + '"/>');
  }
  layers.push('</g>');
}
layers.push('</svg>');
await writeFile(output, layers.join('\n') + '\n');
