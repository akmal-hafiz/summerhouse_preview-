# Summerhouse Homepage, About, and Bali Destination Guide CMS Design

**Date:** 2026-07-25

**Status:** Ready for user review

**Scope:** Complete the Homepage and About CMS, transform Bali Destination Guide cards into editorial destination links with a page-turn interaction, support image and video media, and add dedicated destination guide pages.

## 1. Objective

Give the Summerhouse client direct control over the approved Homepage and About page copy without exposing implementation details or forcing repetitive data entry.

The Bali Destination Guide must evolve from a villa-filter shortcut into an editorial travel layer:

1. Homepage introduces the character of each destination.
2. A destination card opens a dedicated lifestyle guide.
3. The guide explains the area's rhythm, culture, experiences, and visual identity.
4. Related villas appear later as a natural continuation of the guide.

The destination card itself has no button, CTA label, pill, or visible instruction text. Clickability is communicated through the whole-card link, active-state information, focus treatment, and a restrained page-turn animation.

## 2. Approved Product Scope

### 2.1 Public UI already approved

- Homepage
- About
- Villas and villa detail
- Services
- Concierge
- Contact
- Gallery
- Journal index and article detail
- Login, registration, OTP, and account experience

### 2.2 Public UI still requiring work

- User dashboard
- Global footer
- Remaining site-wide mobile states
- Destination editorial pages, which do not exist yet

CMS organization for pages other than Homepage and About remains a later content-management backlog. It is not classified as an unfinished public-page UI.

### 2.3 Current implementation facts

- `HomepageManager` already manages Hero, Stay Styles, Signature Villa, and Explore Bali section copy.
- Bali destination records currently live in a separate `BaliCollection` resource.
- `AboutPageManager` is currently only an empty placeholder.
- `DestinationRail` activates cards through hover, focus, or tap, while navigation is limited to the caption link.
- Existing Bali collection records point directly to `/villas?location=...`.
- The project already has a proven `video_url` and `video_poster` pattern in Gallery CMS.
- No `/destinations/[slug]` route currently exists.

## 3. Information Architecture

The approved public journey is:

```text
Homepage
  -> Bali Destination Guide
  -> Entire destination card
  -> /destinations/{slug}
  -> Editorial destination guide
  -> Related villas
  -> /villas?location={lodgify-location}
```

The Homepage card sells a destination's character. The destination page provides depth. Villas appear only after the user understands the area.

Initial destination examples:

| Destination | Editorial themes |
|---|---|
| Ubud | Rice fields, yoga, wellness, waterfalls, temples, traditional crafts |
| Canggu | Surfing, cafés, beach clubs, creative culture, sunsets, social rhythm |
| Uluwatu | Cliffs, beaches, sunsets, temples, coastal dining, surf culture |
| Pererenan | Surf mornings, village calm, private dining, slower coastal rhythm |

The data model must support any future Bali destination without adding a new route or component.

## 4. Homepage Destination Card Design

### 4.1 Combined design direction

The card combines two approved concepts:

- **Information model from Option A:** the whole card is a semantic link to an editorial destination page. The title and description identify the destination. There is no CTA.
- **Behavior and animation from Option B:** the active card behaves like a refined editorial page that is ready to be opened.

The page-turn metaphor must remain subtle. It should feel like high-end editorial interaction, not a literal children's book animation.

### 4.2 Resting state

- Cards remain in the existing horizontal media rail.
- One card is always active.
- Inactive cards use the existing narrow proportions.
- The active card expands while neighboring cards reflow around it.
- The destination name and one concise lifestyle sentence appear beneath the active card.
- No `Explore`, `View`, `Read more`, arrow button, or CTA chip is rendered.

### 4.3 Desktop interaction

On pointer hover or keyboard focus:

1. The card becomes active.
2. The card expands using the established rail behavior.
3. The media scales inward by approximately 1.02 to 1.035.
4. The upper-right corner lifts by approximately 12 to 18 pixels.
5. A warm paper-toned underside becomes visible beneath the fold.
6. The existing viewfinder ticks settle into a complete editorial frame.
7. The title and description reveal beneath the card.
8. The cursor is `pointer`.

On pointer leave, the page corner returns to rest, but the card remains the persistent active card until another card is activated.

Clicking anywhere inside the media card opens `/destinations/{slug}`. The visible caption is part of the same destination link.

