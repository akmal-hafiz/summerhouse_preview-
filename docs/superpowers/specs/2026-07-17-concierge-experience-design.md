# Summerhouse Concierge Experience Design

**Date:** 2026-07-17  
**Status:** Ready for user review  
**Scope:** Replace the About testimonial chapter with a scroll-driven Concierge preview, add a dedicated Concierge page, expose it in the footer, and move suitable guest testimonials to a Concierge placement in the existing moderation system.

## 1. Objective

Show that a Summerhouse stay includes thoughtful guest support beyond the villa without making unverified luxury-service claims. The experience must preserve the restrained Summerhouse identity while closely following the supplied editorial references:

- About reference start: `Screenshot 2026-07-17 160809.png`
- About reference end: `Screenshot 2026-07-17 160821.png`
- Concierge catalogue: `Screenshot 2026-07-17 161327.png`
- Concierge testimonials: `Screenshot 2026-07-17 161349.png`

The public information architecture becomes:

- **About:** who Summerhouse is and how it approaches hospitality.
- **Villas:** where guests discover and book a home.
- **Services:** property-management services for villa owners.
- **Concierge:** what guests receive beyond the villa.

Concierge remains outside the main navbar. It is discoverable through the About preview and footer.

## 2. Truthful Service Scope

Only services already supported by existing Summerhouse copy and contact flows may be presented. The initial service set is:

1. Villa Matching
2. Arrival & Airport Support
3. Private Drivers
4. Dining & Reservations
5. Local Itinerary Planning
6. Long-Stay Setup
7. Home Readiness
8. In-Stay Guest Support

The site must not advertise private jets, hotel reservations, event tickets, private chefs, wellness treatments, babysitting, or other unsupported services. Copy should use careful wording such as “our team can help coordinate” where Summerhouse assists through trusted partners.

## 3. About Page Concierge Chapter

### 3.1 Placement

The current About testimonial section is removed and replaced in the same position, immediately before the FAQ. About no longer fetches or owns testimonial state.

### 3.2 Desktop composition

The section follows the first two references as a single connected horizontal track:

1. Fixed-width introduction panel.
2. Five large featured service cards.
3. Closing quote and CTA panel.

Visual rules:

- Pale cool-grey canvas.
- Navy editorial serif headings.
- Coral eyebrow, index numbers, and small rules.
- White square frames around imagery.
- Square card geometry with no decorative rounded corners.
- Minimal shadow; hierarchy comes from scale, spacing, and image contrast.
- Intro panel occupies roughly 30–34 viewport widths percent.
- Service cards occupy roughly 42–48 viewport widths percent.
- Closing panel is wide enough to hold a large quote and CTA without crowding.

Proposed copy direction:

- Eyebrow: `CONCIERGE`
- Heading: `More than a villa. Your Bali stay, thoughtfully arranged.`
- CTA: `View all Concierge`
- CTA route: `/concierge`

The five featured cards are selected through CMS. Initial defaults are Arrival & Airport Support, Private Drivers, Dining & Reservations, Local Itinerary Planning, and In-Stay Guest Support.

### 3.3 Desktop motion

Vertical scrolling drives horizontal translation:

1. The section pins when it reaches the stable viewport start position beneath the fixed navbar.
2. Continued vertical scroll translates the horizontal track from the intro panel to the final CTA panel.
3. Motion uses GSAP ScrollTrigger with a restrained scrub value and no automatic carousel timer.
4. The section unpins only after the final panel is completely legible.
5. Scroll distance is derived from actual track width so it remains correct across desktop sizes.
6. Resize and image-load refreshes must not leave stale ScrollTrigger measurements.

No mandatory snap is used on desktop because hard snapping would make the reference motion feel less natural.

### 3.4 Responsive and accessibility behavior

- **Desktop, 1024px and above:** pinned vertical-to-horizontal scroll.
- **Tablet, 721–1023px:** native horizontal scrolling with scroll-snap cards; no long pinned chapter.
- **Mobile, 720px and below:** one-column editorial sequence. Intro, cards, and final CTA remain in reading order and use normal vertical scroll.
- **Reduced motion:** no pinning, scrub, or parallax. Content renders as a readable overflow/stack layout.
- All images have meaningful alt text.
- Track content remains keyboard reachable.
- The page cannot gain horizontal document overflow.

