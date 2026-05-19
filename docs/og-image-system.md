# OG Image System

## Overview

Social preview images (OpenGraph / Twitter Cards) for every page. When you share a link on Twitter, LinkedIn, Slack, etc., a card appears with title, description, and an image.

## How It Works

### Two-tier system

| Tier | Source | When it applies |
|------|--------|-----------------|
| 1. Explicit cover | `cover:` frontmatter or inline image in post | Posts that have their own image |
| 2. Generated OG | Satori + resvg build-time script | Posts without a cover image |

### Blog posts (`src/app/(site)/blog/[...slug]/page.tsx`)

`generateMetadata` picks the image source in this priority:

1. `post.coverImage` from frontmatter (`cover:` field)
2. First inline `<img>` extracted from post content
3. Fallback: generated OG at `/og/blog/{subsection}/{slug}.png`

### Agents posts (`src/app/(agents)/agents/[slug]/page.tsx`)

Currently always points to `/og/agents/{slug}.png` with no fallback. If the file does not exist, social crawlers get a 404.

### Root layout (`src/app/layout.tsx`)

Default OG image: `/og-image.png` (static file in `public/`)

## Build-Time Generation

Script: `scripts/generate-og-images.mjs`

Runs as `prebuild` hook before `next build`.

### Currently generates for

- `blog/genai/*`
- `blog/seq/*`
- `blog/web/*`

**Does NOT generate for:** `agents/*`, `random/*`

### Why blog-only originally

Historical reason. Blog was the first section with many posts needing covers. Agents and random sections were added later. The script's `SECTIONS` array was never extended.

### Generated image spec

- Format: PNG
- Size: 1200 x 630 (1.91:1, optimal for social cards)
- Style: dark background, title + description, accent top bar, domain footer
- Font: Inter SemiBold (committed to `public/fonts/Inter/`)

### Adding a new section

1. Add entry to `SECTIONS` array in `scripts/generate-og-images.mjs`
2. Ensure the page's `generateMetadata` points to `/og/{section}/{slug}.png`
3. Run `npm run prebuild` to generate images
4. Commit generated PNGs to `public/og/`

## Testing

Online tools:
- [heymeta.com](https://www.heymeta.com/) - quick meta tag check
- [opengraph.xyz](https://www.opengraph.xyz/) - multi-platform preview
- [socialsharepreview.com](https://socialsharepreview.com/) - clean UI
- Twitter: paste link in Tweet Composer
- LinkedIn: [post-inspector](https://www.linkedin.com/post-inspector/)

Local verification:
```bash
curl -s https://sagarsarkale.com/blog/genai/making-misal | grep "og:image"
```

## Files

| File | Purpose |
|------|---------|
| `scripts/generate-og-images.mjs` | Build-time generator |
| `public/fonts/Inter/Inter-SemiBold.ttf` | Font for generated images |
| `public/og/blog/*/*.png` | Generated blog images |
| `public/og/agents/*.png` | Generated agents images (manual or scripted) |
| `public/og-image.png` | Default site-wide OG image |