Keyboard behavior:

- Tab focuses each destination link.
- Focus activates the same visual state as hover.
- Left and right arrow keys move active focus within the rail.
- Enter opens the focused destination using native link behavior.
- Focus remains visually clear without relying only on color.

The rendered structure uses a semantic list of destination links. It must not nest a button inside a link or create separate competing links for the media and caption.

### 4.4 Page-turn motion rules

- Corner movement uses transform and clip-path or a pseudo-element, not layout-changing dimensions.
- The fold uses the Summerhouse warm neutral palette.
- The fold does not cover destination information.
- Total reveal duration remains between 260 and 420 milliseconds.
- The easing follows the existing restrained editorial motion language.
- No elastic bounce, repeated pulse, 3D flip, or large shadow is allowed.
- Reduced-motion mode removes the folding movement and uses a static framed focus state.

## 5. Mobile and Tablet Behavior

Touch interaction cannot depend on hover. The mobile rail therefore uses a deliberate active-card model.

### 5.1 Rail behavior

- The rail uses horizontal scrolling and CSS scroll snap.
- The card nearest the viewport center becomes active after scrolling settles.
- The active card expands within the mobile-safe width and reveals its caption.
- Partial neighboring cards remain visible to communicate horizontal exploration.
- The document itself must never gain horizontal overflow.

### 5.2 Tap behavior

- Tapping a non-active card centers and activates it without navigating.
- Tapping the active card opens its destination guide.
- Tapping the active caption also opens the guide.
- A horizontal drag above the movement threshold suppresses navigation.
- The interaction must not require a rapid double tap.

This gives users one deliberate preview state before leaving the Homepage and avoids accidental navigation during swipes.

The inactive-card interception applies only to coarse pointers. Screen readers, keyboards, and precise pointers retain normal link behavior.

### 5.3 Mobile page-turn affordance

When a card becomes active:

1. The upper-right corner performs one short lift-and-settle animation.
2. The destination title and description reveal beneath it.
3. The complete frame appears around the media.
4. The animation runs only once per activation and never loops.

This communicates that the active card can be opened without adding CTA text. In reduced-motion mode, the active card receives only the static frame and caption.

### 5.4 Touch accessibility

- The active card link exposes an accessible name such as `Open the Ubud destination guide`.
- The rail exposes its position, for example `Ubud, destination 2 of 6`.
- Touch targets remain at least 44 by 44 pixels.
- Screen-reader users receive a normal list of destination links and do not depend on the visual two-step interaction.

## 6. Image and Video Media

### 6.1 Supported primary media

Every destination may use:

- A primary image, or
- A primary video with a required poster

The same destination record owns both Homepage card media and destination-page identity. Copy and media are not duplicated in a separate Homepage-only record.

### 6.2 Video behavior

- Accepted formats: MP4 and WebM.
- Video is muted, looped, and `playsInline`.
- Only the active, visible card may play.
- Inactive or offscreen cards pause immediately.
- Video loads lazily when its card approaches the viewport.
- The poster renders before playback and preserves layout dimensions.
- Playback failure falls back to the poster without showing a broken control.
- Reduced-motion mode shows the poster and does not autoplay.
- The video has no audio controls because card video is ambient editorial media.
- Destination detail pages may provide separately controlled video behavior if required later.

### 6.3 Performance constraints

- The Homepage must not preload every destination video.
- At most the active video and one adjacent candidate may be prepared.
- Images use responsive sizes and optimized formats.
- Posters use the same aspect ratio as the video.
- CMS upload limits and helper text must communicate the intended short-loop usage.
- Large uploads must not block unrelated page data.

## 7. Destination CMS Data Model

The current `bali_collections` records are extended rather than replaced. Existing content remains migratable.

### 7.1 Identity

- `name`
- `slug`
- `location_key`
- `category`
- `tag`
- `is_active`
- `is_published`
- `sort_order`

`slug` becomes the canonical route key. The public route is always computed as `/destinations/{slug}` and is not typed manually.

### 7.2 Homepage card content

- `card_description`
- `media_type`, either `image` or `video`
- `primary_image`
- `primary_video`
- `video_poster`
- `mobile_poster`
- `image_alt`
- `video_accessibility_label`

There is no card CTA field in the active editing interface. Existing legacy `cta` data is ignored by the new frontend and retained only during migration safety.