## 4. Concierge Page

### 4.1 Route and discovery

- New route: `/concierge`
- Footer link: `Stay → Concierge Services`
- Main navbar remains unchanged.
- The route is added to sitemap metadata.

### 4.2 Page sequence

1. Existing global navbar.
2. Editorial catalogue intro.
3. Concierge service catalogue.
4. Concierge testimonial chapter.
5. Minimal booking action.
6. Existing global footer.

### 4.3 Catalogue design

The page follows the third reference:

- Pale cool-grey full-page background.
- Editorial title at upper left and short positioning copy at upper right.
- Three-column white-framed grid on desktop.
- Two columns on tablet and one column on mobile.
- Each item includes a dominant image, coral index, navy serif title, and concise supporting copy.
- Image ratios and card heights remain consistent within each breakpoint.
- Cards do not open empty detail routes in this release. The catalogue is informational and leads toward the final booking action.

The grid displays all active services ordered by `display_order`. If fewer than three services are available, the remaining space is left intentional rather than duplicating content.

### 4.4 Concierge testimonials

The testimonial chapter follows the fourth reference:

- Dashed editorial grid.
- Section title and guest portrait in the left column.
- Large quote in the right area.
- Trust label and compact avatar stack above the quote.
- Previous/next circular controls and `current / total` counter.
- No autoplay. Guests control navigation.
- Swipe gesture is supported on touch devices.

Only approved guest reviews explicitly placed on Concierge are eligible. Owner testimonials remain exclusive to the Services page.

### 4.5 Final booking action

The page does not end with a generic conversion banner. After the testimonial chapter, the layout provides deliberate negative space and one action only:

- Button label: `Book Now`
- Destination: `/villas`
- No headline, description, eyebrow, icon row, WhatsApp link, email link, gradient, decorative blob, or secondary action.
- The button aligns to the editorial grid and reuses the established Summerhouse button interaction so it feels like part of the site rather than a standalone marketing component.

## 5. Visual Asset Strategy

The current `public/homepage_villa` library is strong for villas but does not cover the full guest-service narrative. Implementation follows the image-to-code workflow:

1. Generate a cohesive visual reference using the supplied screenshots as composition targets.
2. Generate or select a restrained set of Summerhouse-specific editorial images for the eight truthful services.
3. Keep subjects, lighting, palette, crop, and grain consistent across the set.
4. Store final optimized assets under `public/concierge/`.
5. Use Next Image with truthful alt text, responsive sizes, and lazy loading below the fold.

Generated imagery must not contain third-party trademarks or imply services outside the approved list.

## 6. Frontend Architecture

New focused units:

- `components/about/sections/ConciergeHorizontalStory.tsx`
- `components/about/sections/ConciergeHorizontalStory.module.css`
- `app/concierge/page.tsx`
- `components/concierge/ConciergePageContent.tsx`
- `components/concierge/ConciergePageContent.module.css`
- `components/concierge/ConciergeCatalogue.tsx`
- `components/concierge/ConciergeTestimonials.tsx`
- `lib/concierge.ts` for frontend types, fallbacks, and normalization

Existing units changed:

- `app/about/page.tsx` fetches featured Concierge services instead of About testimonials.
- `components/about/About.tsx` removes testimonial mapping, timer, navigation state, and review markup, then renders the Concierge preview.
- `components/common/Footer.tsx` adds the Concierge footer link.
- `app/sitemap.ts` includes `/concierge` when routes are enumerated manually.
- `lib/cms.ts` adds typed Concierge service fetchers while continuing to use `getCmsTestimonials("concierge")`.

The horizontal chapter and full catalogue consume the same normalized service shape. No service copy is duplicated inside component markup.

## 7. CMS and Backend Architecture

### 7.1 Concierge services

Create `concierge_services` with:

- `id`
- `title`
- `slug`
- `summary`
- `image`
- `alt_text`
- `display_order`
- `featured_on_about`
- `is_active`
- timestamps

Create:

