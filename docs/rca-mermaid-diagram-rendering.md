# RCA: Mermaid Diagrams Rendering as Tiny Thumbnails

Date: 2026-03-27
Status: Resolved
Time spent debugging: ~3+ hours (user) + investigation session

## Symptom

Mermaid diagrams on blog posts (e.g., `/blog/genai/what-is-mcp-part1#mcp-architecture`) rendered as ~50px tall unreadable thumbnails in the user's Chrome browser. The diagrams contained colored nodes and connections but were scaled down to roughly 5% of their intended size.

## Environment

- Next.js 16.2.1 with Turbopack
- mermaid.js 11.13.0 (client-side rendering)
- Chrome browser on macOS
- Site uses Literata (serif) for body text, Monaspace (monospace) for headings
- Mermaid `<pre>` blocks were inside a `.prose` container with `max-width: 65ch`

## Investigation Timeline

### Initial hypothesis: CSS constraint (wrong)

The `.prose` container had `max-width: 65ch` (~607px), and `pre.mermaid` had `max-width: 100%`. First theory was the diagram was simply squeezed by the prose column width.

**Fix attempted**: CSS breakout pattern — `width: 48rem; left: 50%; transform: translateX(-50%)` on `pre.mermaid` to escape the prose container.

**Result**: No change in user's browser. Playwright tests passed (diagram rendered correctly at 697x744px in headless Chromium).

### The misleading Playwright results

A critical debugging obstacle: **Playwright's headless Chromium consistently rendered the diagrams correctly**. Every test passed, every screenshot looked perfect. This led to multiple rounds of "it works for me" before we realized the bug was browser/font-specific.

The Playwright screenshots showed:
- viewBox: `"0 0 697 744"` (correct)
- SVG width: 697px, height: 744px

### Breakthrough: Debug logging in component

Added `console.log` output after mermaid rendering to capture actual SVG dimensions in the user's browser:

```js
console.log(`[MERMAID DEBUG]`, {
  svgViewBox: svg?.getAttribute('viewBox'),
  svgWidthAttr: svg?.getAttribute('width'),
  // ...
});
```

**User's Chrome output:**
```
svgViewBox: "-112.61328125 -51 16504.61328125 16443"
svgWidthAttr: "16504.61328125"
```

**Playwright output:**
```
svgViewBox: "0 0 697 744"
svgWidthAttr: "697"
```

The viewBox was **16,504px wide** in the user's browser vs **697px** in Playwright — a 24x difference. This immediately explained the tiny rendering: the SVG content was laid out across 16,504px but displayed in a ~700px container, scaling everything down to ~4%.

## Root Cause

### mermaid.js font-dependent text measurement

mermaid.js uses two internal functions for text measurement:

1. **`calculateTextDimensions`** (in `chunk-GEFDOKGD.mjs`): Creates a temporary `<svg>` element, appends it to `document.body`, renders text, and calls `getBBox()` to measure dimensions. These measurements are **memoized** — cached after first call.

2. **`setupViewPortForSVG`**: Calls `svg.node()?.getBBox()` on the final rendered SVG to compute the viewBox.

