---
title: "honest-wave-horizon-v6"
experiment: 001-homepage-visual-direction
created: "2026-11-21"
---

# Plan v6: The Wave, Honest + Horizon (approved direction)

## Decision

After astra's critique (finding 04's context: concept wrong, not execution) and
user mandate ("take a call, make it beautiful, bang on"), choosing astra's
directions 1 + 2 combined:

**Quiet editorial hero + one thin living horizon band.** leo.here restraint,
subject legible, one signature motion moment.

## What gets built

1. **DELETE the full-bleed field entirely**: halftone/plate shader, scrim,
   scroll Ken Burns, develop lens, `u_reveal` field dissolve, sāgara ghost,
   bottom gradient. (History preserved in git + findings.)
2. **Hero** on clean `--bg`: text left (copy/type unchanged), the wave plate
   RIGHT and BIGGER (~300–340px) — keep the framed-print treatment (paper mat,
   hairline ring, slight rotation, ocean shadow) that worked in v4. Click
   toggles wave/face (CoverReveal semantics unchanged). Card lands last in the
   entrance stagger.
3. **Horizon band** — thin full-width WebGL2 strip (~56px desktop, ~40px
   mobile) directly below the hero, REPLACING the R2 og-image mobile strip:
   a horizontal luminance slice of the wave drives an undulating dithered
   horizon line (Bayer + grain reuse, ink from wave blues, slow phase drift,
   pointer nudges amplitude, brief swell when it enters the viewport then
   settles). DPR cap 2, reduced-motion → static frame, WebGL failure → plain
   CSS baseline line. Footer "still the wave" toggle freezes it.
4. **Keep**: AmbientLine header chip, entrance keyframes, framed card,
   CoverReveal, footer colophon (reword to horizon), pause toggle,
   zero dependencies.

## Verification

Capture 2560/1920/1440/1024/390 × light/dark + click-reveal. 2560 first.
Judge: does the page read as *designed* at 2 m — whitespace, hierarchy,
one living line? Build + tsc pass before handoff.

## Success

Owner loads the page and goes quiet. The wave is unmistakably THE wave;
the page breathes; one thing moves.
