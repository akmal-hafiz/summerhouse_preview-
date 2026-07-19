# Homepage Villa and Trust Redesign

Date: 2026-07-19
Status: Approved for implementation

## 1. Objective

Improve the homepage product discovery and trust flow without making the page feel heavier.

The redesign must:

1. Show six villas in each of Short Stays, Extended Stays, and Featured Homes.
2. Remove the duplicated Featured Collection section.
3. Preserve and migrate the strongest Featured Collection visual patterns into the three stay categories.
4. Replace Featured Collection with the same testimonial experience used on the Concierge page.
5. Add verified award social proof to the Most Exclusive Stay when award metadata exists.
6. Keep homepage data, image, animation, and browser performance within the current production standard.

## 2. Confirmed Product Decisions

### 2.1 Stay categories

The existing three tabs remain:

1. Short Stays
2. Extended Stays
3. Featured Homes

Each active category targets six unique active villas. The current manually selected villas remain first and keep their saved order. If a category has fewer than six configured villas, the frontend data layer fills the remaining positions from active Lodgify properties using the category-specific ranking strategy.

No villa is duplicated inside one category. If fewer than six valid active villas exist, the component renders the available villas without fabricating records.

### 2.2 Featured Collection removal

Featured Collection is removed from the desktop and mobile homepage after its card primitives and styling have been migrated.

Removal includes:

- Homepage render calls.
- Desktop and mobile props.
- The separate `getHomepageFeaturedVillas` request from `app/page.tsx`.
- The Featured Collection tab in Homepage CMS.
- Unused Featured Collection component code after migration.

Existing Featured Collection database records are not deleted. This keeps rollback possible and avoids destructive data changes.

### 2.3 Testimonials

Homepage and Concierge display the same approved Concierge testimonial records.

Both pages call the existing Concierge testimonial flow:

`getCmsTestimonials("concierge")`

There is no new testimonial placement, table, CMS field, or moderation path. The testimonial presentation is extracted from `ConciergePageContent` into one shared component so both pages remain visually and behaviorally consistent.

### 2.4 Award social proof

The Most Exclusive Stay may show an Editorial Award Credential only when verified award metadata is present.

The credential contains:

- Award name.
- Issuer.
- Year.
- Optional verification URL.
- Optional approved logo.
- Visibility toggle.

The credential is attached to the selected Signature Villa record, not stored as generic homepage copy. Switching the Signature Villa must not transfer an unrelated award claim to another property.

If metadata is incomplete, unverified, or disabled, the award credential is hidden. The interface never invents a generic award claim.

## 3. Stay Category Visual Design

### 3.1 Desktop editorial 1+5 mosaic

The active category uses a twelve-column dense grid.

- Villa 1 is the lead property and spans seven columns across two rows.
- Villas 2 and 3 each span five columns and one row on the right.
- Villas 4, 5, and 6 each span four columns in the final row.

This creates six intentional positions with no empty grid cells.

The lead property inherits the Featured Collection large-card treatment:

- Large image stage.
- Location label.
- Villa title and price.
- Concise description.
- Guest, bedroom, and bathroom facts.
- Restrained image transition on hover.

Secondary properties inherit the compact Featured Collection card language, adapted for the right stack and final three-card row.

### 3.2 Tablet

Tablet uses a two-column grid with six balanced cards. The visual hierarchy is reduced to protect readability and prevent awkward height differences.

### 3.3 Mobile

Mobile does not use a horizontal carousel.

It uses:

- One full-width lead card.
- Five compact vertical editorial rows.

Every villa remains visible through normal page scrolling. There is no hidden swipe requirement and no document-level horizontal overflow.

### 3.4 Tab behavior

Automatic five-second category switching is removed. Tabs change only after user interaction.

Tab changes use:

- A shared active indicator.
- A short opacity and vertical transition.
- Stable section height handling.
- Keyboard-accessible tab semantics.
- Immediate state changes under reduced-motion preferences.

## 4. Shared Testimonial Design

Extract the testimonial chapter into a shared `GuestStoriesSection` component.

Responsibilities:

- Accept normalized `CmsTestimonial[]` data.
- Own the active testimonial index.
- Render the editorial portrait and quote grid.
- Provide previous and next controls.
- Provide the same truthful fallback used by Concierge when CMS data is unavailable.
- Support a homepage and Concierge placement class without duplicating markup.

The component preserves the current Concierge design:

- Pale editorial background.
- Navy serif quote typography.
- Dashed structural grid.
- Portrait panel.
- Guest trust marker.
- Manual controls with no autoplay.

Homepage placement is after Most Exclusive Stay and before Explore Bali.

## 5. Award Credential Design

The award treatment is an editorial credential, not a floating promotional badge.

Placement:

- Within the Signature Villa information column near `Why this home`.
- Outside the primary image crop.