### 7.3 Destination guide content

- `eyebrow`
- `hero_title`
- `introduction`
- `hero_media_type`
- `hero_image`
- `hero_video`
- `hero_video_poster`
- `gallery_media`
- `lifestyle_chapters`
- `highlights`
- `best_for`
- `facts`
- `related_journal_tags`
- `seo_title`
- `seo_description`
- `social_image`

### 7.4 Villa relationship

- `lodgify_location`
- `show_related_villas`
- `related_villas_heading`
- `manual_villa_overrides`, optional

Villa count, starting price, and related villa results are derived from active Lodgify data. They are not manually maintained strings in the new editing flow.

### 7.5 Lifestyle chapter structure

Each chapter contains:

- Title
- Short editorial description
- Media type
- Image or video
- Video poster when required
- Alt or accessibility text
- Display order
- Visibility

The number of chapters is flexible, but the CMS recommends three to six chapters for a balanced destination page.

## 8. Admin Experience and Automation

The CMS must minimize typing and prevent mismatched destination data.

### 8.1 Create destination flow

1. Admin clicks `Add destination`.
2. Admin chooses a Lodgify location from a searchable select.
3. The CMS automatically fills:
   - Destination name
   - Slug
   - Public destination route
   - Lodgify location mapping
   - Default image alt text
   - Default video accessibility label
4. Admin chooses a destination content preset if available, such as Cultural Hills, Surf Coast, or Quiet Coast.
5. The preset adds editable starter categories and chapter suggestions.
6. Admin adds or selects media.
7. Admin reviews the live summary and publishes.

Automatic values never overwrite an admin's later manual edits unless the admin explicitly clicks `Regenerate defaults`.

### 8.2 Smart field behavior

- Choosing `Image` shows image fields and hides video-only fields.
- Choosing `Video` requires video and poster fields.
- If no mobile poster is supplied, the standard poster is reused.
- Slug updates from the destination name until the admin manually edits the slug.
- Duplicate slugs are blocked.
- The public route is shown as a read-only preview.
- Active villa count and price range appear as live read-only statistics.
- Related villas are previewed using the selected Lodgify location.
- Drag-and-drop controls card and chapter order.
- `Duplicate destination` copies structure and media references but clears identity and publication state.
- `Save draft`, `Preview`, and `Publish` are separate clear actions.

### 8.3 Publishing preflight

Publishing is blocked when:

- Destination name or slug is missing.
- Primary media is missing.
- A video has no poster.
- Introduction is empty.
- No visible lifestyle chapter exists.
- SEO title or description is missing.
- The Lodgify location mapping is invalid.

The CMS presents human-readable corrections next to the affected section.

### 8.4 Homepage integration

The Homepage Manager includes a `Bali Destination Guide` tab with:

- Kicker
- Stacked heading lines
- Description
- Section visibility
- Ordered destination list
- Destination status
- Primary media thumbnail
- Drag-and-drop ordering
- Quick edit
- Add destination

The tab manages the same destination records. It does not create a second set of Homepage-only cards.

## 9. Homepage CMS Completion

Homepage Manager is organized into these sections:

1. Hero
2. Stay Styles
3. Most Exclusive Stay
4. Testimonials
5. Bali Destination Guide

Every applicable section supports:

- Eyebrow or kicker
- Heading
- Intentional heading line breaks
- Description
- Visibility

Section-specific data such as selected villas, awards, testimonials, and destinations remains in its appropriate typed model. Generic copy remains in `PageSection`.

The CMS must preserve frontend fallbacks so the Homepage remains usable when the backend is temporarily offline.

## 10. About CMS Completion

`AboutPageManager` becomes a functional form organized in the same order as the approved About page:

1. Our Story Hero
2. Trust and Recognition
3. Studio Statement
4. Booking Process
5. Concierge Experience
6. Editorial Gallery
7. FAQ Introduction
8. Journal Preview
9. Destination Footprint
10. Final CTA

### 10.1 Common About controls

- Eyebrow
- Heading
- Description
- Media where applicable
- Visibility

### 10.2 Section-specific automation

