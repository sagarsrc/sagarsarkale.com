---
title: "honest-wave-horizon-v6"
experiment: 001-homepage-visual-direction
created: "2026-11-21 21:05 UTC"
---

# Finding: v6 — The Wave, Honest + Horizon

## Decision path

Owner rejected v5 ("absolutely hate it"). astra's critique (judge mode, 6
screenshots) concluded: **concept wrong, not execution** — a full-bleed
image-derived halftone is an agency gesture; the owner's references
(leo.here especially) are quiet; halftoning watercolor destroys the line work
that makes a wave a wave. Owner: "take a call and make it beautiful."

Call: astra's directions 1+2 — honest editorial hero + one thin living band.

## Shipped (commit `e33f2a1`, deploy success)

- `HeroMediaSpill.tsx` DELETED (field, scrim, lens, ghost, scroll choreography —
  git history preserves all of it).
- Hero on clean `--bg`: text left (unchanged), framed wave plate right at
  `w-72` (v4 mat/ring/−0.8°/ocean shadow retained), entrance stagger with card
  last. Click toggles wave/face, card-local only.
- `WaveHorizon.tsx`: full-width WebGL2 band below hero (~56px desktop, 40px
  mobile) — wave luminance slice as undulating dithered ink line; slow phase
  drift, pointer nudges amplitude, swell-on-enter-viewport then settles;
  Bayer + grain, wave-blue ink / cyan in dark; DPR cap 2; reduced-motion
  static frame; WebGL failure degrades to a CSS baseline rule; footer
  "still the wave" freezes it (`dataset.motion`).
- Mobile: R2 og-image strip DELETED; framed plate (`w-52`, tilted) mounted
  after socials — the wave is the identity and must exist on mobile.
- Footer colophon reworded to "homepage horizon printed with a hand-rolled
  webgl dither". AmbientLine untouched.

## Verification

2560/1920/1440/1024/390 × light/dark + reveal. Parent close-review: 2560
passes the "designed at 2m" bar — whitespace, hierarchy, unmistakable wave,
one quiet living line. Mobile needed one parent fix (plate was desktop-only).

## The meta-lesson

Five iterations to learn: the owner's taste = restraint with ONE crafted
moment. Every "louder" version was rejected; the quiet one shipped clean.
When the owner's references are quiet sites, match their volume.
