---
title: "final-strip-v7"
experiment: 001-homepage-visual-direction
created: "2026-11-21 21:55 UTC"
---

# Finding: v7 — The Final Strip

## What happened

Within an hour of v6 shipping, the owner rejected every decorative element
in sequence: the `pune · ist` header line ("get rid of this"), the footer
colophon + "still the wave" toggle ("wtf is this"), and finally the horizon
band itself — a retina-zoom screenshot showed the dithered line reading as a
dirt smear with a dotted ghost, not craft ("this is shit").

## Final state (live, commits `54926cb` + `451ca74`)

The homepage is now naked editorial: framed wave plate (click → face),
typography, whitespace, entrance stagger. Nothing else:

- `WaveHorizon.tsx` DELETED (band + shader + canvas)
- Footer: colophon line + motion toggle removed — server component again
- `AmbientLine.tsx` removed earlier
- `public/textures/wave-spill.jpg` removed from the build (unreferenced, 570 KB)
- Kept: `hero-rise` entrance keyframes, framed-card CSS, CoverReveal,
  serif-italic headline, all base fallbacks

## The lesson that ended the experiment

Seven iterations distilled one rule about this owner: **the wave artwork and
the words are the design; everything added on top gets rejected.** Loud field
rejected, quiet line rejected, metadata garnish rejected. The surviving page
is direction 1 ("The Wave, Honest") in its purest form — which astra's critique
ranked first and cheapest all along.
