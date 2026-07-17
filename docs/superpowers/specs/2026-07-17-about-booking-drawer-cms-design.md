# About Booking Process, Mobile Drawer, and CMS Organization

## Goal

Deliver three coordinated improvements without changing unrelated page behavior:

1. Replace the About page Services list with a booking-process section that closely follows the supplied Swiss editorial reference.
2. Improve the mobile navigation drawer glass treatment and remove the black square around the hamburger control.
3. Organize the Filament CMS navigation by website page and add empty page placeholders without adding working content fields yet.

## Confirmed Scope

- The booking-process section replaces `ServicesList` on the About page.
- The section uses existing images from `public/`; no external stock image URLs are introduced.
- Booking copy follows the implemented product flow rather than the generic travel copy in the visual reference.
- Existing frontend booking, Lodgify, authentication, CMS API, and checkout behavior remain unchanged.
- CMS page placeholders are intentionally empty. No placeholder receives copy fields, persistence, or frontend wiring until explicitly requested later.
- Existing user changes and unrelated dirty-worktree files remain untouched.

## Booking Flow Content

The section communicates the real application flow:

1. **Discover your villa** — browse the villa collection and find a suitable home.
2. **Choose your dates** — select dates and inspect live availability.
3. **Confirm your stay** — review details and continue to secure Lodgify checkout.
4. **Arrive with ease** — booking is confirmed, with the Bali team available when needed.

The primary CTA is **Explore villas** and routes to `/villas`.

## Visual Design

The supplied reference and generated extraction reference define the section:

- warm mist-gray/ivory full-width background;
- three-column editorial grid on desktop;
- header occupies the center cell of the first row;
- an outlined three-circle motif occupies the left middle cell;
- four process cells use step number, small progress dots, stacked villa-image polaroids, title, and concise supporting copy;
- the final cell contains a short invitation and outlined CTA;
- pale dashed dividers define the grid without card backgrounds or rounded wrappers;
- deep navy display text, muted charcoal body copy, and restrained coral eyebrow accent;
- generous negative space and controlled image sizes match the reference composition.

Responsive behavior:

- desktop: exact three-column editorial composition;
- tablet: two-column grid while retaining divider rhythm;
- mobile: one-column story with header first, circle motif reduced, ordered steps, and final CTA; no horizontal overflow.

Motion remains restrained: reveal/fade and small polaroid drift only, disabled for `prefers-reduced-motion`.

<design_plan>
Python RNG execution:
seed=131 -> hero_architecture='editorial offset composition', typography='Outfit'
components=['off-grid editorial layout','layered image crop frames','vertical rhythm lines']; motion=['staggered float-up energy','parallax image drift energy']
scope_override='single About section; preserve supplied Swiss grid instead of redesigning the whole page'

AIDA check: existing navbar and About hero retain Attention; booking grid supplies Interest and Desire; `/villas` CTA supplies Action; existing footer remains unchanged.

Hero math verification: no new page hero is introduced. Booking headline uses a wide center grid cell and `clamp()` sizing, limited to two lines. No stamps, pills, or decorative technical tags.

Bento density verification: desktop grid is 3 columns × 3 rows = 9 cells. Header, circle motif, four process cells, CTA cell, and two intentional open composition cells account for the complete reference layout. CSS grid explicitly defines every occupied cell; there are no accidental gaps and no nested cards.

Label and button check: only truthful `BOOKING PROCESS` and `STEP 01–04` labels are used because they are part of the supplied reference. CTA is navy text/border on ivory with clear hover contrast.
</design_plan>

## Image Selection

Use small paired crops from existing villa imagery in `public/homepage_villa/`. Preferred assets:

- `curated-1-main.webp`
- `curated-2-detail.webp`
- `curated-3-corner.webp`
- `curated-4-pool.webp`
- `curated-5-lounge.webp`
- `curated-6-exterior.webp`
- `rumahmimosa.webp`
- `villaarta.webp`

Each step uses two overlapping framed images. Images are decorative and receive empty alt text; the step text carries meaning.

## Mobile Drawer Fix

Root components remain `MobileNavigationMenu`, `LiquidDropdownSurface`, and the existing navbar CSS.

Changes:

- strengthen the full-viewport backdrop with blur and a subtle warm neutral wash;
- increase drawer material opacity, saturation, edge highlight, and shadow until it matches the mobile hero search glass language;
- preserve background context while making underlying text unreadable enough not to compete with menu links;
- remove native `summary` marker/appearance and any inherited black background on open/focus states;
- provide an intentional transparent/soft glass focus ring rather than a black square;
- keep body scroll lock, Escape close, outside-click close, focus trapping, and focus restoration unchanged;
- keep the language control and CTA legible at the bottom of the drawer.

## Filament CMS Organization

Reorganize existing navigation into clear page-oriented groups:

- **Website Pages**
  - Homepage — existing functional `HomepageManager`
  - About — empty placeholder page
  - Services — empty placeholder page
  - Contact — empty placeholder page
  - Villas — empty placeholder page
  - Gallery — empty placeholder page
  - Journal — empty placeholder page
- **Content Library** — existing Articles, Bali Collections, Gallery Items, Media, Testimonials, FAQs, and Service Cards resources, with no field changes.
- **People & Enquiries** — existing Users and Contact Submissions resources.
- **Settings** — existing Site Settings page.

Placeholder rules:

- each placeholder clearly states that page controls will be added later;
- no form schema, model, migration, database key, save action, seed data, or frontend API wiring is added;
- placeholders must not imply that content is currently editable;
- future implementation can add fields one page at a time without restructuring the sidebar again.

## Files Expected to Change

- `components/about/About.tsx`
- `components/about/sections/ServicesList.tsx` (replace or rename to booking-process component)
- `components/about/sections/ServicesList.module.css` (replace or rename)
- `components/common/Navbar.tsx` only if semantic state classes are needed
- `app/globals.css`
- Filament page/resource classes under `backend/app/Filament/`
- one reusable empty Filament view/page class if it reduces duplication

## Validation

- Run `npm run typecheck` and `npm run build`.
- Test About page at desktop, tablet, and mobile widths.
- Compare the section against both the supplied reference and generated section reference.
- Verify image loading and no horizontal overflow.
- Verify drawer open/close, Escape, outside click, Tab trap, body scroll lock, and hamburger focus/open styling.
- Run relevant PHP syntax checks for changed Filament classes.
- Confirm existing CMS resources retain fields and persistence unchanged.
- Confirm placeholder pages contain no form controls or save actions.

## Non-Goals

- No new CMS content fields.
- No CMS database migrations.
- No changes to booking APIs, Lodgify credentials, authentication, or checkout behavior.
- No redesign of other About sections.
- No GitHub push or deployment in this task unless requested separately.
