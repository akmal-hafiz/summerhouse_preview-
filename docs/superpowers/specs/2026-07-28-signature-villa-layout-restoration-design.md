# Signature Villa Layout Restoration

## Goal

Restore the previous Signature Villa layout while preserving the client-approved copy, data, and functionality already implemented.

## Scope

The change is limited to `SignatureVillaSpotlight` and the CSS rules that control its desktop and mobile composition.

No CMS schema, Lodgify mapping, database migration, villa selection logic, or homepage section order will change.

## Layout

### Desktop

Reproduce the approved reference composition:

- Use a full-width title header followed by location metadata and a thin divider.
- Keep the villa name and location in the header only.
- Use three open editorial columns below the divider.
- The left column occupies about 34 percent of the content width and contains one tall portrait image.
- The center column occupies about 31 percent and contains a landscape image above an open `Key features` block.
- The right column occupies the remaining width and contains open distinctive copy above a landscape image.
- Use generous negative space and approximately 20 pixel media radii.
- Content areas must not use white cards, borders, or nested panel styling.
- Preserve the reference alignment, with the landscape images positioned lower than the start of the portrait image.

### Mobile

Restore the previous vertical sequence and spacing:

- Villa name.
- Location metadata directly below the name.
- Primary image.
- Supporting image.
- Distinctive copy.
- Feature information.
- Final supporting image.

The mobile layout must retain the existing responsive behavior, approximately 20 pixel media radii, generous vertical spacing, and reduced-motion support.

## Content

Keep the current client-approved content:

- Villa name appears once as the primary title.
- Location appears as small metadata directly below the villa name.
- `Key features` uses normalized Lodgify amenities and capacity facts.
- `What makes it distinct` uses the current CMS-backed editorial copy.
- `View this stay` remains the only action inside the section.
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

- Desktop composition matches the approved reference geometry at 1440 and 1600 pixel widths.
- The portrait image is visibly taller than both supporting images.
- The center and right supporting images use consistent landscape proportions.
- Feature and distinctive copy areas remain visually open without card containers.
- Mobile composition follows the previous section order.
- Location is visible only as small metadata below the villa name.
- New client-approved copy remains unchanged.
- No pricing or redundant labels return.
- TypeScript typecheck and production build pass.
- Desktop and mobile browser QA show no overlap, clipping, or console errors.
