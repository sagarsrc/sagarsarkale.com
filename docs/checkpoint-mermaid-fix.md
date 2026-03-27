# Checkpoint: Mermaid diagram rendering fix

## Date: 2026-03-27

## State before fix
- Mermaid.tsx: client-side rendering with mermaid.run(), sets SVG width from viewBox
- CSS: `pre.mermaid { max-width: 100% }` — constrained by `.prose { max-width: 65ch }`
- content.ts: Hugo shortcode `{{<mermaid>}}` converted to `<pre class="mermaid" data-mermaid-source="base64...">`
- MDXRenderer.tsx: rehype plugins protect mermaid blocks from pretty-code processing

## Files involved
- `src/app/globals.css` (lines 371-388) — mermaid CSS
- `src/components/Mermaid.tsx` — client-side rendering
- `src/components/MDXRenderer.tsx` — rehype pipeline
- `src/lib/content.ts` (lines 100-108) — shortcode to HTML conversion

## Key constraint
The prose container max-width (65ch) is intentional for readability of text. The fix must let mermaid break out without affecting text layout.