The critical problem: both functions inherit CSS from the page. The site's `<body>` element had:
- `font-family: 'Literata', serif` (a serif font with wider character widths than sans-serif)
- `line-height: 1.75` (taller than mermaid's expected 1.5)
- `letter-spacing: -0.011em`
- `font-size: 15px`

mermaid.js internally expects to measure text using `"trebuchet ms", verdana, arial, sans-serif` at 16px. When it measured text using the page's Literata serif font instead, **every text measurement was inflated**, causing:
- Node boxes to be much wider than expected
- The layout engine (dagre) to space nodes much further apart
- The final `getBBox()` to return an enormous bounding box
- The viewBox to be set to 16,504px instead of 697px

### Why `htmlLabels: false` partially helped

Setting `flowchart: { htmlLabels: false }` changed the label rendering from HTML `<foreignObject>` (which fully inherits page CSS) to SVG `<text>` (which is more isolated but still inherits `font-family`). This reduced the viewBox from 16,504px to 2,120px — better but still ~3x too large.

### Why the sandbox approach didn't work

We tried rendering in a detached `<div>` with reset font styles (`font-family: sans-serif; font-size: 16px`). This failed because mermaid's `calculateTextDimensions` appends its measurement SVG directly to `document.body`, **not** to the container passed to `mermaid.render()`. The sandbox was irrelevant to the measurement code path.

### Why overriding body styles didn't work

We tried temporarily overriding `document.body.style.fontFamily` during rendering. This should have worked in theory, but mermaid's text measurements are **memoized**. If any mermaid render had already run (e.g., during HMR/hot reload), the wrong measurements were cached and reused regardless of body style changes.

### Why Playwright worked but Chrome didn't

Playwright's bundled Chromium uses system fonts that are close to mermaid's expected `"trebuchet ms"` fallback chain. The page's custom `Literata` font was either:
1. Not loaded in Playwright's Chromium (falling back to a similar-width system font)
2. Loaded but with character widths close to what mermaid expected

The user's Chrome had Literata fully loaded and rendered, with significantly different character widths that cascaded through mermaid's layout algorithm.

## Solution

**Render mermaid diagrams at build time using `@mermaid-js/mermaid-cli` (`mmdc`).**

`mmdc` runs its own headless Chromium instance in a clean environment with no CSS inheritance from the page. It produces static SVGs with correct viewBox dimensions every time.

### Implementation

In `src/lib/content.ts`, the `{{<mermaid>}}` shortcode handler was changed from:

```typescript
// OLD: emit raw mermaid source for client-side rendering
return `<pre class="mermaid" data-mermaid-source="${encoded}">${src}</pre>`;
```

To:

```typescript
// NEW: render to SVG at build time via mmdc
const hash = crypto.createHash('md5').update(src).digest('hex').slice(0, 10);
const cacheDir = path.join(process.cwd(), '.mermaid-cache');
const svgPath = path.join(cacheDir, `${hash}.svg`);

if (!fs.existsSync(svgPath)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const tmpIn = path.join(cacheDir, `${hash}.mmd`);
  fs.writeFileSync(tmpIn, src);
  execSync(`npx mmdc -i ${tmpIn} -o ${svgPath} --quiet`, { timeout: 15000 });
  fs.unlinkSync(tmpIn);
}

let svg = fs.readFileSync(svgPath, 'utf-8');
svg = svg.replace(/<svg /, '<svg style="max-width:100%;height:auto" ');
return `<div class="mermaid-diagram">${svg}</div>`;
```

### What was removed

- `src/components/Mermaid.tsx` — client-side `MermaidInit` component (no longer imported)
- `rehypeProtectMermaid` / `rehypeRestoreMermaid` — rehype plugins that protected mermaid blocks from rehype-pretty-code
- `pre.mermaid` CSS rules — replaced with `.mermaid-diagram` rules

### Tradeoffs

| Aspect | Client-side (old) | Build-time (new) |
|--------|-------------------|------------------|
| Font issues | Broken by page CSS inheritance | Isolated Chromium, no inheritance |
| Dark mode | Supported via theme re-render | Static light theme only (needs config for dark) |
| Build time | None | ~2-3s per diagram (cached after first build) |
| JS bundle | mermaid.js loaded (~800KB) | No client JS needed |
| Diagram updates | Instant on page | Requires cache clear + rebuild |

## Lessons Learned

1. **Playwright is not a substitute for real browser testing when fonts are involved.** Headless Chromium has different font availability than the user's browser. For layout-sensitive components, test with the actual fonts loaded.

2. **mermaid.js has a well-known but unfixed bug with CSS inheritance.** The library measures text by appending elements to `document.body` and inheriting whatever CSS is there. There is no configuration option to fully isolate these measurements. Relevant issues: #6146, #6471, #4180, #2688.

3. **Memoized measurements amplify the problem.** Even if you fix the CSS before rendering, previously cached measurements persist. This makes the bug appear intermittent (works on cold load, breaks on HMR reload).

4. **Build-time rendering is the correct solution for static content.** Mermaid diagrams in blog posts don't change at runtime — they're authored in markdown and shouldn't require 800KB of client-side JavaScript to render.

5. **Debug logging in the component was the breakthrough.** Without the `[MERMAID DEBUG]` console output showing the actual viewBox dimensions in the user's browser, we would have continued chasing CSS-only fixes. Always add instrumentation when you can't reproduce a bug.

## Related GitHub Issues

- mermaid-js/mermaid#6146 — Race condition in calculateDimensionsWithPadding
- mermaid-js/mermaid#6471 — classDiagram renders with inflated viewBox
- mermaid-js/mermaid#4180 — getBBox() returns zero when element not in render tree (caching bug)
- mermaid-js/mermaid#2688 — Replace foreignObject with standard SVG (long-standing request)
- mermaid-js/mermaid#3990 — Default fontSize overwrites diagram-specific sizes
