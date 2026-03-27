# Research: How mermaid diagrams are rendered in GitHub and other platforms

## GitHub's approach
GitHub renders mermaid in markdown files server-side. Key behaviors:
- Mermaid blocks in fenced code blocks (```mermaid) are detected and rendered as inline SVGs
- The SVG is given full container width — it is NOT constrained to the text column width
- GitHub's `.markdown-body` has `max-width: 1012px` but mermaid SVGs are allowed to use the full width
- The SVG uses `viewBox` for scaling and maintains aspect ratio
- On narrow screens, horizontal scrolling is enabled

## How mermaid.js handles sizing
- mermaid.js computes the diagram layout and sets a `viewBox` on the SVG with the natural dimensions
- By default, `useMaxWidth: true` means the SVG sets `width: 100%` and scales to fit container
- The SVG height scales proportionally with width — if the container is too narrow, height shrinks proportionally
- For `graph TB` (top-to-bottom) diagrams with subgraphs, the natural width can be 800-1200px+
- When forced into a 650px container, the diagram scales down to ~54% which makes text unreadable

## Common solutions

### 1. Break out of prose container (recommended)
Use negative margins or `width: 100vw` to let mermaid diagrams span beyond the prose column:
```css
pre.mermaid {
  max-width: none;
  width: calc(100% + 8rem);  /* or use vw-based */
  margin-left: -4rem;
  margin-right: -4rem;
}
```

### 2. Override max-width on mermaid specifically
```css
pre.mermaid {
  max-width: none;
}
```
This only works if the parent container doesn't clip overflow.

### 3. Use a wrapper div that breaks out
Wrap mermaid in a div that has `max-width: none` and let it expand.

### 4. Horizontal scroll (fallback)
```css
pre.mermaid {
  overflow-x: auto;
  min-width: min-content;
}
```

## Recommended approach for this project
Since the blog layout has a content area wider than 65ch (the prose constraint), the simplest fix is:
1. Set `pre.mermaid { max-width: none; }` to escape the prose constraint
2. The parent container (likely the blog post wrapper) will naturally bound it
3. Keep `overflow-x: auto` as a safety net for very wide diagrams

The key insight: the prose `max-width: 65ch` is great for text readability but wrong for diagrams. Diagrams need the full available width to be readable.
