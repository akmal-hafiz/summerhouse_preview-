# About Section Hub CMS Design

Date: 2026-09-24
Status: Approved direction, pending written-spec review
Scope: About page CMS from Our Story through The Journal

## 1. Objective

Replace the current long About Page Manager form with a clear section hub. Each public About section must have its own editor, validation boundary, and save action. Admins must be able to understand what is live, edit one section without affecting another, and open the matching section on the public website.

The implementation must preserve the existing database sources and public data flow. It must not duplicate editorial content, villa data, FAQs, journal articles, or managed media.

## 2. Approved UX Direction

The selected direction is the Section Hub concept.

The Filament sidebar retains one `About` entry under `Website Pages`. Opening it shows an overview rather than the current full-page form. The overview contains one card for each managed public section in visual page order:

1. Our Story Hero
2. Trust and Recognition
3. Editorial Gallery
4. Booking Process
5. Concierge Story
6. FAQ
7. The Journal

Each card displays:

- section name and concise description;
- Live or Hidden status;
- last updated time;
- a content-completeness signal;
- an `Edit section` action;
- a `View on website` action using a stable public anchor.

The hub header displays the page title, live-section summary, and a `View About Page` action. There is no global `Save About Page` action.

## 3. Visual Language

The hub must feel consistent with Summerhouse and Filament without becoming a generic card dashboard.

- Use solid, readable surfaces with the existing neutral and green palette.
- Avoid glass effects, blurred backgrounds, unnecessary gradients, and translucent controls.
- Use spacing and typography to create hierarchy instead of decorative pills.
- Status treatments remain restrained and accessible. Color is supported by text, never used alone.
- Motion is limited to subtle hover and focus feedback and must respect reduced-motion settings.
- Desktop, laptop, tablet, mobile, keyboard navigation, and visible focus states are required.

## 4. Scope and Data Ownership

### 4.1 Managed sections

#### Our Story Hero

Editable content:

- heading;
- lead paragraph;
- supporting body copy;
- scroll cue;
- section visibility.

#### Trust and Recognition

Editable content:

- section heading;
- ordered trust pillars;
- pillar name, scope, description, stable key, and image;
- section visibility.

Automatic portfolio totals remain sourced from the villa system and are not editable.

#### Editorial Gallery

Editable content:

- section title and description;
- button label;
- left and right ordered image rails;
- managed image metadata required by the current upload flow;
- section visibility.

#### Booking Process

Editable content:

- heading and emphasis;
- ordered booking steps;
- step title, description, and images;
- closing copy and link label;
- section visibility.

#### Concierge Story

Editable content:

- heading and emphasis;
- description;
- quote;
- link label;
- section visibility.

#### FAQ

Editable content:

- FAQ section heading and action label;
- section visibility;
- About FAQ records through the existing FAQ model and page-scoped management flow.

The PageSection record owns the FAQ introduction only. FAQ entries remain in the FAQ table.

#### The Journal

Editable content:

- section heading;
- section visibility.

Journal cards remain automatic. The public component sorts published articles by publication date and displays up to four latest entries. Article content remains managed through the existing Journal resource.

### 4.2 Explicitly excluded

- Destination Footprint editing. Region names, coordinates, active villa counts, and map points remain automatic from eligible villa data.
- Final CTA editing in this phase because the approved scope stops at The Journal.
- Navbar, footer, site-wide settings, routes, accessibility implementation labels, and internal system messages.
- Homepage and Services implementation. Homepage will adopt the same hub shell in a later phase while preserving PageSection, HomepageVillaSelection, BaliCollection, testimonial, and villa data boundaries.

## 5. Architecture

### 5.1 Existing storage remains authoritative

The existing `page_sections` table remains the source for About editorial sections. Its unique database constraint on `(page, section)` prevents duplicate section records.

Existing sources remain separate:

- About editorial copy: `page_sections`;
- About FAQ entries: `faqs`;
- Journal articles: `articles`;
- gallery media references: PageSection JSON processed through managed media;
- destination facts and villa totals: eligible villa data.

No new content table and no mirrored content record will be introduced.

### 5.2 Hub and editor states

`AboutPageManager` becomes a two-state Filament page:

- Hub state with no selected section.
- Editor state with one allowlisted section selected through a stable query value.

Using one Filament page avoids seven almost identical page classes while still guaranteeing that each editor loads and saves only one section. Browser history and direct editor links remain usable.

An internal section registry defines each allowed key, display label, description, order, public anchor, completeness rules, defaults, and form schema. Unknown section keys are rejected and return to the hub with a safe error notification.

### 5.3 Public anchors

Each managed public section receives a stable HTML `id`:

- `our-story`
- `trust-recognition`
- `editorial-gallery`
- `booking-process`
- `concierge`
- `faq`
- `journal`

Admin preview actions open `/about#<anchor>` in a new tab. The global action opens `/about`.

## 6. Save Flow and Consistency

Each editor loads one PageSection record and stores the record's `updated_at` timestamp with the form state.

Saving follows this flow:

