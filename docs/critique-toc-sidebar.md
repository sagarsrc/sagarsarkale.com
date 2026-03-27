# Critique: TOC Sidebar (Right Side of Blog Page)

Date: 2026-03-27

## Anti-Patterns Verdict
**Pass.** No AI slop. The TOC is minimal, mono-font, list-numbered — it reads as hand-crafted editorial design. No gradient accents, no glassmorphism, no card styling.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Active section highlight exists but is too subtle — single color change on 12px mono text |
| 2 | Match System / Real World | 3 | Numbered list matches book TOC convention |
| 3 | User Control and Freedom | 2 | No way to collapse/dismiss on desktop; it's always there |
| 4 | Consistency and Standards | 2 | Fixed position breaks at 1024-1280px — overlaps content |
| 5 | Error Prevention | 3 | — |
| 6 | Recognition Rather Than Recall | 3 | TOC is always visible, good |
| 7 | Flexibility and Efficiency | 2 | No scroll-to-top from TOC, no progress indication |
| 8 | Aesthetic and Minimalist Design | 1 | **24 items dumped at once** — overwhelming wall of text |
| 9 | Error Recovery | 3 | — |
| 10 | Help and Documentation | 3 | — |
| **Total** | | **24/40** | **Acceptable but needs work** |

## Overall Impression

The TOC does its job functionally — it lists headings and links to them. But it has two critical problems: **it shows all 24 items at once** (cognitive overload), and **it overlaps article content at 1024-1280px viewports** (the most common laptop widths). The active state highlight is too weak to serve as a "you are here" signal.

## What's Working

1. **Mono font + numbered list** — Feels intentionally editorial. The uppercase "CONTENTS" label and tracked spacing give it a print-magazine quality that matches the site's personality.
2. **Mobile collapsible** — Correctly hides behind a `<details>` toggle on small screens instead of trying to squeeze in a sidebar.
3. **Scroll-spy active tracking** — It does track the current section via IntersectionObserver. The mechanism is right even if the visual feedback is too subtle.

## Priority Issues

### [P0] Content overlap at 1024-1280px viewports
The TOC is `fixed right-8` with `w-64` (256px). At 1024px, it overlaps article text by 140px. At 1280px, it still overlaps by 12px. These are the most common laptop viewport widths.

**Measured overlap data:**
- 1024px viewport: 140px overlap
- 1280px viewport: 12px overlap
- 1440px viewport: 68px gap (first width that works)
- 1920px viewport: 308px gap

**Why it matters**: Text is literally unreadable under the TOC. This is a broken layout, not a cosmetic issue.

**Fix**: Position TOC relative to the content container, not the viewport. Or increase the `lg:` breakpoint to ~1500px so it only shows when there's actually room.

### [P1] 24 items = cognitive overload
All 24 headings are shown at once in a flat list. This is a 21-minute-read article — the TOC is almost as intimidating as the article itself. Items 8, 5, and 7 wrap to 2-3 lines each, creating a dense wall.

**Why it matters**: A TOC should orient the reader, not overwhelm them. 24 items exceeds the 4-7 item cognitive comfort zone by 4x.

**Fix**: Show only h1-level entries by default (~8 items). Expand h2 sub-items under each h1 on hover or when that section is active. Or group into collapsible sections.

### [P2] Active state highlight is too weak
The only difference between the active item and inactive items is a color change from `--fg-muted` (gray) to `--accent` (teal/cyan). At 12px mono font, on a list of 24 items, this is nearly invisible.

**Why it matters**: The whole point of a scroll-spy TOC is "you are here." If the signal is lost in the noise, the TOC becomes a static list — just decoration.

**Fix**: Bold the active item, add a left border indicator, or slightly increase its font size. Consider dimming non-active items further to create contrast.

### [P3] No reading progress signal
For a 21-minute article, the reader has no sense of how far through they are. The TOC could easily double as a progress indicator.

**Why it matters**: Long-form readers frequently want to know "how much is left?" — especially on technical content. The TOC is perfectly positioned to answer this.

**Fix**: Add a subtle vertical progress bar alongside the TOC, or style completed sections differently from upcoming ones (e.g., slightly less opacity for sections already passed).

## Persona Red Flags

**Alex (Power User / Repeat Visitor)**: TOC overlaps content at his 1280px laptop. Can't dismiss it. No keyboard navigation to jump between sections. Would find the 24-item list acceptable but wants collapsible sub-sections.

**Jordan (First-Time Reader)**: Sees 24 numbered items and thinks "this is going to take forever." No progress indication. The TOC creates anxiety rather than orientation. On mobile, the collapsed `<details>` is good but uses no summary text beyond "Contents" — no indication of article length or structure.

## Minor Observations

- The TOC doesn't scroll its own overflow gracefully — at shorter viewport heights, the bottom items are cut off with no visible scrollbar hint
- `list-decimal pl-8` creates a left indent that wastes horizontal space in an already narrow 256px sidebar
- Dark mode TOC text contrast is adequate but could be slightly stronger for the muted items
- The `right-8` (32px) gap from viewport edge feels arbitrary — at 1920px there's a 308px gap between content and TOC, which looks disconnected

## Recommended Actions

1. `/adapt` — Fix the P0 overlap at 1024-1280px viewports
2. `/distill` — Reduce 24-item flat list to collapsible h1-only (~8 items)
3. `/polish` — Strengthen active state highlight (bold, left border, dimmed inactive)
4. `/delight` — Add reading progress signal alongside TOC
