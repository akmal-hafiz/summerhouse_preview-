# About Section Hub Implementation Plan

## Goal

Implement the approved About Section Hub without changing content ownership or deleting existing CMS data.

## Task 1: Lock the About section contract

Files:

- `backend/app/Filament/Pages/AboutPageManager.php`
- `backend/tests/Feature/AboutSectionHubTest.php`

Work:

- Define the seven allowed section keys, order, labels, descriptions, icons, public anchors, defaults, and completeness rules.
- Reject unknown section query values.
- Add tests for order and allowlisting.

## Task 2: Change the manager from one long form to hub plus selected editor

Files:

- `backend/app/Filament/Pages/AboutPageManager.php`
- `backend/resources/views/filament/pages/about-page-manager.blade.php`
- `backend/public/css/about-section-hub.css`
- `backend/app/Providers/Filament/AdminPanelProvider.php` only if an asset registration change is needed

Work:

- Render hub mode when no section is selected.
- Render only one section form when a valid section is selected.
- Keep the FAQ table visible only inside the FAQ editor.
- Add public page and public section preview links.
- Add responsive solid-surface styling, keyboard focus, and reduced-motion rules.

## Task 3: Add independent and conflict-safe persistence

Files:

- `backend/app/Filament/Pages/AboutPageManager.php`
- `backend/tests/Feature/AboutSectionHubTest.php`

Work:

- Load only the selected section into form state.
- Track the loaded row timestamp.
- Validate only the selected section.
- Save inside a transaction with a row lock.
- Reject stale concurrent edits.
- Save through the existing unique `(page, section)` boundary.
- Confirm PageSection model events invalidate the page and section cache keys.

## Task 4: Complete public section mapping

Files:

- `components/about/About.tsx`
- `components/about/JournalPreviewSection.tsx`
- relevant files under `components/about/sections/`
- frontend tests under `tests/`

Work:

- Add stable IDs for all seven managed sections.
- Inventory included editorial copy and connect missing fields to CMS content.
- Preserve safe frontend fallbacks.
- Keep Destination Footprint automatic.
- Keep Journal articles automatic and limited to four latest published entries.

## Task 5: Preserve media and related-resource boundaries

Files:

- `backend/app/Filament/Pages/AboutPageManager.php`
- existing managed media and FAQ code only where a confirmed defect requires it

Work:

- Continue using ManagedImageUpload.
- Keep FAQ records in the FAQ model.
- Keep articles in the Article resource.
- Add contextual links from FAQ and Journal editors without copying their records into PageSection JSON.

## Task 6: Verification

Backend:

- Run the new AboutSectionHub feature tests.
- Run existing EditorialPageManagers and PageFaqManagement tests.
- Run related media tests if modified.

Frontend:

- Run focused About tests.
- Run TypeScript checking.
- Run the production Next.js build.

Browser QA:

- Inspect the hub at desktop, laptop, tablet, and mobile widths.
- Open every section editor.
- Save and reload one section without changing neighbors.
- Verify preview anchors.
- Verify keyboard focus and reduced motion.
- Verify public About content and Destination Footprint remain correct.

## Task 7: Final review

- Review the complete diff for unrelated changes.
- Confirm no user-owned worktree changes were overwritten.
- Report implementation, rationale, tests, and any production-only follow-up.
