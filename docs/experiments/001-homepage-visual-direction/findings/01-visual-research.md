---
title: "visual-research"
experiment: 001-homepage-visual-direction
created: "2026-11-21 11:46 UTC"
---

# Homepage Visual Research

## Brief

Preserve the current homepage hero composition, including the existing wave/profile reveal card and its interaction. Add an exceptional ASCII, dither, or halftone visual behind the hero without reducing readability or turning the rest of the editorial site into an effects demo.

The rejected prototypes used static ASCII text, CSS patterns, scanlines, and an unrelated procedural glyph field. They failed because the effect had no relationship to the existing image, lacked a strong visual subject, and looked like decoration layered onto the page.

## Main Finding

Strong creative-development sites do not treat dithering or ASCII as a generic background pattern. The effect is usually a rendering language applied to meaningful media: a photograph, video, 3D object, typography, or a clearly authored scene. Motion then transitions between representations of that same subject.

For this homepage, the strongest concept is a **media spill**:

- Keep the current reveal card unchanged and above the effect.
- Use the wave artwork as the source and visual subject.
- Extend the wave outside the card through a shader-rendered field.
- Transform only the spilled region through Bayer dithering, halftone marks, ASCII glyphs, Sobel edge glyphs, and temporal morphing.
- Keep the source card crisp and natural; it anchors the abstraction.
- Synchronize the background state with the existing card reveal without changing the card's behavior.

This creates one composed artwork rather than an image card plus an unrelated animated background.

## Reference Review

### Stas Bondar '25

- Reference: https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/
- Live site: https://stabondar.com/
- Recognition: GSAP Site of the Week and Site of the Month.
- Stack: Astro, GSAP, Three.js, Barba.js and Matter.js.
- Relevant technique: an 8x8 Bayer matrix shader pixelates real image/video textures, converts them to luminance, applies ordered dithering, and interpolates back to the original media through a progress uniform.
- Why it works: the shader is tied to actual project media and coordinated with hover, scroll and page transitions. It is not a standalone decorative texture.

### Morphing ASCII Shader

- Repository: https://github.com/niccolofanton/morphing-ascii-shader
- Demo: https://m-ascii.niccolofanton.dev/
- License: MIT.
- Relevant techniques:
  - Glyph atlas selected by luminance.
  - Sobel contour detection with directional edge characters.
  - Per-cell temporal memory.
  - SDF shape morphing between glyphs.
  - Ink-bleed postprocessing and controlled film grain.
- Why it works: characters transition continuously instead of snapping or flickering. Edge glyphs retain the source silhouette.

### Halftone Dithering FX

- Repository: https://github.com/playbox-dev/halftone-dithering-fx
- Demo: https://playbox-dev.github.io/halftone-dithering-fx/webgl/
- Relevant techniques:
  - Two GPU passes: source downsampling followed by anti-aliased mark rendering.
  - Stable Bayer 4x4 and 8x8 modes for moving media.
  - Grain mode for a less mechanical editorial texture.
  - Radial, sweep and interference motion fields.
  - Automatic offscreen pausing.
- Important lesson: error-diffusion algorithms are poor for moving media because small frame changes cause crawling patterns. Ordered dithering is temporally stable.

### ASCII Particles

- Repository: https://github.com/rimnaarith/ascii-particles
- Stack: Three.js, WebGPU and TSL.
- Relevant techniques: a real particle subject rendered as characters, procedural noise, controlled bloom and pointer exploration.
- Applicability: useful for understanding volumetric ASCII motion, but a full particle scene would likely overpower this restrained editorial homepage.

### Dither Hero

- Repository: https://github.com/yashkotha/dither-hero
- Technique: a procedural starburst rendered through selectable dither, halftone, LED, lattice and ASCII modes.
- Verdict: useful as a shader tuner and technical reference, but rejected as the primary direction. A procedural starburst remains generic because it is not connected to Sagar, the wave card or the site's content.

## Design Principles Extracted

1. **Start with a subject.** The source wave is the subject; dithering is only its rendering language.
2. **Preserve one crisp anchor.** The original card remains untouched and readable while abstraction expands behind it.
3. **Morph between representations.** Use progress-controlled transitions among natural media, Bayer dither, halftone and glyph output.
4. **Retain contours.** Sobel-derived directional glyphs prevent the spill from becoming visual noise.
5. **Use temporal memory.** Smooth per-cell transitions are essential; random character replacement reads as flicker.
6. **Tie interaction to meaning.** Pointer interaction should pull, resolve or disperse the wave rather than merely moving generic noise.
7. **Protect editorial content.** The copy side remains calm with a solid tonal fade and verified contrast.
8. **One effect only.** The effect belongs to the hero. Article pages and later homepage sections remain clean.
9. **Design mobile separately.** Mobile should receive a shorter, lower-density spill or a rendered poster/video fallback rather than a desktop shader squeezed behind text.
10. **Performance is part of the visual quality.** Cap device pixel ratio, pause offscreen, avoid per-frame readback, provide reduced-motion and WebGL failure fallbacks.

