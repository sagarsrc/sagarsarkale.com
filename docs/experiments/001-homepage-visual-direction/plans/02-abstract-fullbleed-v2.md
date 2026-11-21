---
title: "abstract-fullbleed-v2"
experiment: 001-homepage-visual-direction
created: "2026-11-21"
---

# Plan v2: Abstract Full-Bleed Hero Field

## Trigger

User feedback on v1 (side spill): "sucks hard, both devices. use something abstract that
covers 3/4th of screen."

v1's restraint read as timid. v2 goes the opposite direction: the hero canvas is the page's
first impression — large, abstract, wave-derived, dominant.

## Direction

- Full-bleed canvas behind the ENTIRE hero section (both columns), ~75% of viewport height
  (clamp so it never swallows the sections below; e.g. `min(75vh, 780px)` desktop,
  full-width band on mobile sitting behind bio + CTA, ending above the strip).
- Abstract at LARGE scale: the wave texture drives big tonal masses (the deep blue curl
  body, the foam burst, the pale sky) rendered as oversized dither/halftone/glyph cells —
  readable as a poster from 2 m away, rewarding up close. Not fine marks — big forms.
- Think gig-poster / risograph: 2–3 tonal bands from the wave's palette, coarse ordered
  dither at large cell size (desktop ~22–30px, mobile ~14–18px), occasional glyph ramps
  only where the texture has detail (foam).
- The wave should still be the source (design principle 1) but abstraction is the goal:
  a viewer feels "ocean wave" before they identify the card's artwork as its source.

## Non-negotiables (carried from v1)

- Copy readability: WCAG contrast over the field at all times. Solution: a tonal scrim —
  a `var(--surface)`-derived gradient/solid veil behind the text column (left ~55%), strong
  enough that text is unaffected; the field breathes on the right and edges. This is
  art direction, not a regression to "calm copy side": the field still shows through
  at the scrim edges and below/above the text block.
- Existing reveal card stays crisp on top (z-index), unchanged internals.
- Same fallbacks: poster frame, reduced-motion still, WebGL failure, DPR caps,
  IntersectionObserver pause, context-loss → poster.
- Both themes art-directed; light = ocean blues on paper, dark = teal/cyan glow on ink.
- Entrance: brief (~1.2s), then settles; pointer response stays subtle (large fields
  shouldn't nauseate — slow parallax offset max ~8px).

## Mobile

- Same full-width field behind bio + CTA, ~60–70vh total hero coverage including strip;
  scrim mandatory (text sits directly on the field otherwise).
- Reduced cell count (bigger cells), DPR 1.5 cap.

## Verification

- Same Playwright matrix (1440/1024/768/390 × light/dark + fallbacks).
- Readability check: sample screenshot — bio text must pass visual contrast at a glance.
- Ship only after screenshot review shows BOLD, not timid.

## Success

User looks at the homepage and the hero is unmistakably the site's visual identity —
abstract ocean-in-dither occupying the screen, with the card as its crisp anchor.
