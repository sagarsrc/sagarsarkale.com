---
title: "media-spill-prototype"
experiment: 001-homepage-visual-direction
created: "2026-11-21"
---

# Plan: Homepage Media-Spill Prototype

## Goal

One hero-only WebGL effect: the wave artwork from the existing `CoverReveal` card extends
beyond the card as a dithered/glyph field, morphing between representations. The card stays
crisp and untouched. Reviewed as a local recording/contact sheet before any production push.

## Constraints (from findings/01-visual-research.md)

- `src/components/CoverReveal.tsx` stays unchanged — it is the crisp anchor.
- Effect is derived from the wave media, never procedural noise alone.
- Ordered Bayer dithering (temporal stability); no error diffusion, no random glyph swaps.
- One effect, hero only. Article pages untouched.
- Mobile: lower-density spill or poster fallback, designed separately.
- DPR cap, offscreen pause, reduced-motion still frame, WebGL-failure poster.

## Step 1 — Texture access (decide before code)

Options:

1. **Local optimized UI texture (chosen default).** Download `wave-hero.png` from R2 into
   `public/textures/wave-hero.jpg` (~1600px wide, quality ~80). Same-origin, zero CORS risk,
   smaller than the original. Does not touch markdown image conventions (R2 stays canonical
   for blog images). Precedent: mobile hero strip and CoverReveal already hotlink R2, but a
   shader `texImage2` requires CORS-clean image; same-origin local file removes the class
   of failure entirely.
2. R2 CORS config (`secrets/.cloudflare.env` + rclone/curl on the bucket) — deferred; adds
   infra surface for a UI-only asset.

Decision: go local for the prototype. Revisit CORS only if the texture must stay remote.

## Step 2 — Component architecture

New file `src/components/HeroMediaSpill.tsx` ("use client"):

- Minimal raw-WebGL2 renderer (no three.js for the prototype — one fullscreen quad, one
  fragment shader, ~zero deps). Upgrading to three.js r186 with the installed skills
  (`threejs-shaders`, `threejs-postprocessing`) happens only if multipass (Sobel +
  temporal memory as separate passes) becomes necessary in production.
- Fragment shader, single pass v1:
  - Sample wave texture, convert to luminance.
  - Cell grid (~10–14px cells desktop) → glyph/hatch mark selected by Bayer-dithered
    luminance ramp; Sobel gradient from 4 taps picks directional edge glyphs.
  - Progress uniform `u_progress`: 0 = coarse halftone dots, 1 = directional ASCII
    contours. Entrance tween 1.2–1.8 s (eased) driven in the render loop, not per frame
    state in React.
  - Pointer uniform `u_pointer` with damped interpolation; localized lens resolves
    glyphs to finer marks within radius.
  - Card reveal (`CoverReveal` `onClick`) → optional callback prop raises
    `u_palette`/contour-source shift without touching CoverReveal internals.
    Note: page.tsx owns both components, so wire state in page.tsx, not inside
    CoverReveal.
- Masking: shader renders only in a region extending right of / behind the card
  (uniform-driven rect in UV space, feathered edge); the DOM card sits above on z-index.
  Fade-out toward the copy column.
- Mobile (<768 px): render nothing (existing `og-image.png` strip stays); later
  iteration adds low-density spill or poster.

## Step 3 — Fallbacks & a11y

- WebGL context creation failure → static `<img>` poster (same local texture,
  pre-dithered offline or plain wave) swapped in.
- `prefers-reduced-motion` → render one deterministic still frame at entrance progress,
  no loop.
- DPR cap at 2; `IntersectionObserver` pauses when hero offscreen; cancel RAF on unmount.
- Copy-side contrast: spill mask must never enter the text column (verify at 1440/1024).

## Step 4 — Verification (all local, no push)

- `npm run dev`; deterministic capture via Playwright (available? if not,
  `npx playwright screenshot`) at 1440×900, 1024×768, 768×1024, 390×844,
  light + dark, reduced-motion, and with WebGL disabled (`--disable-webgl`).
- Assemble contact sheet, present for approval. No commit to production hero
  without sign-off (per ckpt 01 decision).

## Step 5 — Definition of done for prototype v1

- [ ] Local texture exists in `public/textures/`.
- [ ] `HeroMediaSpill.tsx` renders behind card, entrance morphs halftone→contours.
- [ ] Pointer lens responds with damping; no shimmer at rest.
- [ ] Card reveal click shifts spill state (palette/contour).
- [ ] Fallbacks work (WebGL off, reduced motion).
- [ ] Contact sheet produced and reviewed; findings written to
      `findings/02-media-spill-v1.md`.

## Open questions

- Light/dark palette: derive spill colors from CSS variables passed as uniforms, or
  hard-pair two art-directed palettes? (Start: pass `--fg`/`--surface` hexes via
  CSS custom property read at init; dark mode is a real palette, not inversion.)
- Should the spill animate on scroll-out (parallax dissolve) or simply pause?
  (Start: pause only. Motion tied to meaning, not scroll decoration.)
