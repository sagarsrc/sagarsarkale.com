# Critique: Blog Listing Page

Date: 2026-03-27

## Anti-Patterns Verdict

**Pass.** No AI slop. The card-based listing with thumbnail + title + summary is a standard editorial pattern. No gradient text, no glassmorphism, no hero metrics. The monochrome palette with teal accent is restrained. The rounded cards with subtle borders feel hand-authored, not template-generated.

One minor tell: the cards are **identical in weight** — every post looks exactly the same. Real editorial layouts vary rhythm (featured post larger, older posts more compact). But this is a minor observation, not a failure.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | — |
| 2 | Match System / Real World | 3 | Familiar blog listing pattern |
| 3 | User Control and Freedom | 2 | No filtering, no search, no way to browse by topic |
| 4 | Consistency and Standards | 3 | Cards are consistent, hover states work |
| 5 | Error Prevention | 3 | — |
| 6 | Recognition Rather Than Recall | 2 | No topic/tag filtering — 16 posts in a flat chronological dump |
| 7 | Flexibility and Efficiency | 1 | No search, no tag filter, no series grouping — power users must scroll |
| 8 | Aesthetic and Minimalist Design | 3 | Clean but monotonous — every card identical weight |
| 9 | Error Recovery | 3 | — |
| 10 | Help and Documentation | 3 | — |
| **Total** | | **26/40** | **Acceptable** |

## Overall Impression

The blog page is clean and functional — it lists posts in reverse chronological order with thumbnails, titles, summaries, and metadata. But it's also **flat and undifferentiated**. With 16 posts spanning different topics (MCP, transformers, LLMs, LSTMs, vector DBs), there's no way to browse by topic. The reader has to scroll through everything to find what interests them. The first post's cover image is missing/blank, which looks broken. The visual rhythm is monotonous — every card is the same height and weight.

## What's Working

1. **Card hover state** — Border goes from gray to accent teal, with a subtle background tint. Feels responsive and polished without being overdone.
2. **Thumbnail + text layout** — Good use of the 120px thumbnail on desktop, full-width on mobile. The image gives visual variety without dominating.
3. **Reading time + date metadata** — Useful secondary info at a glance without cluttering the card.

## Priority Issues

### [P1] No way to browse by topic
16 posts spanning 5+ distinct topics (MCP, Transformers, VectorDB, LoRA, LLaVA, Foundations) are listed in a single chronological stream. A reader interested in "transformers" has to visually scan all 16 cards.

**Why it matters**: The homepage already groups writing by topic (Foundations, Transformers, MCP, Deep Dives). The blog page throws away that structure. Readers arriving from the homepage expect to find the same organization.

**Fix**: Add tag/topic filters at the top (clickable pills), or group posts by series/topic with section headers.

**Suggested command**: `/arrange`

### [P1] First post has a blank/missing cover image
"What the MCP? (Part 3)" shows a blank gray rectangle where its cover should be. This is the first thing readers see.

**Why it matters**: A missing image in the #1 position looks broken, not intentional.

**Fix**: Either add a cover image for this post, or hide the thumbnail area when no cover exists (the component already checks `post.coverImage` but the image might be returning a broken URL).

**Suggested command**: `/harden`

### [P2] Monotonous visual rhythm
Every card is identical: same height, same thumbnail size, same text density. No variation between a 2-minute "Hello super fast blogging!" post and a 29-minute "Inputs to Byte Latent Transformer" deep dive.

**Why it matters**: Visual sameness makes scanning harder. The eye has no landmarks. A featured/latest post or a series callout would break the monotony and guide attention.

**Fix**: Make the first 1-2 posts slightly larger (bigger thumbnail, bolder title). Or vary card height based on content type (series vs standalone).

**Suggested command**: `/arrange`

### [P2] "back" link is confusing
The `← back` breadcrumb in the top-right corner of a top-level page is misleading. `/blog` is a primary section, not a drilled-down view. "Back" to where?

**Why it matters**: On a blog listing, "back" implies you came from somewhere specific. But `/blog` is a destination. The breadcrumb creates navigational confusion.

**Fix**: Remove the `← back` from the blog listing page (keep it on individual blog posts where it makes sense).

**Suggested command**: `/clarify`

### [P3] Mobile cards are too tall
On mobile (390px), each card has a full-width 128px-tall cover image + text below, making each card ~250px tall. Only ~3 posts visible per screen. With 16 posts, that's a lot of scrolling.

**Why it matters**: Mobile readers need to scroll through ~4000px of cards. The large cover images don't add enough value to justify the vertical space.

**Fix**: On mobile, use a more compact layout — smaller cover image on the left (like desktop) or remove covers and use a simple text list.

**Suggested command**: `/adapt`

## Persona Red Flags

**Alex (Repeat Reader / Power User)**: Visits the blog regularly to check for new posts in the transformer series. No way to filter by topic or series. Has to scroll past MCP posts every time. No RSS indicator. No "new since last visit" signal.

**Jordan (First-Timer from LinkedIn)**: Clicks "deep dive" from the homepage misal section, lands on `/blog` — sees 16 unfiltered posts with no clear entry point. The topic they care about (Marathi LLM) isn't even visible without scrolling to the bottom. Will bounce.

## Minor Observations

- No post count shown (e.g., "16 posts") — minor but useful orientation
- Tags are not visible on the listing page, only on individual posts
- The `gap-3` between cards is tight — could use `gap-4` for slightly more breathing room
- Footer text "powered by caffeine and occasional epiphany" is charming — good brand voice
- Dark mode rendering is solid — good contrast, covers look fine

## Recommended Actions

1. `/arrange` — Add tag/topic filters and break monotonous visual rhythm
2. `/harden` — Fix missing cover image on post #3, handle gracefully
3. `/clarify` — Remove confusing "← back" breadcrumb from blog listing
4. `/adapt` — Make mobile cards more compact (smaller covers or text-only)
5. `/polish` — Final pass after fixes
