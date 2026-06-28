# Bali Magazine — Hybrid 3D Shell + 2D HTML Editorial Design

**Date:** 2026-06-29
**Status:** Approved design, pending implementation plan
**Replaces:** `components/three/BaliFlipBook.tsx` canvas-textured book + `ExploreBaliMobileCarousel`

---

## Problem

Current `BaliFlipBook` paints every page as `fillText` calls on a 2400×3200 `<canvas>`, then maps it as a texture on a curved skinned mesh. Result: soft, low-DPI, rigid grid typography — reads like a novel, not Vogue. SEO-invisible, inaccessible, hover/links impossible.

## Goal

Vogue-grade editorial Bali Destination Guide. 3D book physicality preserved (cover, page-turn curl, edge shadow). Active visible spread = crisp DOM with real Playfair/DM-Sans, `next/image`, links, hover, SEO text. Book stops selling villas and starts selling a Bali lifestyle, with each spread linking out to bookable villas.

## Non-Goals

- Live-warping DOM onto the bending page during the curl. Fragile, heavy, calibration-prone.
- Rewriting the skinned-mesh curl physics from scratch. Current bone-skeleton bend is fine; only its textures need to change.
- Replacing the existing controls deck (`bali-book-control-deck`). Reuse as-is.

---

## Architecture

Three cooperating layers:

### Layer 1 — `BookShell` (3D, R3F)
- Owns the 3D book group: cover, back cover, page meshes, curl animation, edge/curl shadow.
- Page textures are **lightweight paper + image only** (no canvas text). One destination photo + a subtle paper/grain tint per page side. Generated once, cached.
- Camera fixed at `[-0.18, 0, 5.2] fov 39`. Subtle pointer parallax tilt preserved.
- Exports `isTurning` flag (true while curl is mid-animation) and `flatFaceRect` (the screen-space rectangle of the currently-flat open spread).

### Layer 2 — `EditorialSpread` (DOM)
Pure HTML/CSS React component. Vogue editorial layout. Receives `collection` + `pageIndex` props. Two variants:
- **Hero spread** (Ubud, Canggu, Uluwatu): full-bleed photo collage left, lifestyle pillars + pull-quote right, destination CTA. Left + right page as one wide flexbox absolutely positioned over the 3D book's flat face.
- **Compact spread** (Pererenan, Canggu-Berawa, Canggu-Padonan, Umalas): single-page editorial card per side, image + location title + 3 highlights + villa CTA.

Crisp typography via real `font-family: var(--font-playfair)` / `var(--font-dm-sans)`. Real `<Link>` (Next.js) for CTAs. Real `<Image>` from `next/image` with `priority` on visible spread only.

### Layer 3 — `BaliMagazine` (orchestrator)
- Owns `page`, `totalPages`, `isTurning` state.
- Renders `BookShell` (always) + `EditorialSpread` overlay positioned on top via calibrated CSS rect.
- Listens to `isTurning`: when true, fade `EditorialSpread` opacity 1→0 (180ms). When false, swap `EditorialSpread`'s `pageIndex` to the new page and fade 0→1 (260ms).
- Renders existing `bali-book-control-deck` (unchanged).

### Sync — the "calibration"
Because the camera is fixed and the open spread sits flat in 3D space at a known position, the screen-space rect of the open spread is **constant per viewport size**. We compute it once on mount (and on resize) using `useThree().camera.project()` on the four corners of the flat face, then position the overlay with absolute `top/left/width/height` in CSS. No per-frame projection.

Pointer parallax tilt: the 3D group tilts ±~9°. To preserve depth feel without misaligning the overlay, we either:
- (a) mirror the same tilt on the overlay via a single `transform: rotateY()/rotateX()` (synced via shared `state.pointer` proxy in a `<Html>` or context), OR
- (b) freeze parallax while spread is at rest (simpler — locks the rect), restore only mid-turn when spread is invisible anyway.

**Default: (b).** Lower risk, no per-frame math. Revisit if it feels too static.

---

## Components

```
BaliMagazine (orchestrator, client)
├── BookShell (R3F Canvas)
│   ├── Book (existing, simplified — paper+image textures only)
│   ├── PageMesh × N (existing skinned-mesh curl, unchanged)
│   └── parallax tilt group (paused while overlay visible)
├── EditorialSpread (DOM overlay, absolutely positioned)
│   ├── HeroSpread (Ubud / Canggu / Uluwatu)
│   └── CompactSpread (others)
└── MagazineControls (existing bali-book-control-deck, unchanged)

useBookTurn (hook): owns page, isTurning, turn debounce, fade timing
useFlatFaceRect (hook): computes overlay rect from camera + viewport
```

Mobile reuses `EditorialSpread` in a flat stack (no 3D, no overlay positioning). Same component, two shells. `ExploreBaliMobileCarousel` is deleted.

---

## Data model

