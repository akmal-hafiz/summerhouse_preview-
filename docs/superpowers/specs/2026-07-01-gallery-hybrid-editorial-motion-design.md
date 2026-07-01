# Gallery Hybrid Editorial Motion Design

Date: 2026-07-01

Status: Approved direction. User approved hybrid mix of editorial mosaic, sticky story, and featured chapters, with stronger motion inspired by the attached reference video.

## Existing-State Audit

The Gallery route already exists at `app/gallery/page.tsx`. It fetches CMS data through `getCmsGalleryItems()`, wraps the page with the shared `Navbar` and `Footer`, and renders `components/gallery/GalleryPage.tsx`.

The current Gallery page already reuses:

- Existing Summer House global navigation and footer.
- Existing font system: Outfit through `--font-dm-sans` and Playfair through `--font-playfair`.
- Existing CMS model and API: `GalleryItem`, `/v1/cms/gallery`, `getCmsGalleryItems()`.
- Existing animation library: `framer-motion`.
- Existing mandatory brand tokens in globals: `--brand-bg: #FAFAF9` and `--brand-primary: #446B4A`.

What needs improvement:

- Current page is mostly one dense bento grid, so every item feels similar.
- Accent color `#c8a97e` should be removed or reduced because primary interactive color must be `#446B4A`.
- Route shell background should align to `#FAFAF9`.
- The whole Gallery page is a client component only for animation; the redesign should keep client motion islands smaller where practical.
- CMS content is preserved, but visual treatment should be assigned by frontend rules instead of forcing the admin to manage layout coordinates.

Duplicate implementation avoided:

- No duplicate gallery model, resource, migration, API route, or CMS service.
- No new navigation system.
- No new button system unless extending local styles.
- No new CMS fields for phase one.

## Reference Video Analysis

The attached reference video was extracted locally into 12 frames at 60fps, 1600x1200, 29.61 seconds. It is used only for transferable principles.

Observed transferable behavior:

- A dim, full-viewport background image remains behind a centered content stage.
- The content stage behaves like a framed editorial canvas.
- Sections transition by scroll: hero, light editorial section, dark service chapters, product grid, dark case studies, contact, then return to hero.
- Visual rhythm alternates between light and dark stages, but Summer House should keep `#FAFAF9` as main background and use dark moments sparingly.
- Images are never equal-card spam. They appear as large anchors, paired images, offset details, and product-like rows.
- Typography is oversized but controlled, usually 2 to 3 lines max.
- Motion feels like pinned stage swaps, image scale settling, fade/clip reveals, and section scrubbing.

Do not copy:

- Reference brand identity, logo, copy, typography, color palette, exact page structure, or exact animation sequence.

## Design Plan

```text
Python RNG simulation:
seed = 1271
hero = "Artistic asymmetry with framed media stage"
components = ["Inline typography images", "gapless editorial mosaic", "pinned split story"]
motion = ["ScrollTrigger-style pinned stage", "image scale and fade scrub"]
font = "Outfit + Playfair", because project font system already owns this choice
```

AIDA check:

- Navigation: reuse shared Summer House `Navbar`.
- Attention: cinematic gallery hero with framed video or strongest landscape.
- Interest: hybrid editorial mosaic with ratio-aware image placement.
- Desire: pinned story chapter and full-bleed visual break.
- Action: final Summer House CTA and shared footer.

Hero math:

- H1 uses `width: min(100%, 72rem)` and `font-size: clamp(3.8rem, 8vw, 8.6rem)`.
- Desktop target: 2 to 3 lines, never a narrow 6-line stack.
- No stamp icons or spam badges.

Bento density:

- Desktop mosaic uses 12 columns with `grid-auto-flow: dense`.
- Section-level patterns consume known spans: landscape 7 columns, portrait 4 columns, text pause 4 columns, detail pair 8 columns.
- Mobile intentionally becomes single-column or controlled two-up detail pairs; no dead empty cells.

Label and button check:

- Avoid cheap labels like "SECTION 01" and "QUESTION 05".
- Numeric labels from CMS may remain only as quiet captions when useful.
- Primary CTA uses `#446B4A` with white text.

