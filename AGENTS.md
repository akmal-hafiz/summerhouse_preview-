# Summerhouses project working rules

These rules apply to every Codex task opened from this repository.

## Required skills

- Read and use `using-superpowers` and `graphify` before investigating or changing project code.
- Use `image-to-code` and `gpt-taste` for visual polish, layout redesign, or reference-image replication.
- Use `brainstorming` before creative or behavioral changes when the design has not already been approved by the user.

## CMS and data boundaries

- Editorial CMS content must update immediately after it is saved.
- Only Lodgify-backed villa data, Stay Styles villa selections, and Signature Villa selections may use the five-minute cache.
- Keep Laravel cache invalidation and frontend cache behavior aligned.
- CMS media must retain managed upload processing, WebP conversion, dimension limits, fallback handling, and queue safety.

## Frontend quality

- Preserve the Summerhouse typography, color palette, copywriting, and established interaction language.
- When a reference image is supplied, copy only the requested visual behavior. Do not add unrelated controls, labels, copy, or features.
- Verify desktop, laptop, tablet, and mobile layouts. Include keyboard focus and reduced-motion behavior where interaction changes.
- Do not use em dashes in user-facing copy.

## Verification

- Run frontend type checking and a production build after frontend changes.
- Run the relevant Laravel feature tests after CMS or backend changes.
- Perform browser-based visual QA for layout work before reporting completion.
