---
title: "media-spill-v1"
experiment: 001-homepage-visual-direction
created: "2026-11-21 12:20 UTC"
---

# Finding: Media-Spill v1 — Shipped

## Verdict

**Shipped to production** (commit `3f53fd9`, GitHub Actions run 44902716034 → GitHub Pages).
The v1 meets the acceptance criteria from `findings/01-visual-research.md` with one noted
weakness (curl legibility at narrow desktop widths).

## What Was Built

`src/components/HeroMediaSpill.tsx` — raw WebGL2 single-pass fragment shader, zero new
dependencies:

- Source texture `public/textures/wave-spill.jpg` (1200×630 JPEG of the wave artwork,
  downloaded from R2 og-image to bypass the missing CORS header — plan Step 1 decision).
- Ordered Bayer 4×4 dithering locked to the grid (temporally stable, no shimmer).
- 8-tap Sobel gradient → tangent-aligned contour strokes that preserve the curl silhouette.
- Glyph ramp: halftone dot → dash → plus → hatch → contour, selected by dithered ink level.
- Entrance: `u_progress` morphs halftone → glyph field over 1.5 s (cubic ease-out).
- Pointer lens: damped (exp smoothing ×7/s), radius ~120 px, refines stroke width and
  nudges dither threshold. Stationary cells — the pointer refines marks, never moves the grid.
- Card reveal (`HeroSpillReveal` wrapper in page.tsx, `onClickCapture`) drives `u_reveal`,
  shifting spill palette — `CoverReveal.tsx` untouched.
- Palette: CSS custom properties (`--fg`, `--surface`, `--accent`) parsed at init + on theme
  mutation. Light and dark are separately art-directed (light: deep ocean blue
  `(.025,.36,.59)`; dark: teal `(.30,.62,.74)`).
- Rest state: subpixel texture drift (`sin/cos × .001`), no loops or glitch.

Desktop: absolute-positioned canvas extending right from the card column
(`width: calc(208px + max(20px, (100vw - 728px)/2))`), UV mask keeps it out of the copy column.

Mobile: second instance (`mobile` prop → 19 px cells, DPR 1.5) in a 128 px band above the
existing og-image strip. Viewports < 380 px or reduced-motion get the poster only.

Fallbacks: SSR poster (radial-masked `wave-spill.jpg` at 45 % opacity) under the canvas until
first successful GPU frame; WebGL2 failure → poster stays; context loss → poster; reduced
motion → single deterministic frame at `u_progress=1`; IntersectionObserver pauses offscreen;
DPR capped 2 (desktop) / 1.5 (mobile).

## Art-Direction Iteration (why v1 looks the way it does)

First pass failed two review criteria: light-mode marks read gray (`mix(blue, u_fg, .12)`
dragged pigment toward near-black `--fg`), and the curl silhouette was a uniform scatter.
Fixes (light mode only):

- Blue base `(.08,.32,.43)` → `(.025,.36,.59)`; removed near-black fg mixing.
- Pigment capture `smoothstep(.18,.65,ink)` → `(.08,.52,ink)` (wave body mid-tones now ink).
- Sobel sensitivity `(.08,.65)` → `(.035,.32)`, contour weight `.85` → `.97`.

Result verified by screenshot: light mode reads as blue spill with diagonal dash bands
echoing the foam arc; dark mode (unchanged) is the strongest shot.

## Verification

- `npm run build` exit 0 (verified by subagent and independently by parent).
- Playwright captures at 1440/1024/768/390 × light/dark, WebGL-disabled fallback,
  reduced-motion stills, reveal-state palette shift — all inspected visually, twice.
- Post-deploy: `https://sagarsarkale.com/textures/wave-spill.jpg` → 200,
  homepage HTML references `wave-spill`, mobile strip intact.

## Known Issues / Weaknesses

- **Curl legibility**: at 1024 px the spill is suggestive rather than unmistakable — the
  wave continuation reads best in dark mode and at 1440 px. Candidate v2 lever: cell-size
  variance with distance from card, or a second denser contour band.
- Context loss keeps the poster instead of auto-restoring WebGL (acceptable: still shows art).
- Unrelated pre-existing `react-grab` CORS console errors (not from this work).
- Dev-server port: an old `npm run dev` occupies 4174; captures were taken there.

## Why This Avoids the Previous Rejection

The reverted prototypes (`0ff277a`, `915787c`) failed because effects were procedural noise
with no relationship to the image. v1 is texture-backed: every mark is a rendering of the
actual wave artwork; the card is the crisp anchor and the spill its abstraction.
