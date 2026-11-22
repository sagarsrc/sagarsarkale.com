// Run from the repo root with: node scripts/generate-wave-og.mjs
// Renders the homepage social cards from the vector wave (public/indigo-curl.svg)
// and the site's own fonts, in headless Chromium, at exact card sizes:
//   public/social/home.jpg               1200x630  Open Graph / X / LinkedIn / Slack
//   design/og/github-social-preview.png  1280x640  GitHub repository social preview
//   public/social/square.jpg             600x600   crest only, for square thumbnails
//                                        (WhatsApp, iMessage, Telegram small previews)
// Every image is centred on the wave's crest; text stays inside a 40pt safe border. Site images are
// written as JPEG under 300KB, the size above which WhatsApp drops link previews.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
// Fonts are inlined: a page set with setContent has no origin to load local files from.
const font = async (p, type) => `data:font/${type};base64,${(await readFile(new URL(p, root))).toString('base64')}`;
const light = await font('public/fonts/Literata/Literata-Light.woff2', 'woff2');
const lightItalic = await font('public/fonts/Literata/Literata-LightItalic.woff2', 'woff2');
const mono = await font('public/fonts/Monaspace/MonaspaceArgon-Regular.woff', 'woff');
const wave = await readFile(new URL('public/indigo-curl.svg', root), 'utf8');
// Drop the title and the paper rectangle; the page background is the same paper.
const waveSvg = wave
  .replace(/<title[^>]*>.*?<\/title>/, '')
  .replace(/<rect id="paper"[^>]*\/>/, '')
  .replace(/ width="1080" height="1080"/, '');

const cards = [
  { out: 'public/social/home.jpg', w: 1200, h: 630 },
  { out: 'design/og/github-social-preview.png', w: 1280, h: 640 },
  { out: 'public/social/square.jpg', w: 1200, h: 1200, square: true, size: 600 },
];

// Square thumbnail: the curl centred on paper, no text (it would be unreadable that small).
const squarePage = (w) => {
  const size = Math.round(w * 1.55);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
* { margin: 0; } html, body { width: ${w}px; height: ${w}px; overflow: hidden; background: #f6e5c4; }
.wave { position: absolute; left: ${Math.round(w / 2 - CREST[0] * size)}px; top: ${Math.round(w / 2 - CREST[1] * size)}px; width: ${size}px; height: ${size}px; }
.wave svg { width: 100%; height: 100%; display: block; }
</style></head><body><div class="wave">${waveSvg}</div></body></html>`;
};

// Full-bleed wave with the crest at the exact centre, so every crop (wide
// card, Slack's centre square, chat thumbnails) is built around it. A small
// quote sits in the dark water at the bottom left.
const CREST = [0.59, 0.555];       // curl centre in the SVG, as a fraction of its size
const page = (w, h) => {
  // Big enough that the crest dominates and the artwork reaches the left edge;
  // scaling further to also reach the right edge would crop the lip off the top.
  const size = Math.round(Math.max(h * 1.7, w / 2 / CREST[0] + 8));
  const left = Math.round(w / 2 - CREST[0] * size);
  const top = Math.round(h / 2 - CREST[1] * size);
  const pad = Math.max(44, Math.round(h * 0.07));   // stays inside the 40px safe border
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Literata; font-weight: 300; src: url(${light}); }
@font-face { font-family: Literata; font-weight: 300; font-style: italic; src: url(${lightItalic}); }
@font-face { font-family: Mono; src: url(${mono}); }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${w}px; height: ${h}px; overflow: hidden; background: #f6e5c4; }
.card { position: relative; width: 100%; height: 100%; }
.wave { position: absolute; top: ${top}px; width: ${size}px; height: ${size}px; }
.wave svg { width: 100%; height: 100%; display: block; }
/* The artwork stops short of the right edge. A mirrored copy continues the
   water past it with no seam (a mirror matches pixel for pixel at the join). */
.mirror { transform: scaleX(-1); }
.shade { position: absolute; inset: 0; background:
  linear-gradient(to top, #0b203cd9 0%, #0b203c66 22%, transparent 40%); }
.q { position: absolute; left: ${pad}px; bottom: ${pad}px; font: 300 ${Math.round(h * 0.04)}px/1.3 Literata; letter-spacing: -0.01em; color: #fff8e7; white-space: nowrap; }
.q em { font-style: italic; }
.k { position: absolute; right: ${pad}px; bottom: ${pad}px; font: 400 ${Math.round(h * 0.02)}px/1 Mono; letter-spacing: .12em; text-transform: uppercase; color: #fff8e780; }
</style></head><body><div class="card">
<div class="wave" style="left: ${left}px">${waveSvg}</div>
<div class="wave mirror" style="left: ${left + size}px">${waveSvg}</div>
<div class="shade"></div>
<p class="q">You can’t stop the wave.<br>But you can build the <em>ship</em>.</p>
<span class="k">sagarsarkale.com</span>
</div></body></html>`;
};

const browser = await chromium.launch();
for (const { out, w, h, square, size } of cards) {
  const tab = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await tab.setContent(square ? squarePage(w) : page(w, h), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const loaded = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').length);
  if (!square && loaded < 3) throw new Error(`only ${loaded} of 3 fonts loaded`);
  // Slack and others crop the wide card to its centre square. Shrink the quote
  // until it ends left of that square, so no clipped words show in the crop.
  if (!square) await tab.evaluate((limit) => {
    const q = document.querySelector('.q');
    for (let px = parseFloat(getComputedStyle(q).fontSize); q.getBoundingClientRect().right > limit; px -= 0.5) q.style.fontSize = `${px}px`;
  }, (w - h) / 2 - 12);
  const file = fileURLToPath(new URL(out, root));
  await mkdir(fileURLToPath(new URL('.', new URL(out, root))), { recursive: true });
  const shot = await tab.screenshot({ type: 'png' });
  if (out.endsWith('.jpg')) {
    const jpg = await sharp(shot).resize(size ?? w).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    if (jpg.length > 300 * 1024) throw new Error(`${out} is ${jpg.length} bytes, over 300KB`);
    await sharp(jpg).toFile(file);
  } else {
    await sharp(shot).toFile(file);
  }
  await tab.close();
  console.log('wrote', out);
}
await browser.close();