- Portfolio counts remain sourced from Lodgify and are shown as read-only live values.
- Destination counts and map data remain derived from active villas.
- Journal Preview selects published articles from an existing searchable list.
- FAQ content remains in the FAQ resource, while the About CMS controls section copy and visibility.
- Concierge cards select existing Concierge records rather than duplicating service content.
- Booking Process uses a reorderable fixed-shape repeater with title, description, image, and visibility.
- Gallery items select existing approved media or accept a new upload through the shared media pattern.
- Default copy can be restored per section through a confirmation action.

### 10.3 Safety

- Saving one About section must not erase other sections.
- Empty optional fields fall back to the approved frontend defaults.
- Dynamic API values are never replaced by manually typed counts.
- Section visibility is explicit and reversible.

## 11. Destination Page Design

### 11.1 Route

- Public route: `/destinations/[slug]`
- Only active and published destinations resolve publicly.
- Draft, inactive, or unknown slugs return the standard not-found response.
- Published destination routes are included in the sitemap.

No destination index page is required in this scope.

### 11.2 Page sequence

1. Global navbar
2. Destination hero
3. Editorial introduction
4. Lifestyle chapters
5. Media gallery
6. Highlights and practical facts
7. Optional related Journal stories
8. Related villas
9. Global footer

### 11.3 Visual direction

- Preserve Summerhouse typography, warm neutral color system, and editorial spacing.
- Use asymmetric image rhythm without turning the page into a card grid.
- Chapters alternate composition carefully rather than using identical repeated blocks.
- Video is used as atmosphere, not as decorative autoplay everywhere.
- Related villas use existing villa-card data and interaction patterns.
- There is no generic marketing banner.

### 11.4 Related villas

Related villas are automatically resolved from the destination's Lodgify location. Admin may optionally pin a small number of villas to the front.

If no villa matches:

- The editorial guide remains published.
- The related villa section is hidden.
- No empty-state marketing copy is shown.

## 12. Frontend and Backend Boundaries

### 12.1 Backend responsibilities

- Store destination editorial data.
- Validate media and publish requirements.
- Resolve uploaded asset URLs.
- Expose active Homepage destination summaries.
- Expose a destination detail by slug.
- Expose derived villa relationship metadata.
- Flush relevant CMS caches after save, reorder, publish, or delete.

### 12.2 Frontend responsibilities

- Render Homepage section copy and destination summaries.
- Manage active rail state.
- Implement page-turn motion.
- Coordinate active video playback.
- Resolve destination routes.
- Render destination editorial pages.
- Fetch related villas through the existing Lodgify layer.
- Preserve hardcoded or seeded fallbacks when CMS is offline.

### 12.3 Proposed focused units

- `components/sections/DestinationRail.tsx`, revised interaction shell
- `components/sections/DestinationMediaCard.tsx`, image/video and page-turn behavior
- `components/sections/DestinationRail.module.css`, responsive rail and fold styling
- `app/destinations/[slug]/page.tsx`
- `components/destinations/DestinationGuidePage.tsx`
- `components/destinations/DestinationGuidePage.module.css`
- `components/destinations/DestinationChapter.tsx`
- `components/destinations/RelatedDestinationVillas.tsx`
- `lib/destinations.ts`, types, normalization, fallback, and CMS access

Backend changes remain centered on:

- `BaliCollection`
- `BaliCollectionResource`
- `HomepageManager`
- `AboutPageManager`
- `CmsController`
- additive migrations for destination media and editorial content

Large existing page components should receive normalized CMS props rather than importing backend field shapes directly.

## 13. Error Handling and Fallbacks

- CMS unavailable: use existing seeded Homepage destination summaries.
- Destination detail CMS unavailable: return the cached or static fallback only for known seeded destinations.
- Unknown slug: return not found.
- Broken primary image: use the approved destination fallback image.
- Broken video: show its poster.
- Missing mobile poster: use the standard poster.
- Missing related villas: hide the section.
- Missing optional Journal matches: hide that section.
- Empty About copy: use approved frontend defaults.
- Cache invalidation must cover Homepage sections, destination lists, and destination detail slugs.

Errors must be logged without exposing backend details to users.

## 14. Accessibility

- Every destination is represented by a real link.
- Image alt text describes the destination context.
- Ambient video has an accessible label and no essential information exists only inside the video.
- Page-turn animation is decorative and hidden from assistive technology.
- Keyboard users can activate and open every card.
- Focus order follows the visual rail order.
- Reduced-motion mode removes page folding, autoplay, parallax, and smooth programmatic scrolling.
- Destination page headings maintain a valid hierarchy.
- Color contrast meets the existing Summerhouse accessibility baseline.