- `App\Models\ConciergeService`
- `ConciergeServiceResource` under `Content Library`
- List, create, and edit Filament pages
- Public CMS endpoint returning active ordered records

Filament rules:

- Title, summary, image, and alt text are required before activation.
- At most five active records may be featured on About.
- Reordering affects both About and Concierge responses.
- Deactivating a record removes it from both public surfaces after cache invalidation.

### 7.2 Concierge page manager

Add `ConciergePageManager` under `Website Pages`. Unlike untouched placeholder pages, this page receives only fields needed by this approved feature:

- About preview eyebrow, heading, and description
- Catalogue eyebrow, heading, and intro
- Testimonial eyebrow and heading

The service catalogue itself remains in `ConciergeServiceResource` so copy fields and repeated service records are not mixed.

### 7.3 Testimonial placement migration

Extend the current testimonial system rather than creating a second testimonial table:

- Add `show_on_concierge` boolean, default false.
- Add `PLACEMENT_CONCIERGE` to `Testimonial`.
- Include `concierge` in cache invalidation.
- Add Concierge placement controls, table labels, and filters in `TestimonialResource`.
- Add a Concierge branch in `ReviewRepository::featuredTestimonials()` that accepts only guest reviews.
- `/v1/cms/testimonials/concierge` returns the existing compact public testimonial card shape.

Migration behavior:

- Existing rows with `show_on_about = true` are copied to `show_on_concierge = true` so approved content is not lost.
- The About placement control is removed from Filament after migration.
- The physical `show_on_about` column remains for one release as a rollback safety measure but is no longer read by the frontend.
- No owner testimonial is automatically migrated to Concierge.

### 7.4 Cache and failure behavior

- Service create/update/delete/restore operations invalidate Concierge catalogue and About-featured caches.
- Testimonial changes invalidate Concierge testimonial cache.
- Frontend CMS fetch failures use a small truthful fallback service set and hide the testimonial chapter if no approved reviews are available.
- Empty service responses still render the page intro and the single `Book Now` action.
- Broken image records are not exposed by the public endpoint when active validation fails.

## 8. Content and Interaction Rules

- Use `Concierge`, not `Conciarage`, in routes, labels, metadata, and copy.
- Use concise benefit-led service descriptions.
- Do not claim guaranteed availability; requests are coordinated and confirmed by the team.
- “View all Concierge” is retained on the About CTA to stay close to the reference, while footer copy uses the clearer “Concierge Services.”
- The Concierge page closes with only `Book Now` linking to `/villas`; no additional conversion copy or contact action is permitted.
- Testimonial navigation is manual and accessible.
- The fixed navbar must not cover the pinned chapter heading at section entry.

## 9. Verification

### Frontend

- TypeScript typecheck.
- Production Next.js build.
- Desktop Playwright screenshots at 1440×1000 for About start, middle, and final horizontal states.
- Concierge catalogue and testimonial screenshots at desktop, tablet, and 390px mobile.
- Confirm no horizontal document overflow.
- Confirm all Concierge images load and use expected crops.
- Confirm reduced-motion layout contains all content with no pinned behavior.
- Confirm keyboard order and visible focus controls.
- Confirm footer discovery and `/concierge` metadata.

### Backend and CMS

- PHP lint for all changed files.
- Filament route discovery.
- Feature tests for active/ordered Concierge service API responses.
- Test maximum-five featured rule.
- Test testimonial migration from About to Concierge.
- Test Concierge repository returns guest reviews only.
- Test inactive, draft, hidden, owner, and unplaced testimonials never appear.
- Test service and testimonial cache invalidation.

## 10. Acceptance Criteria

- About testimonial UI and its client state are removed.
- Desktop About scroll produces the connected pinned horizontal sequence shown in references one and two.
- Mobile and reduced-motion variants remain readable and controllable.
- `/concierge` closely matches the catalogue and testimonial references while using Summerhouse branding and truthful services.
- Footer exposes Concierge and navbar remains unchanged.
- CMS can manage Concierge page copy, service records, featured About cards, ordering, activation, and Concierge testimonial placement.
- Existing testimonial moderation, villa reviews, and Services owner testimonials continue to work.
- Typecheck, build, backend tests, route discovery, and visual regression checks pass.
