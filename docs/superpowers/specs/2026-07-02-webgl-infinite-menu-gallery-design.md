# WebGL InfiniteMenu Gallery — Design

**Date:** 2026-07-02
**Branch:** codex/gallery-editorial-redesign
**Status:** Approved, implementing

## Goal

Replace the editorial GSAP gallery page with a full-viewport WebGL2 InfiniteMenu
(ReactBits pattern): an interactive icosphere of circular image tiles. When drag
stops and one tile settles to front-center, it smoothly morphs from a circle into
a rounded rectangle (Apple VisionOS feel), scales up ~1.15x, gains a soft shadow,
and its title + description fade in. On drag start it morphs back to a circle.

Data comes from the existing CMS gallery endpoint (`getCmsGalleryItems`). No
backend changes. No hardcoded gallery data.

## Stack decision

Raw WebGL2 + `gl-matrix`, isolated from the existing three.js/react-three-fiber
stack (used by BaliFlipBook). Faithful port of the ReactBits InfiniteMenu approach.

## Files

```
components/gallery/infinite-menu/
  InfiniteMenu.tsx        client orchestration: canvas, atlas, drag/inertia,
                          active detection, morph tween, cleanup
  geometry.ts             icosphere generation + per-instance slot transforms;
                          slotToItemIndex mapping (gl-matrix, pure)
  shaders.ts              GLSL: instanced billboard vertex; fragment SDF mask
                          mix(circle, roundedRect, uMorph) + atlas UV + shadow
  useInfiniteMenuItems.ts memoized CMS -> InfiniteMenuItem[] normalizer
components/gallery/
  InfiniteMenuFallbackGrid.tsx   no-WebGL2 / reduced-motion responsive grid
  InfiniteMenuLightbox.tsx       portal lightbox on tap (image or video_url)
  GalleryPage.tsx                rewritten host
hooks/
  usePrefersReducedMotion.ts     centralized matchMedia hook
```

`package.json`: add `gl-matrix`.

## Data flow

`getCmsGalleryItems()` (unchanged) -> `useInfiniteMenuItems(items)`:

- Keep `type === "image" | "video"`; drop `text` (no visual tile).
- Video: `textureSrc = video_poster`, retain `videoUrl = video_url` for lightbox.
- Dedupe missing/empty src.
- Fallback to the existing local media subset when CMS empty (reuse, not duplicate).
- Empty final list -> polished empty state, no canvas mount.

`InfiniteMenuItem`:
```ts
{ id, textureSrc, title, description, alt, isVideo, videoUrl }
```

## Morph mechanic

- One offscreen-canvas texture atlas built from all image srcs. Rebuilt ONLY when
  the set of source URLs changes (memoized by joined-src key), never per render.
- Fragment shader mask = `mix(circleSDF(uv), roundedRectSDF(uv, r), uMorph)` with
  radius + aspect also interpolated so mid-morph never looks boxy.
- `uMorph` animates 0->1 (~450ms easeOutCubic) for the active instance when
  movement stops; 1->0 on drag start. Scale (1.12–1.18x) + shadow derived from the
  same `uMorph` — single source of truth.
- Active instance = tile closest to the camera-forward vector (ReactBits hook point).

## Locked constraints (user)

1. **Tap vs drag:** lightbox opens only on a genuine tap — pointer movement below a
   ~6px threshold between down and up. Drag release never auto-opens the lightbox.
2. **Video:** never autoplay in atlas/canvas. `video_poster` is the texture;
   `video_url` plays only inside the lightbox.
3. **SEO copy:** do not delete meaningful copy blindly. Existing hero/story keyword
   copy is preserved as sr-only content + surfaced in the active-item overlay.
4. **Atlas rebuild:** memoize `normalizedItems`; rebuild the GL texture only when the
   source URL set changes.
5. **Cycling:** if CMS items < icosphere slots, cycling is allowed, but the active
   overlay always resolves through `slotToItemIndex` to the REAL item — never a
   confusing duplicate slot label.
6. **Reduced motion / no WebGL2:** fallback grid with same data; morph + inertia
   disabled but gallery + lightbox stay usable.

## Accessibility / SEO

- `sr-only <ul>` lists every item (title, alt, description) alongside the canvas.
- Active-item overlay is real HTML (fades with morph), not canvas-drawn text.
- Lightbox: true modal — `useScrollLock`, Escape, focus trap, focus restore.

## Page structure

Full-viewport InfiniteMenu section with a minimal magazine header folded into the
overlay (kicker + heading, top-left). Retain a trimmed closing statement +
"Reserve your stay" CTA before Footer. Prune dead module.css (mosaic, dark chapter,
story, featured stage); keep/adapt closing + CTA.

## Error handling

- Per-tile image load failure -> that atlas slot uses the existing placeholder mark;
  atlas build + GL context survive.
- CMS failure already handled upstream (`getCmsGalleryItems` -> null -> local fallback).

## Validation

Breakpoints 320/375/390/768/1024/1440; WebGL2-unavailable + reduced-motion emulation;
`tsc`, lint, curl `/gallery`.