## 1. Layout Structure

Overall page width:

- Page background full width: `#FAFAF9`.
- Main editorial shell: `min(100%, 1440px)`.
- Text containers: `min(100%, 72rem)` for hero, `min(100%, 42rem)` for body copy.
- Gallery chapters: full-width bands with constrained inner grids.

Desktop grid:

- 12-column editorial grid.
- Gutters: `clamp(1rem, 2vw, 2rem)`.
- Section padding: `clamp(6rem, 11vw, 11rem)`.
- Images align to a mixed rhythm: one dominant anchor, one offset portrait/detail, one caption/text pause.

Tablet grid:

- 8-column grid.
- Sticky behavior disabled or softened.
- Mosaic keeps paired images but removes deep overlap.

Mobile grid:

- Single-column reading flow.
- Occasional two-up detail pairs only where images remain readable.
- Captions stay directly below or inside image frame bottom.

Composition:

- Uses full-bleed hero or video only when CMS has a video or strong landscape.
- Uses offset columns, split editorial sections, featured image moments, and controlled mosaic groups.
- Avoids repeating identical bento rows.

## 2. Section Order

1. Global header
   - Source: shared `Navbar`.
   - Behavior: solid header, active Gallery nav state if available later.

2. Gallery hero
   - Source: first CMS video if present, otherwise first image, plus fallback text.
   - Layout: large editorial title left, framed media stage right or below depending viewport.
   - Motion: media scale settles from 1.04 to 1, text fades upward.

3. Editorial introduction
   - Source: first text CMS item or fallback gallery intro copy.
   - Layout: quiet text block with wide whitespace.
   - Motion: line reveal, no over-animation.

4. Featured media stage
   - Source: first video or best landscape image.
   - Layout: full-bleed or near full-bleed visual break.
   - Motion: subtle scroll-linked parallax inside clipped frame.

5. Sticky gallery story
   - Source: next text CMS item plus next 4 to 6 media items.
   - Layout: desktop sticky text column, scrolling image column.
   - Motion: primary image reveals first, secondary image later, caption last.

6. Editorial mosaic collection
   - Source: remaining image/video CMS items.
   - Layout: ratio-aware 12-column dense mosaic.
   - Motion: image mask reveal and scale settle.

7. Dark quiet chapter
   - Source: optional video or high-contrast image group.
   - Layout: restrained dark band inspired by reference, not full palette copy.
   - Motion: pinned stage swap on desktop; static stack on mobile.

8. Closing statement
   - Source: final text CMS item or fallback.
   - Layout: large Playfair line with small inline image detail if enough media exists.
   - Motion: scrubbed text opacity is allowed on desktop only.

9. Final CTA
   - Source: existing `/villas` route and fallback CTA.
   - Layout: image-led CTA using existing CTA pattern.
   - Motion: fade-up, button hover.

10. Footer
    - Source: shared `Footer`.

## 3. Navigation

- Reuse existing `Navbar`.
- Logo remains global brand treatment.
- Desktop menu remains shared.
- Mobile menu remains shared.
- Gallery-specific category navigation is not required in phase one because CMS lacks category fields.
- Anchor navigation is avoided unless later CMS data grows into named categories.
- Focus states must remain visible.
- Header should not conflict with global scroll behavior.

## 4. Typography

- Display heading: Playfair Display via `--font-playfair`.
- Body and nav: Outfit via `--font-dm-sans`.
- Hero H1: `clamp(3.8rem, 8vw, 8.6rem)`, line-height `0.86` to `0.92`.
- Section headings: `clamp(2.6rem, 5.5vw, 6rem)`.
- Body: `0.98rem` to `1.1rem`, line-height `1.7` to `1.85`.
- Captions: `0.72rem` to `0.8rem`, uppercase or sentence case depending context.
- Max body width: around 42rem.
- Use `text-wrap: balance` for large headings and `text-wrap: pretty` for paragraphs.
- Avoid too many weights; use 400, 500, 700/800 only where needed.

## 5. Color System

Required colors:

- Main background: `#FAFAF9`.
- Primary action: `#446B4A`.

Other colors should derive from existing tokens:

- Ink: `#1a1a1a` or `#171717`.
- Muted text: `#5f5a52`.
- Lines: rgba of ink or brand primary.
- Dark chapter: near-black green/charcoal, not pure black.
- Image overlays: transparent ink gradients for caption readability.
- Focus ring: `rgba(68, 107, 74, 0.22)` plus visible outline.

No arbitrary accent palette from the reference video.

## 6. Spacing and Layout Rhythm

- Header offset: hero top padding accounts for navbar.
- Hero padding: `clamp(8rem, 13vw, 13rem)` top and `clamp(4rem, 8vw, 7rem)` bottom.
- Section padding: `clamp(6rem, 11vw, 11rem)`.
- Gallery grid gaps: `clamp(0.9rem, 1.8vw, 1.6rem)`.
- Image-to-caption spacing: `0.65rem` to `0.9rem`.
- Rhythm alternates dense visual chapters with quiet editorial whitespace.
- Mobile uses generous but not wasteful spacing: 4rem to 6rem section rhythm.

## 7. Image Treatment

Image roles are assigned by frontend rules:

- Video: featured full-bleed or sticky stage anchor.
- Landscape: large anchor, chapter hero, or wide visual break.
- Portrait: offset tall image, paired with landscape.
- Square/detail: smaller detail tile or two-up pair.
- Text item: editorial pause, not a dashboard card.

Image requirements:

- Use `next/image` for images.
- Use `sizes` per pattern, not one generic value.
- Priority only for hero image/video poster.
- Lazy load below fold.
- Use stable aspect-ratio wrappers to prevent layout shift.
- Captions and credits remain readable.
- Do not distort images; object-fit cover with controlled object-position.

Phase one cannot read actual image dimensions from CMS API. The frontend will use pattern classes based on item type and order. If later CMS adds orientation or focal point, mapping can become exact.

## 8. Cards and Content Blocks

- Do not wrap every media item in a visible card.
- Most images live in open editorial frames with subtle radius and captions.
- Text blocks are borderless or use fine top/bottom rules.
- Cards are allowed only for CTA, empty state, or structured dark chapter panels.
- Avoid heavy shadows, glassmorphism, and dashboard styling.

## 9. Buttons and CTAs

- Primary CTA: "Explore villas", background `#446B4A`, white text.
- Secondary CTA: text link or outlined brand button.
- Hover: background deepens to `#355538`, icon/arrow shifts subtly.
- Pressed: `scale(0.98)`.
- Focus-visible: clear ring using brand primary.
- Mobile touch target: at least 44px high.

## 10. Overall Design Feel

The Gallery should feel like a luxury hospitality editorial or coffee-table book:

- Premium, calm, spacious, image-led.
- Architectural and warm.
- Motion-rich but not playful.
- Original Summer House identity.

It must not feel like:

- Generic masonry grid.
- Admin dashboard.
- Image marketplace.
- Direct copy of the reference.

## 11. Scroll Animation

Use reference-inspired principles:

- Section entrance: opacity 0 to 1, y 18 to 0.
- Image reveal: clipped mask or overflow reveal, image scale 1.04 to 1.
- Text reveal: line or word-group reveal for large headings only.
- Parallax: only hero media and one full-bleed visual break.
- Sticky storytelling: desktop text column pins while images scroll.
- Card stacking: optional dark chapter cards stack subtly on desktop.
- No scroll hijacking.
- No mandatory horizontal scroll on mobile.

Project dependency note:

- Current project has `framer-motion`, not GSAP.
- Implement with `framer-motion`, CSS `position: sticky`, and Intersection Observer-like viewport triggers first.
- Add GSAP only if later approved as a dependency because it is not in `package.json`.

## 12. Animation Timing and Easing

- Micro interactions: 160ms to 240ms.
- Buttons and links: 180ms to 250ms.
- Text reveals: 500ms to 800ms.
- Image reveals: 700ms to 1200ms.
- Section transitions: 700ms to 1000ms.
- Stagger: 70ms to 120ms.
- Easing: existing `--ease-editorial: cubic-bezier(0.22, 1, 0.36, 1)`.

