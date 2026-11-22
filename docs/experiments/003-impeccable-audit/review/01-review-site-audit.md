---
title: "Impeccable Site Audit"
index: 3
type: review
date: 2026-05-15
---

# Review: Impeccable Site Audit

**Verdict: PASS WITH FIXES — Audit Health Score 14/20 (Good band). Ship-blocking contrast issue on `--fg-muted`; everything else is refinement.**

**Scope:** `/` (home/landing), `/blog`, `/blog/genai/making-misal`, `/work`. Audited against dev server `http://localhost:4174` with `impeccable detect` + Playwright at 1440×900 and 390×844, plus source review of `globals.css`, `landing.css`, `Header`, `ThemeProvider`, `Motion`, `ProjectVisual`, `layout.tsx`.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | `--fg-muted` (#a1a1aa on #fafafa) = 2.5:1, fails WCAG AA — used site-wide for dates/meta |
| 2 | Performance | 3 | Lean static export, rAF-throttled scroll, deferred GA; Monaspace shipped as `.woff` not `.woff2` |
| 3 | Theming | 3 | Solid token system + no-flash dark mode; `landing.css` uses ~10 hard-coded hex values outside tokens |
| 4 | Responsive Design | 3 | Zero horizontal overflow at 390px/1440px; some sub-24px inline targets (mostly exempt) |
| 5 | Implementation Integrity | 3 | Coherent editorial system; detector false positives identified (kickers, cream palette are intentional identity) |
| **Total** | | **14/20** | **Good — address weak dimensions** |

## Implementation Integrity Verdict

**PASS.** The implementation expresses a coherent, product-specific system: an editorial/print identity (Literata serif, Monaspace labels, halftone wave artwork, numbered section kickers, indigo-on-ivory palette). Nothing is interchangeable with a generic template. Detector findings were verified in context; false positives called out below (kicker labels above headings, cream background, and the italic serif display headline are deliberate identity choices, not drift).

## Executive Summary

- **Audit Health Score: 14/20** (Good)
- **Issues: 0 P0 · 2 P1 · 5 P2 · 3 P3**
- Top issues:
  1. **[P1]** `--fg-muted` fails WCAG AA contrast (2.5:1) on every page — dates, meta, "back to top", work history
  2. **[P1]** Functional text at 10.5–10.9px in landing project visuals ("Works in", "Models", "Trained on")
  3. **[P2]** Global `0.01ms` reduced-motion kill destroys useful state feedback

## Detailed Findings

### [P1] `--fg-muted` contrast fails WCAG AA

- **Location**: `src/app/globals.css:79` (`--fg-muted: #a1a1aa`); consumed in `src/components/BlogList.tsx:55,91`, `src/app/(site)/work/page.tsx:10,147,163,170,178,192`, `BackToTop.tsx`, `.post-tags`, `.heading-anchor`
- **Category**: Accessibility
- **Impact**: Dates, reading times, separators, and the "back to top" control render at 2.5:1 — unreadable for low-vision users in sunlight/weak displays. Detector confirmed on `/blog` (2×), `/work` (10×), post page (1×).
- **WCAG**: SC 1.4.3 (4.5:1 for normal text)
- **Recommendation**: Darken light-theme `--fg-muted` to ≥#71717a (4.6:1 on #fafafa). Dark-theme `#85858f` on `#121215` is ~5.4:1 and passes. If a lighter ghost tone is wanted decoratively, reserve it for non-text ornament only.
- **Suggested command**: `/impeccable colorize`

### [P1] Undersized functional text in project visuals & facts

- **Location**: `src/app/(site)/landing.css` (`.project-facts dt`, `.pv-status`, `.pv-label` ≈ 10.5–10.9px computed)
- **Category**: Accessibility / Responsive
- **Impact**: "Works in", "So far", "Models", "Trained on", "team memory loaded" render below the 11px legibility floor — these carry real product facts, not decoration.
- **Recommendation**: Raise these to ≥12px (`0.75rem`); the cards have room.
- **Suggested command**: `/impeccable typeset`

### [P2] Global `0.01ms !important` reduced-motion kill

- **Location**: `src/app/globals.css:105-108`
- **Category**: Accessibility
- **Impact**: Under `prefers-reduced-motion`, *all* transitions die — including opacity/color feedback on theme toggle, hover states, and the copy-button confirmation. State changes become instant and imperceptible. (`CountUp` already correctly opts out via matchMedia; the CSS kill is the blunt instrument.)
- **Recommendation**: Replace the blanket kill with targeted rules: disable transform/scroll-driven animation, keep ≤200ms opacity/color transitions.
- **Suggested command**: `/impeccable animate`

### [P2] Hard-coded colors in `landing.css` outside the token system

- **Location**: e.g. `#c9d6e6` (line 339), `#e3e9f1` (358), `#8a5b3b`/`#ead2a8` (415-416), navy close-section values
- **Category**: Theming
- **Impact**: The landing's dark navy sections are theme-invariant by design, but the values are scattered literals — a future palette tweak means hunting hex codes. `#8a5b3b` on `#ead2a8` (tokenizer chips) is also 3.9:1, marginal for its 15px size.
- **Recommendation**: Promote recurring literals to `--landing-*` custom properties at the top of `landing.css`; nudge chip text darker for 4.5:1.
- **Suggested command**: `/impeccable colorize`

### [P2] Duplicate title suffix: "Blog — Sagar Sarkale | Sagar Sarkale"

- **Location**: `src/app/(site)/blog/page.tsx` metadata + root `title.template` in `layout.tsx:14`
- **Category**: UX copy / SEO
- **Impact**: Browser tabs and link previews show the doubled name.
- **Recommendation**: Blog/work page titles should be `"Blog"`, `"Work"` and let the template append `| Sagar Sarkale`.
- **Suggested command**: `/impeccable clarify`

### [P2] Reveal elements can be caught mid-fade on fast scroll

- **Location**: `src/components/Motion.tsx` (`Reveal`), observed in `shot-home-390.png` — a post row sat at ~10% opacity after rapid scroll
- **Category**: Responsive / Motion
- **Impact**: On quick flick-scrolls, list rows visibly lag behind the viewport. Likely timing-only, but worth verifying the transition duration and `rootMargin: -8%` don't strand elements on short viewports.
- **Recommendation**: Verify with real-device scroll; consider shortening delay ladder (`i * 60ms`) on mobile or capping stagger.
- **Suggested command**: `/impeccable animate`
- **STATUS: FIXED** — root cause was worse than reveal lag: the Misal tokenizer chips had inline `--n: i*3+8` combined with a 1300ms base transition-delay, so the row sat invisible for ~2.4s on mobile. Fixed in `ProjectVisual.tsx` (`--n: i`) and `landing.css` (base delay 1300→700ms, plus mobile-capped stagger in the `max-width: 700px` block). Verified via Playwright at 390px: all 15 chips reach opacity ≥0.9 within ~1s of entering view.

### [P2] Monaspace served as `.woff`, not `.woff2`

- **Location**: `src/app/globals.css:37-49` (`public/fonts/Monaspace/*.woff`)
- **Category**: Performance
- **Impact**: ~30-40% larger font payloads for two faces vs woff2.
- **Recommendation**: Convert with the available `cwebp`/`magick` toolchain equivalents (e.g. `woff2_compress`) and update the `@font-face` srcs.
- **Suggested command**: `/impeccable optimize`

### [P3] `<h1>` inside `<figcaption>` in hero

- **Location**: `src/app/(site)/page.tsx:120`
- **Category**: Accessibility (semantics)
- **Impact**: The page's only h1 ("Sagar Sarkale") lives in a figure caption — valid HTML, but unusual for AT landmark/heading navigation.
- **Recommendation**: Move h1 out of `<figure>`, keep visual styling.
- **Suggested command**: `/impeccable harden`

### [P3] Em-dash density in prose

- **Location**: `/blog/genai/making-misal` (11), `/work` (15)
- **Category**: UX copy
- **Impact**: Detector advisory only; the voice is consistent and intentional. No action unless tone review is wanted.
- **Suggested command**: `/impeccable clarify`

### [P3] Straggler single-word last lines

- **Location**: landing paragraphs ("habit.", "open-sourced.", "languages.")
- **Category**: Polish
- **Impact**: Minor typographic rags on desktop measures.
- **Recommendation**: `text-wrap: pretty` on `.project-desc` / `.proof-item p`.
- **Suggested command**: `/impeccable polish`

## Detector False Positives (verified, no action)

- **Kicker / eyebrow labels** `(01)–(06)` above h2s — deliberate editorial numbering system, consistent site-wide.
- **Cream/beige background** (`#f7f4eb`) — the core ivory-paper identity, not a saturated-pattern accident.
- **Italic serif display headline** "Bring me the *hard* part." — intentional print voice.
- **1.3:1 ghost text (#dadad6)** — hero masthead captured mid-entrance-animation by the detector (`hero-rise` starts at opacity 0); resolves to full contrast at rest.
- **"Nested cards"** — project visual figure inside reveal wrapper; both are structural, not card-in-card chrome.

## Patterns & Systemic Issues

1. **Muted-token overuse**: `--fg-muted` is applied to 15+ spots including interactive elements ("back to top") — one token fix resolves the majority of a11y findings.
2. **Landing miniaturization**: the landing's mono micro-labels consistently run 10–11px; the floor should be 12px for anything functional.
3. **Two color systems**: token-driven site chrome vs. literal-driven landing sections — converging them would make the landing themeable.

## Positive Findings

- No-flash theme: inline pre-paint script in `layout.tsx` + `suppressHydrationWarning` — textbook dark mode.
- Keyboard nav verified: skip-link first tab stop, solid visible focus outlines on all stops, Escape closes mobile menu, body scroll-lock while open.
- All images have alt text (0 violations across 8 captures); decorative canvas is `aria-hidden`.
- `CountUp` respects `prefers-reduced-motion`; scroll handlers are passive + rAF-throttled; `Reveal` content is visible without JS.
- Zero horizontal overflow at 390px and 1440px on all four pages; safe-area insets handled on mobile header.
- Mobile theme toggle is 44×44px; menu button is 44×44px.
- Self-hosted fonts with `font-display: swap`; GA deferred to `afterInteractive`.

## Recommended Actions

1. **[P1] `/impeccable colorize`**: Fix `--fg-muted` to ≥4.5:1 in light theme; promote landing.css literals to tokens; fix tokenizer-chip contrast.
2. **[P1] `/impeccable typeset`**: Raise landing functional micro-text (10.5–10.9px) to ≥12px.
3. **[P2] `/impeccable animate`**: Replace the global `0.01ms` kill with targeted reduced-motion rules; verify reveal stagger on fast mobile scrolls.
4. **[P2] `/impeccable clarify`**: Fix duplicated page-title suffixes.
5. **[P2] `/impeccable optimize`**: Ship Monaspace as woff2.
6. **[P3] `/impeccable polish`**: Final pass — h1 semantics, `text-wrap: pretty` stragglers.

> Re-run `/impeccable audit` after fixes to see the score improve. The `--fg-muted` fix alone should lift Accessibility from 2 → 3+.

## Re-run Note (same day, local skill install)

Re-ran `impeccable detect` from the project-local copy (`.agents/skills/impeccable/`). The detector shows **run-to-run sampling variance**: below-fold elements are inconsistently scanned, so the `--fg-muted` and undersized-text warnings did not reappear in runs 2–3. Findings stand on manual computation instead:

- `#a1a1aa` on `#fafafa` = **2.46:1** (needs 4.5) — confirmed FAIL, light theme only
- `#85858f` on `#121215` = 5.12:1 — dark theme passes
- `#8a5b3b` on `#ead2a8` = 3.92:1 — confirmed marginal FAIL
- `#52525b` on `#fafafa` = 7.41:1 — `--fg-secondary` passes comfortably

Lesson: treat detector output as a sample, not an exhaustive sweep; verify flagged tokens by hand.

## Evidence

- Detector output: `/tmp/detect-{home,blog,post,work}.json` (run 1), `/tmp/d2-*.json`, `/tmp/d3-work.json` (re-runs)
- Screenshots: `/tmp/shot-{home,blog,post,work}-{390,1440}.png`
- Method: `impeccable detect` (local copy at `.agents/skills/impeccable/`), Playwright Chromium, emulated viewports only — touch gestures and real-device behavior untested.