## Recommended Composition

### Desktop

- Existing copy remains left aligned and unchanged.
- Existing reveal card remains in its current right column.
- The shader stage extends beyond the card toward the right viewport edge and slightly behind the card.
- A low-density leading edge may approach the copy but never cross the readable text measure.
- The card acts as a portal: crisp wave inside, abstracted continuation outside.

### Interaction

- Entrance: the spilled wave develops from coarse halftone marks into directional ASCII contours over roughly 1.2 to 1.8 seconds.
- Pointer: a localized lens resolves glyphs toward finer halftone or pushes the wave flow; movement uses damped interpolation.
- Card reveal: clicking the existing card can change the spill's palette, contour source or morph state while the card's existing fade remains intact.
- Rest state: the effect settles into very slow movement or holds. No constant scanline, glitch loop or random flicker.

### Mobile

- Keep the existing mobile wave strip.
- Place a controlled glyph spill immediately above or behind the strip, away from the biography and CTA.
- Use fewer cells and a lower pixel ratio, or ship a short pre-rendered loop with a still reduced-motion poster.

## Technical Direction

Preferred stack:

1. Three.js or a minimal WebGL renderer for a texture-backed fullscreen plane.
2. A source texture served with valid CORS headers or from a local optimized UI asset.
3. Ordered Bayer dithering for stable motion.
4. Glyph atlas postprocessing with luminance lookup.
5. Sobel edge pass for directional contour characters.
6. Optional temporal-memory render target for gradual glyph state changes.
7. GSAP only for high-level transition progress and synchronization with the reveal card; shader time and pointer interpolation remain in the render loop.

Avoid:

- DOM grids of characters.
- CSS-only dithering.
- Random glyph replacement.
- Scanlines and generic glitch effects.
- Page-long WebGL canvases.
- Filtering or replacing the original card image.
- Continuous animation with no settled state.

## Skills Evaluation

### Recommended

#### `cloudai-x/threejs-skills@threejs-shaders`

- 23.5K installs.
- Source repository: 4,327 GitHub stars, MIT licensed.
- Targets current Three.js r186 and documents current GLSL/TSL behavior.
- Strongest foundation for texture sampling, uniforms, color-space handling, shader materials and WebGPU migration.

Install:

```bash
npx skills add cloudai-x/threejs-skills@threejs-shaders
```

#### `cloudai-x/threejs-skills@threejs-postprocessing`

- 21.1K installs.
- Same well-maintained and verified repository.
- Appropriate for multipass dither, Sobel edge detection, temporal buffers and final compositing.

Install:

```bash
npx skills add cloudai-x/threejs-skills@threejs-postprocessing
```

#### `iart-ai/web-animation-skills@ascii-animation`

- 3.9K installs.
- Source repository: 104 GitHub stars, MIT licensed.
- Covers brightness ramps, character-cell aspect correction, image/video/3D-to-ASCII and deterministic visual verification.

Install:

```bash
npx skills add iart-ai/web-animation-skills@ascii-animation
```

#### `iart-ai/webgl-animation-skills@shader-glsl`

- 2.6K installs.
- Source repository: 65 GitHub stars, MIT licensed.
- Useful for domain warping, SDFs, texture transitions, pointer uniforms and deterministic shader screenshots.

Install:

```bash
npx skills add iart-ai/webgl-animation-skills@shader-glsl
```

### Optional

#### `cloudai-x/threejs-skills@threejs-performance`

- 8.4K installs.
- Useful before shipping to verify fill rate, pixel ratio, GPU memory and offscreen cleanup.

### Not Recommended as Primary Guidance

- `emmraan/agent-skills@creative-webgl-shaders`: only 14 installs and one GitHub star.
- `adamperlis/awwwards-motion`: broad motion guidance but only 158 installs and six GitHub stars.
- `devmartinese/awwwards-animations-skill`: useful reference library, but only 15 GitHub stars and much of its advice is broad animation-library coverage rather than shader art direction.
- Generic "premium frontend" skills: insufficiently focused on texture-backed GPU effects and likely to reproduce decorative visual patterns.

## Acceptance Criteria for the Next Prototype

- The existing `CoverReveal` component and card layout remain unchanged.
- The shader output is visibly derived from the wave artwork.
- The effect has a recognizable composition at 1440, 1024, 768 and 390 pixels.
- Copy remains readable at WCAG contrast levels throughout the animation.
- Glyph transitions are temporally stable with no random shimmer.
- The animation has a clear entrance, pointer response and settled state.
- Dark mode is art-directed rather than merely color-inverted.
- Reduced-motion mode presents a deliberate still frame.
- WebGL failure produces a meaningful poster rather than an empty canvas.
- The prototype is reviewed as a recording/contact sheet before any production deployment.

## Current Repository State

- Branch: `master` aligned with `origin/master` before this document was created.
- Production: original homepage hero restored; rejected effects are not deployed.
- Rejected local shader prototype: removed.
- Active experiment: `001-homepage-visual-direction`.
- Active finding: `findings/01-visual-research.md`.