## 13. Reduced Motion and Accessibility

For `prefers-reduced-motion`:

- Disable parallax.
- Disable pinned transform scrubbing.
- Show content immediately or with minimal opacity change.
- Preserve layout and content order.

Accessibility:

- Semantic heading order.
- Meaningful alt text from CMS.
- Video needs poster and accessible caption/label.
- No essential content hover-only.
- Keyboard focus visible.
- Touch targets at least 44px.
- Captions readable over images.

## 14. Responsive Behavior

Large desktop:

- Wide hero, sticky chapter, asymmetrical mosaic, subtle parallax.

Standard desktop/laptop:

- Preserve hierarchy while reducing excessive offsets.
- Prevent horizontal overflow.

Tablet:

- Convert sticky chapter to two-column non-pinned layout.
- Reduce overlaps.

Mobile:

- Single-column reading flow.
- Video and featured images become stacked full-width frames.
- Captions remain close to media.
- Text blocks appear between media groups.
- Animations simplify.

## 15. Performance Requirements

- `next/image` for images.
- Correct `sizes`.
- Lazy loading below fold.
- Priority only for above-fold hero image/poster.
- Stable aspect-ratio wrappers.
- Transform/opacity animations only.
- No heavy scroll listeners.
- Small client motion components instead of whole-page client wrapper where practical.
- Avoid GSAP dependency unless explicitly approved.

## 16. Implementation Architecture

Proposed components:

- `GalleryPage` as server-friendly composition wrapper where possible.
- `GalleryMotion` as small client wrapper for viewport animations.
- `GalleryHero`.
- `GalleryIntro`.
- `FeaturedMediaStage`.
- `StickyGalleryStory`.
- `EditorialMosaic`.
- `GalleryMediaFrame`.
- `GalleryTextPause`.
- `GalleryClosingCta`.

Data mapping remains in `GalleryPage` or a local mapper:

- `normalizeGalleryItems(items)`.
- `splitGalleryChapters(items)`.
- `assignGalleryTreatment(item, index)`.

## 17. Data Mapping and Empty States

CMS fields used:

- `type`: image, text, video.
- `src`: image URL.
- `alt`: alt/caption.
- `label`: optional visible caption label.
- `title`: text block title.
- `text`: text block copy.
- `video_url`: video URL.
- `video_poster`: poster image.

Graceful fallbacks:

- No CMS items: render curated local fallback content with a clear internal comment in code.
- Missing image: skip media item.
- Missing alt: fallback to descriptive non-empty alt based on label/title.
- Missing caption: show label only or suppress caption.
- Odd media count: last image becomes a full-width closing image.
- No video: use strongest first landscape image as hero media.
- Video without poster: render video but no priority poster assumptions.

## 18. Implementation Process

1. Preserve current CMS/API logic.
2. Update route shell background to `#FAFAF9`.
3. Refactor Gallery page into smaller presentational sections.
4. Build type/order-based treatment mapper.
5. Implement hero and featured media stage.
6. Implement sticky desktop story with mobile fallback.
7. Implement editorial mosaic.
8. Implement final CTA.
9. Add reduced-motion CSS.
10. Verify desktop, tablet, and mobile.
11. Run `npm run typecheck`.
12. Run `npm run build` if time/resources allow.

## 19. Final Deliverables Checklist

Implementation final response must include:

- Existing-state audit.
- Structured design review summary.
- Final section blueprint.
- Responsive blueprint.
- Motion specification.
- Component architecture.
- CMS mapping.
- Implementation summary.
- Verification report.
- Changed files.

## Spec Self-Review

Placeholder scan:

- No unfinished markers remain.

Consistency:

- Design preserves CMS and existing route.
- Motion plan follows reference principles without copying brand identity.
- Color plan keeps `#FAFAF9` and `#446B4A`.

Scope:

- Focused on Gallery page only.
- No backend/CMS schema change in phase one.

Ambiguity resolved:

- Video uses featured/sticky/full-bleed treatment.
- Landscape uses anchor treatment.
- Portrait/detail uses offset or paired mosaic treatment.
- Text CMS uses editorial pause/sticky note treatment.