Extend `BaliCollectionItem` in `data/baliCollections.ts`:

```ts
type BaliCollectionItem = {
  // ...existing fields
  editorial?: {
    variant: "hero" | "compact";
    pullQuote?: string;        // hero only
    heroImages?: string[];     // 3-5 destination photos (rice field, surf, cliff)
    lifestyleTriad?: Array<{   // hero only — replaces existing pillars
      kicker: string;          // "ONE", "TWO", "THREE"
      title: string;           // "Rice Field", "Yoga", "Waterfall"
      blurb: string;
      image?: string;
    }>;
  };
};
```

Add a new entry: `id: "uluwatu"` with `variant: "hero"`, triad = Cliff / Sunset / Temple. CTA `href: "/villas?location=Uluwatu"` (graceful empty result OK — Uluwatu sells the lifestyle, search lands on filtered villa page).

Mark `ubud` and `canggu` as `variant: "hero"`. All others `variant: "compact"`.

Order in book: cover → Ubud (hero) → Canggu (hero) → Uluwatu (hero) → Canggu-Berawa → Pererenan → Canggu-Padonan → Umalas → back cover.

---

## CMS integration

Per project convention (`feedback_cms_media_upload`): CMS uses `FileUpload` for media, never `TextInput` URL.

`BaliCollectionResource` (Filament) gets new fields on each collection record:
- `editorial_variant` (select: hero | compact)
- `editorial_pull_quote` (textarea, hero only)
- `editorial_hero_images` (FileUpload, multiple, max 5)
- `editorial_lifestyle_triad` (repeater: kicker, title, blurb, FileUpload image)

Cache invalidation hook fires on save (existing pattern). Fallback when CMS data missing: existing villa photos from `homepage_villa/` + hard-coded triad text.

---

## Page-turn flow

```
state: page=2 (Canggu hero), isTurning=false, overlay opacity=1
user clicks Next
  → setPage(3), isTurning=true
  → overlay opacity 1→0 over 180ms (ease-out)
  → 3D curl plays (existing useFrame bone bend, ~400ms)
  → curl settles → isTurning=false
  → overlay swaps pageIndex to 3 (Uluwatu hero)
  → overlay opacity 0→1 over 260ms (ease-in-out)
```

Debounce: rapid Next clicks skip overlay fade, only final settle re-fades.

---

## Error handling & fallbacks

| Condition | Behavior |
|-----------|----------|
| WebGL unavailable | Existing `webglOk === false` path: render mobile flat-stack version on desktop too |
| Mobile / `< 1024px` | Flat `EditorialSpread` stack, no 3D, swipe nav |
| Texture / image load fail | Existing villa photo fallback per `loadCollectionImages` |
| CMS field empty | Hard-coded `data/baliCollections.ts` defaults |
| Context loss | Existing `webglcontextlost` handler unchanged |
| Reduced motion | Skip fade animation, instant swap; 3D curl shortened to 120ms |

---

## Testing

Manual visual checklist (verification step per superpowers):
- Crisp Playfair text at rest, real DOM selectable
- Smooth fade↔curl, no flash of old content after swap
- Overlay rect aligns to flat face at 1024 / 1440 / 1920 widths
- Pointer parallax disabled while overlay visible — no drift
- Mobile flat stack swipes between same 7 spreads
- WebGL-off desktop fallback renders mobile stack
- Keyboard arrows still navigate
- Existing audio + page indicator still fire
- CMS edit → save → cache bust → new image appears

---

## Migration / out-of-scope cleanup

In-scope (touched by the work):
- `BaliFlipBook.tsx` — strip `createGalleryTexture` / `createInfoTexture` / `createCoverTexture` / `createBackCoverTexture` canvas-text logic. Keep skinned-mesh curl. Replace with simple paper+image texture builder.
- `ExploreBaliBookSection.tsx` — becomes thin wrapper around new `BaliMagazine`.
- `ExploreBaliMobileCarousel.tsx` — deleted, replaced by mobile-mode `BaliMagazine`.
- `data/baliCollections.ts` — add Uluwatu, add `editorial` field, mark variants.
- `app/globals.css` — add `.bali-magazine-overlay`, `.bali-hero-spread`, `.bali-compact-spread` styles. Existing `bali-book-*` controls deck styles untouched.
- `BaliCollectionResource.php` (Filament) — new editorial fields.

Out of scope (don't drift):
- Skinned-mesh curl tuning
- Lighting rig
- Audio
- Controls deck visual redesign
- Other homepage sections

---

## Open items for plan phase

- Exact CSS variable names for overlay (follow existing `bali-book-*` convention)
- Filament cache invalidation hook wiring (existing pattern, copy from neighbor resource)
- Whether to lazy-load non-visible spreads' images (probably yes via `next/image` `loading="lazy"`)
- Migration for existing CMS records (default `editorial_variant` based on `id`)