Visual treatment:

- Thin rule or bordered strip.
- Small monochrome seal or laurel symbol.
- Award name as the primary line.
- Issuer and year as supporting metadata.
- Optional source link with a clear accessible label.

The credential must feel like provenance, not advertising. It must not cover villa imagery or compete with the villa title.

## 6. Data Architecture

### 6.1 Six-villa resolution

`getHomepageStayGroups` remains the single homepage source for all three categories.

For each category:

1. Read CMS-selected property IDs in saved order.
2. Resolve active selected properties.
3. Build a set of seen property IDs.
4. Append ranked active fallback candidates until six unique properties are available.
5. Fetch room facts only for the final selected candidates.
6. Normalize them into `HomepageStayVilla` records.

Ranking remains category-specific:

- Short Stays favors lower entry price and flexible active properties.
- Extended Stays favors active villas in suitable long-stay areas and then higher-comfort inventory.
- Featured Homes favors the strongest premium active properties.

The CMS repeaters allow a maximum of six villas per category and explain the automatic fallback behavior.

### 6.2 Request and cache strategy

Performance controls:

- Remove the separate Featured Collection fetch, offsetting much of the added category data.
- Deduplicate property IDs before room requests.
- Reuse request-level promises when the same villa appears across categories.
- Keep Lodgify room responses under the existing one-hour revalidation policy.
- Fetch only normalized facts needed by the active homepage catalogue.
- Avoid fetching additional image endpoints for stay cards when existing property and room data already provide the image set.

### 6.3 Image strategy

- Only the first visible lead image may use priority loading.
- Non-visible tab images remain lazy-loaded.
- Secondary images use responsive `sizes` values matching the actual grid width.
- Hover slideshows start only on pointer-capable desktop devices.
- Mobile cards do not run continuous background slideshows.
- Image containers keep stable aspect ratios to prevent layout shift.

## 7. Component Boundaries

Planned structure:

```text
app/page.tsx
  DesktopHomepage
    StayStylesShowcase
      StayCollectionGrid
        StayLeadCard
        StayCompactCard
    SignatureVillaSpotlight
      AwardCredential
    GuestStoriesSection
    ExploreBaliBookSection

  MobileHomepage
    Same data and shared presentation primitives
```

Featured Collection styling is migrated into focused CSS modules associated with the new stay collection components. The implementation must not leave a second dead copy of the same card system in global CSS.

## 8. CMS Changes

Homepage Manager changes:

- Stay category repeaters support a maximum of six ordered villas.
- Helper text explains that active villas fill unconfigured positions.
- Featured Collection tab is removed after migration.
- Signature Villa rows receive optional award metadata fields.

No testimonial CMS changes are made.

## 9. Motion and Accessibility

- Category transitions never trap scroll or create document overflow.
- Hover scaling remains subtle and contained by overflow-hidden media wrappers.
- Testimonial controls use accessible button labels.
- Tabs use correct selected state and keyboard behavior.
- Award source links identify their destination.
- All motion has a reduced-motion path.
- No content depends solely on animation to become readable.

## 10. Failure and Empty States

- If CMS is unavailable, existing fallback selection logic produces up to six active villas per category.
- If a selected villa is missing from the bulk response, the existing individual property resolver attempts to retrieve it.
- If fewer than six valid villas exist, render fewer cards and keep the grid intentional.
- If Concierge testimonials are unavailable, use the existing truthful fallback testimonial.
- If award data is incomplete, hide the credential.

## 11. Verification

### 11.1 Automated

- TypeScript typecheck.
- Next.js production build.
- Backend PHP lint.
- Backend test suite.
- Data tests for six unique villas, configured order, fallback fill, and fewer-than-six behavior.
- Test that Homepage and Concierge both consume Concierge testimonials.

### 11.2 Browser QA

Test at approximately:

- 1440px desktop.
- 1024px compact desktop or tablet landscape.
- 768px tablet.
- 390px mobile.

Verify:

- Six villas per fully populated category.
- No empty mosaic cells.
- No horizontal document overflow.
- Stable layout during tab changes.
- Keyboard tab operation.
- Reduced motion.
- Lazy image loading and correct priority count.
- Shared testimonial data and controls.
- Award credential visibility rules.
- Zero console errors.

### 11.3 Performance acceptance

- Featured Collection request is absent.
- No duplicate room request is issued for the same villa during one homepage render.
- Only the first visible villa image is preloaded.
- Mobile does not start card slideshows.
- Cumulative layout shift is avoided through fixed media geometry.

## 12. Explicit Non-Goals

- No new testimonial placement or testimonial CMS workflow.
- No horizontal villa carousel.
- No fabricated award copy.
- No destructive deletion of historical Featured Collection selections.
- No redesign of Hero, Explore Bali, Navbar, or Footer in this scope.