## 15. Performance

- Homepage destination payload uses summary fields only.
- Destination detail content is fetched only on its page.
- Videos are lazy and paused when inactive.
- Related villas reuse existing caching.
- Images declare responsive sizes.
- Below-the-fold destination sections are lazy where appropriate.
- No additional client-side library is introduced solely for page folding.
- Motion uses transform, opacity, and composited layers.
- CMS cache is invalidated precisely rather than globally.

## 16. Testing and Acceptance Criteria

### 16.1 Backend tests

- Destination slug generation and uniqueness.
- Automatic Lodgify location mapping.
- Image destination publish flow.
- Video destination requires a poster.
- Draft destinations do not appear publicly.
- Destination summary and detail API serialization.
- Destination cache invalidation.
- Homepage section save does not erase destination records.
- About section save does not erase sibling sections.

### 16.2 Frontend tests

- Whole active card navigates to the editorial route.
- No card CTA is rendered.
- Desktop hover and focus activate the card.
- Keyboard arrows and Enter work.
- Inactive mobile tap centers without navigation.
- Active mobile tap navigates.
- Swipe does not accidentally navigate.
- Only the active visible video plays.
- Video failure shows poster.
- Reduced-motion mode disables folding and autoplay.
- Unknown destination slug returns not found.
- Related villas use the mapped location.

### 16.3 Visual QA

- Desktop widths: 1280, 1440, and 1920.
- Tablet widths: 768 and 1024.
- Mobile widths: 360, 390, and 430.
- Chrome, Safari, and Firefox.
- Keyboard-only navigation.
- Reduced motion.
- Slow network and failed video.
- CMS offline fallback.
- No horizontal document overflow.

### 16.4 Definition of done

The work is complete when:

1. Homepage and About copy can be managed through organized page-specific CMS forms.
2. Admin can create a destination mostly through selection and automatic defaults.
3. Destination cards support image or video.
4. No visible CTA appears on destination cards.
5. Page-turn behavior communicates clickability on desktop and mobile.
6. Every published destination has a working editorial route.
7. Related villas derive from destination location data.
8. Accessibility, reduced motion, fallback, and performance requirements pass.
9. Frontend typecheck, production build, backend tests, and browser QA pass.

## 17. Implementation Sequence

1. Add additive destination schema fields and migration compatibility.
2. Extend the destination model, API, cache invalidation, and CMS resource.
3. Integrate destination management into Homepage Manager.
4. Convert About Page Manager from placeholder to organized forms.
5. Add normalized frontend destination types and fallbacks.
6. Split media behavior into a focused destination card component.
7. Implement the desktop page-turn and whole-card link.
8. Implement mobile snap, activation, drag protection, and active-card navigation.
9. Add destination detail routes and editorial components.
10. Connect related Journal content and villas.
11. Add automated tests.
12. Run performance, accessibility, responsive, and CMS-offline QA.
13. Only after this scope is stable, continue with Dashboard, footer, and site-wide mobile QA.

## 18. Skills for the Implementation Phase

The implementation phase should use skills in this order:

1. **using-superpowers** for workflow discipline and skill selection.
2. **graphify** to trace existing CMS, Lodgify, media, cache, and page relationships before edits.
3. **gpt-taste** for the editorial page-turn interaction, destination-page composition, and anti-generic UI judgment.
4. **emil-design-eng** for hover, focus, touch, timing, easing, and invisible interaction polish.
5. **design-taste-frontend** for consistency across responsive layouts and the Summerhouse design language.
6. **playwright** for real-browser desktop, mobile, keyboard, video, and navigation verification.

`image-to-code` is not required for the initial implementation because the approved Homepage reference and existing Summerhouse visual system already define the direction. It should be added only if a new destination-page visual reference is supplied and must be matched precisely.

No implementation skill is invoked while this specification is under review.

## 19. Out of Scope

- User Dashboard redesign
- Global footer redesign
- Full site-wide mobile polish outside touched components
- CMS completion for Services, Concierge, Contact, Gallery, Journal, or Villas
- Automated newsletter delivery
- SMTP delivery
- A standalone `/destinations` index page
- Third-party destination data ingestion
- AI-generated destination copy