1. Confirm the selected section key is in the About registry.
2. Validate only the selected section schema.
3. Start a database transaction.
4. Lock the current PageSection row for the duration of the write.
5. Compare the stored editor timestamp with the current row timestamp.
6. If the record changed after the editor opened, stop the save and ask the admin to reload rather than silently overwriting another admin's work.
7. Use `updateOrCreate` with the fixed `page=about` and allowlisted section key.
8. Commit the transaction.
9. Let PageSection model events invalidate the page and section cache keys.
10. Show a clear success notification and refresh the editor timestamp.

The save operation is idempotent. Submitting the same valid content twice updates the same record and cannot create a duplicate.

FAQ entry operations continue through the existing FAQ management concern and model cache hooks. Journal article operations continue through the Article resource and Article model cache hooks.

## 7. Cache and Public Rendering

About editorial requests remain uncached on the Next.js side. A successful save must therefore be visible on the next public request.

Laravel may retain its existing five-minute API cache because PageSection model events invalidate both:

- `cms.page.about`;
- `cms.page.about.<section>`.

The implementation must not add five-minute Next.js caching to About editorial sections. The five-minute frontend cache remains reserved for approved Lodgify-backed data and villa selections.

Public rendering keeps safe fallback copy when the CMS API is unavailable. A failed CMS request must not make the About page blank.

## 8. Managed Media Safety

All About image fields continue using `ManagedImageUpload` and `ManagedMediaService`.

- Accepted formats remain JPEG, PNG, and WebP.
- Upload size and parallel upload limits remain configuration-driven.
- Image orientation and managed processing remain enabled.
- Existing media remains available if a new staged upload fails.
- Physical deletion remains deferred because the same media reference may be used by more than one section.
- Section save failure must not replace the persisted media reference.

No direct filesystem path or arbitrary remote URL field is added to this CMS flow.

## 9. Validation and Error Handling

- All section keys use a server-side allowlist.
- Required fields, maximum lengths, repeater minimums and maximums, image counts, and file constraints are enforced server-side.
- Empty optional copy is normalized consistently rather than stored as mixed empty strings and null values.
- Public URLs are fixed by the application or validated before persistence.
- A validation error stays in the current editor and identifies the relevant field.
- A persistence error leaves the previous database content untouched and emits a concise admin notification.
- Concurrent edits produce a conflict warning and do not silently overwrite newer content.
- Missing section rows load approved defaults and create exactly one record on first save.
- Visibility changes affect only the selected section.

## 10. Content Migration

Existing PageSection content is reused in place. No destructive migration is needed.

Before switching the manager UI, the implementation will inventory meaningful public copy in the included About components. Any included editorial copy still hard-coded in React is added to the matching section schema and seeded only when that field is absent. Existing admin values always win.

Fallback content remains in the frontend for outage resilience, but it is not a second editable source of truth.

## 11. Testing and Verification

### Backend feature coverage

- hub loads all seven allowlisted sections in the correct order;
- unknown section keys are rejected safely;
- editor loads only the selected section;
- saving one section does not change any other section;
- first save creates one record;
- repeated saves do not create duplicates;
- the database unique constraint remains effective;
- visibility toggles affect only the selected section;
- model events invalidate page and section cache keys;
- concurrent stale writes are rejected;
- validation prevents malformed repeater and media data;
- FAQ management remains page-scoped;
- Journal editor does not duplicate article data.

### Frontend coverage

- all seven public anchors exist;
- CMS copy replaces fallback copy when available;
- hidden sections do not render;
- missing CMS data uses the existing fallback;
- Journal sorts published articles by date and limits the preview to four;
- Destination Footprint continues to use automatic villa data.

### Required release checks

- relevant Laravel feature tests using PHP 8.4;
- frontend type checking;
- production Next.js build;
- browser QA for the Filament hub and all section editors;
- public About QA at desktop, laptop, tablet, and mobile widths;
- keyboard and visible-focus testing;
- reduced-motion verification;
- save, reload, preview, visibility, concurrent-edit, failed-upload, and backend-offline scenarios.

## 12. Rollout

1. Add registry, hub, and section-level editor behavior without changing storage.
2. Add stable public anchors.
3. Add missing editorial field mappings using non-destructive defaults.
4. Add backend and frontend tests.
5. Run the complete verification suite.
6. Inspect existing production-like About content before deployment.
7. Deploy without deleting PageSection, FAQ, Article, or media records.
8. Confirm each editor and public anchor in production.

The existing About content remains recoverable throughout rollout because this design changes the management interface and save boundary, not the underlying content ownership.

## 13. Future Homepage Adoption

After About is verified, the Section Hub shell may be reused for Homepage. Homepage storage remains unchanged:

- editorial copy in PageSection;
- villa placement in HomepageVillaSelection;
- destination editorial data in BaliCollection;
- reviews in the testimonial system;
- villa facts and eligibility in the Lodgify-backed villa cache.

Homepage editors will use section-level transactions appropriate to their owned tables. Editorial copy stays immediate while Lodgify-backed selections may retain the approved five-minute cache.
