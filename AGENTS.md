<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Image Assets

All blog images are hosted on Cloudflare R2, not in `public/`.

## R2 Bucket

- **Bucket**: `sagarsarkale-assets`
- **Public URL**: `https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev`
- **Credentials**: `secrets/.cloudflare.env`

## Upload pattern

Images are organized by post: `{post-slug}/000-cover.png`, `{post-slug}/001-name.png`, etc.

```bash
source secrets/.cloudflare.env
AWS_ACCESS_KEY_ID=$CF_ACCESS_KEY_ID \
AWS_SECRET_ACCESS_KEY=$CF_SECRET_ACCESS_KEY \
aws s3 cp local-file.png s3://$R2_BUCKET/{post-slug}/filename.png \
  --endpoint-url $CF_ENDPOINT --content-type image/png --region auto
```

Reference in markdown: `https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/{post-slug}/filename.png`

## Cover images

- Auto-extracted from first `<img>` in post content (skips GIFs)
- Can be overridden via frontmatter `cover:` field
- Cover images should be named `000-cover.png` in the R2 folder

## Local backups

Save images to `public/images/` as a local backup, but **never commit them** — they are gitignored. All production references must point to R2 URLs.

# Blog Tags

Tags are consolidated to 4 categories matching the homepage writing cards:

- **Foundations** — RNNs, LSTMs, attention fundamentals
- **Transformers** — position encoding, KV caching, BLT, multimodal
- **MCP** — model context protocol series
- **DeepDive** — long-form breakdowns (vectorDB, LoRA, etc.)

Do not create new tags without checking if an existing one fits. Keep the total under 6.

# Mermaid Diagrams

Mermaid diagrams are rendered at **build time** via `@mermaid-js/mermaid-cli` (`mmdc`). Do NOT use client-side mermaid rendering — it has a font measurement bug that produces 16,000px viewBoxes in some browsers. See `docs/rca-mermaid-diagram-rendering.md` for details.

SVGs are cached in `.mermaid-cache/` (gitignored). Delete this directory to force re-render.
