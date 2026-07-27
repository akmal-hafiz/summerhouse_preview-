# Signature Villa Layout Restoration

## Goal

Restore the previous Signature Villa layout while preserving the client-approved copy, data, and functionality already implemented.

## Scope

The change is limited to `SignatureVillaSpotlight` and the CSS rules that control its desktop and mobile composition.

No CMS schema, Lodgify mapping, database migration, villa selection logic, or homepage section order will change.

## Layout

### Desktop

Restore the previous bento composition:

- A left column containing the villa name, location metadata, and primary image.
- A wider right column containing two supporting images and two content areas.
- Preserve the original proportions, spacing, image radii, and visual hierarchy.
- Remove the current oversized location treatment from the main header.

### Mobile

Restore the previous vertical sequence and spacing:

- Villa name.
- Location metadata directly below the name.
- Primary image.
- Supporting image.
- Distinctive copy.
- Feature information.
- Final supporting image.

The mobile layout must retain the existing responsive behavior and reduced-motion support.

## Content

Keep the current client-approved content:

- Villa name appears once as the primary title.
- Location appears as small metadata directly below the villa name.
- `Key features` uses normalized Lodgify amenities and capacity facts.
- `What makes it distinct` uses the current CMS-backed editorial copy.
- Price is not shown.
- Redundant labels such as `Most Exclusive Stay`, `Why This Home`, and repeated property names remain removed.

## Functionality

Preserve:

- CMS-managed copy.
- Lodgify villa data.
- Automatic image slideshow.
- Villa detail links.
- Award and recognition rendering.
- Image fallbacks.
- Reduced-motion behavior.

## Acceptance Criteria

- Desktop composition visually matches the previous Signature Villa layout.
- Mobile composition follows the previous section order.
- Location is visible only as small metadata below the villa name.
- New client-approved copy remains unchanged.
- No pricing or redundant labels return.
- TypeScript typecheck and production build pass.
- Desktop and mobile browser QA show no overlap, clipping, or console errors.

