---
title: "halftone-redo-v5"
experiment: 001-homepage-visual-direction
created: "2026-11-21 19:45 UTC"
---

# Finding: v5 Halftone Redo — Live

## Trigger

User screenshot at ~2530×1890 retina: "so fuckall its looking, no dither
effect or anything. reimagine this shit, skip card for now."

## Diagnosis

The v3/v4 5-plate posterization only reads at ≤1440px. At 2530px: mip-4 blur +
5 flat plates → giant empty blue blobs; the only texture was 28px polka-dot
halftone; the hard-edged text panel became a giant white slab; socials with
paper halo vanished on pale foam. Root process failure: the capture matrix
never included the user's actual screen width.

## The Redo (shipped, commit `7286b9e`)

- **Posterization deleted.** Continuous-tone clustered-dot halftone: 8×8 Bayer
  screen selects cells (`step(bayer, density)`), dot radius grows with ink
  density (`r = on × (0.14 + 0.32·density)`). Tone lives in the dots — the
  navy→foam gradients survive inside masses. mip LOD 2 for tone, LOD 0 for
  develop/reveal.
- **Cell scale tied to viewport**: `clamp(vw/190, 7, 14)` CSS px (7.6 @1440 →
  13.5 @2560; mobile 15). Source texture regenerated at 2400px
  (`sips` from /tmp/og-image.png), 570 KB JPEG.
- **Slab deleted.** Text veil is now a horizontal gradient scrim:
  solid `--bg` → 98% @46% → 91% @62% → 38% @76% → transparent @90%
  (desktop); mobile solid to 90%. 91% stop tuned after a 2560 close-read —
  at 86% faint dots ghosted through the longest bio lines.
- **Socials**: frosted `backdrop-blur` chip — readable on any field tone.
- Kept: entrance develop, scroll drift/fade + Ken Burns, develop lens,
  `u_reveal` dissolve, static grain, sāgara ghost (desktop), bottom fade,
  strip, pause toggle, all fallbacks, DPR caps. Card untouched per user.

## Verification

Full matrix **including 2560×1300 and 1920×1080**, both themes, plus
scrolled/lens/reveal at 1440. Bio close-crop read at 2560 — clean. Build exit 0,
deploy success, live.

## Lesson (process)

Art-direct at the user's actual viewport. The next capture script version must
take width list as arg and default to including ≥2560. See
`/tmp/media-spill/capture.cjs` lineage.
