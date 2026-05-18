# site/ — sagarsarkale.com

Next.js 16 static-export blog. Content lives in `content/`, rendered from `src/app/blog/[...slug]/page.tsx`.

## Structure

```
site/
  content/          # Markdown source of truth
    blog/
      genai/        # AI/ML posts
      seq/          # Sequence models
      web/          # Web dev
    random/         # Non-tech writing
    about.md        # /about
    work.md         # /work
  src/
    app/            # Next.js App Router pages
    components/     # React components
    lib/content.ts  # ALL content loading + shortcode parsing
    types/content.ts
  public/           # Static assets (favicons, fonts, logos)
  scripts/          # r2-upload.sh, r2-rewrite.mjs
  secrets/          # .cloudflare.env (gitignored)
```

## Content format

Markdown with YAML frontmatter:

```yaml
---
title: "Post Title"
date: "2026-04-24"
summary: "Short description for listings"
description: "Meta description"
toc: true
readTime: true
tags: ["DeepDive", "MCP", "Transformers"]
cover: "https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/slug/000-cover.png"
---
```

Tags: stick to existing ones (`Foundations`, `Transformers`, `MCP`, `DeepDive`, `LLM`, `GenAI`).

## Shortcodes (Hugo → custom parser)

`src/lib/content.ts::convertShortcodes()` handles these at build time:

- `{{<figure src="..." width="..." caption="...">}}`
- `{{<mermaid>}}...{{</mermaid>}}` — renders to SVG at build time via `mmdc`
- `{{<details title="...">}}...{{</details>}}`
- `{{<author>}}` — author byline
- `{{<github owner="..." repo="..." path="...">}}` — inline code from GitHub
- `{{<spotify type="track" id="...">}}`
- `{{<tweet id="...">}}`

## Images

**All blog images are hosted on Cloudflare R2.** Never reference `/public/` paths in markdown.

- Public URL base: `https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev`
- Upload: `bash scripts/r2-upload.sh` (reads credentials from `secrets/.cloudflare.env`)
- Cover images: name them `000-cover.{ext}` in the post's R2 folder
- `cover:` frontmatter field overrides auto-extracted first image

## Rendering pipeline

1. `lib/content.ts` reads `.md` files from `content/`
2. Parses frontmatter with `gray-matter`
3. Converts Hugo shortcodes to HTML
4. Renders mermaid diagrams to SVG (cached in `.mermaid-cache/`)
5. `next-mdx-remote` renders markdown → JSX in the page component
6. Rehype plugins: `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code` (Shiki)

## Styling

- Tailwind CSS v4
- Custom CSS variables in `src/app/globals.css`
- No component library

## Build

```bash
npm run build   # Static export to out/
npm run dev     # localhost:3000
```

Output is `out/` (configured in `next.config.ts`). Deployed via GitHub Actions → FTP to Hostinger.

## Where to look for issues

| Task | File |
|------|------|
| Content loading / parsing | `src/lib/content.ts` |
| Blog post rendering | `src/app/blog/[...slug]/page.tsx` |
| Blog listing | `src/app/blog/page.tsx`, `src/components/BlogList.tsx` |
| TOC sidebar | `src/app/blog/[...slug]/page.tsx` (extractToc) |
| Styling | `src/app/globals.css` |
| Mermaid rendering | `src/lib/content.ts` (convertShortcodes), `docs/rca-mermaid-diagram-rendering.md` |
| New post | Add `.md` to `content/blog/{subsection}/` |
