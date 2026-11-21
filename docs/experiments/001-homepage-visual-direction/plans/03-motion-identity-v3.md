---
title: "motion-identity-v3"
experiment: 001-homepage-visual-direction
created: "2026-11-21"
---

# Plan v3: Motion as Identity ("good → great")

## Trigger

User on v2 (live): "good but not great." MotionSites inspiration distilled:
their signature is not static beauty — it is choreographed motion
(staggered entrances, scroll parallax, reveal lenses).

## Changes (all hero-scoped, zero new deps)

1. **Staged entrance** — headline → bio → CTA rise+fade with 0.15 s delays
   (CSS keyframes, `hero-rise` utility in globals.css; reduced-motion safe
   via existing global rule).
2. **Scroll choreography** — `--hero-scroll` CSS var (0→1 over first ~70% of
   hero scroll-through, damped in the existing RAF loop): hero content drifts
   up ~36 px and fades; field counter-zooms (~1.0→1.12) and drifts — Ken
   Burns depth. Bottom of field fades to `--bg` (kills the hard poster edge).
3. **Develop lens** — pointing at the field locally dissolves the posterization
   (mix ~0.85) back to the real wave photograph, lod 0, soft 150 px circle.
   The abstraction is the print; the cursor is the developer tray.
   Second uniform `u_lens` (CSS px, bottom-left origin); leaves with pointer.
4. **Print grain** — static per-pixel hash (no time term → no shimmer),
   ±0.02 amplitude: risograph paper texture.
5. **Ink-develop entrance for the field** — first frame is near-blank paper
   with a ghost of the sea; `u_progress` develops the plates (~1.5 s).
6. **Ghost word** — giant italic serif "sāgara" (Sanskrit: ocean; the name is
   the artwork's subject) set into the field at ~7–10 % opacity, `mix-blend`,
   behind the text panel. Identity easter egg.
7. Headline serif-italic accent on the name's second word.

## Verification

Full Playwright matrix + two new shots: scrolled-to-40% state, pointer-over-field
state. Build passes → push → verify live. Reduced-motion: everything static.

## Rejected

Word-by-word scroll reveal (kept for a future pull-quote), liquid-glass chips
(SaaS register), video heroes (identity is the wave).
