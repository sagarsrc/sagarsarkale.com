// Run from the repo root with: node scripts/generate-wave-og.mjs
// Renders the homepage social cards from the vector wave (public/indigo-curl.svg)
// and the site's own fonts, in headless Chromium, at exact card sizes:
//   public/social/home.png                   1200x630  Open Graph / X / LinkedIn / Slack
//   design/og/github-social-preview.png  1280x640  GitHub repository social preview
// Text stays inside a 40pt safe border so no platform crop cuts it.
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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
  { out: 'public/social/home.png', w: 1200, h: 630 },
  { out: 'design/og/github-social-preview.png', w: 1280, h: 640 },
];

const page = (w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Literata; font-weight: 300; src: url(${light}); }
@font-face { font-family: Literata; font-weight: 300; font-style: italic; src: url(${lightItalic}); }
@font-face { font-family: Mono; src: url(${mono}); }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${w}px; height: ${h}px; overflow: hidden; background: #f6e5c4; }
.card { position: relative; width: 100%; height: 100%; }
.wave { position: absolute; top: ${-h * 0.18}px; right: ${-w * 0.07}px; width: ${h * 1.42}px; height: ${h * 1.42}px; }
.wave svg { width: 100%; height: 100%; display: block; }
/* Feather the artwork's left edge so it melts into the shade instead of cutting off. */
.wave { -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%); mask-image: linear-gradient(90deg, transparent 0%, #000 22%); }
.shade { position: absolute; inset: 0;
  background: linear-gradient(90deg, #0b203cf2 0%, #0b203cd9 30%, #0b203c55 52%, transparent 66%),
              linear-gradient(to top, #0b203ccc, transparent 45%); }
.copy { position: absolute; left: ${Math.round(w * 0.07)}px; bottom: ${Math.round(h * 0.13)}px; color: #fff8e7; max-width: ${Math.round(w * 0.56)}px; }
h1 { font: 300 ${Math.round(h * 0.155)}px/1 Literata; letter-spacing: -0.045em; }
h1 em { font-style: italic; }
p { margin-top: ${Math.round(h * 0.04)}px; font: 300 ${Math.round(h * 0.046)}px/1.32 Literata; letter-spacing: -0.015em; color: #fff8e7e0; }
.foot { position: absolute; left: ${Math.round(w * 0.07)}px; top: ${Math.round(h * 0.11)}px; font: 400 ${Math.round(h * 0.026)}px/1 Mono; letter-spacing: .12em; text-transform: uppercase; color: #fff8e7b3; }
</style></head><body><div class="card">
<div class="wave">${waveSvg}</div>
<div class="shade"></div>
<div class="foot">sagarsarkale.com</div>
<div class="copy">
  <h1>Sagar <em>Sarkale</em></h1>
  <p>Every disruption begins as a problem<br>someone refused to leave unsolved.</p>
</div>
</div></body></html>`;

const browser = await chromium.launch();
for (const { out, w, h } of cards) {
  const tab = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await tab.setContent(page(w, h), { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const loaded = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').length);
  if (loaded < 3) throw new Error(`only ${loaded} of 3 fonts loaded`);
  const file = fileURLToPath(new URL(out, root));
  await mkdir(fileURLToPath(new URL('.', new URL(out, root))), { recursive: true });
  await tab.screenshot({ path: file, type: 'png' });
  await tab.close();
  console.log('wrote', out);
}
await browser.close();
