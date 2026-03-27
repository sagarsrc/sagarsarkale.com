# Issue: Mermaid diagrams render as tiny unreadable thumbnails

## Problem
Complex mermaid diagrams (especially `graph TB` with subgraphs) render at a tiny size, appearing as ~50px thumbnails instead of full-width readable diagrams.

## Root Cause
The `.prose` class sets `max-width: 65ch` (~650px). The mermaid SVG inherits `max-width: 100%`, constraining it to the prose column. For complex diagrams with many nodes/subgraphs, mermaid's layout engine computes a viewBox width of 800-1200px+, but the container forces it to scale down proportionally. The height scales with it, resulting in a tiny diagram.

## Affected pages
- `/blog/genai/what-is-mcp-part1` (MCP architecture diagram)
- Any blog post using `{{<mermaid>}}` with complex graphs

## Steps to reproduce
1. Visit http://localhost:3000/blog/genai/what-is-mcp-part1#mcp-architecture
2. Observe the diagram renders as a ~50px tall thumbnail

## Fix approach
Make `pre.mermaid` break out of the prose container using negative margins or a wider max-width override. This is the same pattern GitHub uses — mermaid diagrams in GitHub README files are allowed to fill the full available width, not constrained to the text column.
