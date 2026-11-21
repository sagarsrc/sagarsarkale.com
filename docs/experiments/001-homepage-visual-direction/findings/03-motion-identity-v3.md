---
title: "motion-identity-v3"
experiment: 001-homepage-visual-direction
created: "2026-11-21 18:45 UTC"
---

# Finding: Motion Identity v3 — Live

## Verdict

Shipped (commit `e1625ac`, deploy success). The hero went from static poster to
choreographed motion while keeping the wave print as identity.

## What Changed (vs v2)

**Choreography**
- Staged entrance: headline → bio → CTA rise with 0.15 s stagger; the framed
  card lands last (`.hero-rise-4`, 0.65 s). CSS keyframes `hero-rise` in
  globals.css; safe under reduced-motion via the existing global 0.01ms rule.
- Scroll: `--hero-scroll` var (wrapper, RAF-throttled listener) drives content
  drift (−28 px) + fade that completes by ~50% scroll-through
  (`opacity: calc(1 - min(var(--hero-scroll)*1.6, 1))` — first pass at 0.9×/0.7
  left a translucent ghost over the field; fixed). Shader `u_scroll` Ken Burns:
  field zooms 1.0→1.12 and drifts as the hero leaves.
- Ink-develop entrance: first frame is near-blank paper with a ghost of the sea;
  `u_progress` develops the plates over 1.2 s.
- Static print grain (per-pixel hash, no time term → no shimmer), ±0.022.

**Interaction**
- Develop lens: pointer dissolves the posterization back to the photograph
  (150 px soft circle, `u_lens` uniform, damped 10/s).
- Card reveal (`u_reveal`) now develops the WHOLE sheet toward the photograph
  (lens radius grows to 0.55×min-dimension + global 0.16 photo mix) — "behind
  the wave is the person", reversibly.

**Card (user: "card not looking great… wave is very close to me… face hidden,
click to reveal")**
- Framed print: `--surface` paper mat, rounded corners, hairline ring, −0.8°
  rotation, layered deep-ocean shadow. Face stays hidden behind the wave until
  click (existing CoverReveal toggle, semantics unchanged).
- Social icons de-pilled: ghosted on the field with a paper text-shadow halo.

**leo.here-inspired ambient touches (tuned, not copied)**
- Header ambient line: `pune · 18:22` (IST, `AmbientLine.tsx`, 15 s tick,
  desktop nav only, no network).
- Footer colophon: "homepage wave printed with a hand-rolled webgl dither" +
  "still the wave" toggle (sets `document.documentElement.dataset.motion`,
  persisted in localStorage `motion-preference`; shader frame loop freezes
  time/pointer/lens when set, keeps rendering the last frame).
- `sāgara` ghost word (Sanskrit: ocean) in the field — desktop only; on mobile
  it cluttered the panel (fixed).

## Infra notes

- gpt-6-astra subagent resumed for the card redesign (its 3rd resume); usage
  limit reset after ~1 h cooldown. Parent did the integration pass.
- Dev server on 4174 needed `.next` purge after a transient Footer class typo —
  Turbopack cached the bad PostCSS output; `npm run build` was unaffected.
  If dev serves a stale CSS error while disk is clean: `rm -rf .next`, restart.

## Verification

Full Playwright matrix (1440/1024/768/390 × light/dark, fallback, reduced)
+ scrolled state + pointer-lens state + click-reveal state — all inspected.
Build exit 0, tsc clean, live-verified after deploy.
