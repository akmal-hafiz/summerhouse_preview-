# Lodgify B+ Stages 0 to 3 Implementation Plan

Date: 2026-09-12

Design: `docs/superpowers/specs/2026-09-12-lodgify-resilience-reconciliation-stages-0-3-design.md`

## Delivery Strategy

Implement in dependency order with a verification checkpoint after every task. Preserve all existing villa, review, wishlist, and homepage-selection records. No task may hard-delete Lodgify-linked data.

## Task 1: Establish the Stage 0 baseline

Files:

- Create `docs/operations/lodgify-property-baseline.md`

Steps:

1. Record the audited 44-property live inventory summary.
2. Record the five inactive properties and Bawa House as pending client confirmation.
3. Record stale admin-cache records and invalid homepage references found during the audit.
4. Define the allowed client-decision states.
5. Verify that every unresolved decision is explicit.

Checkpoint:

- Baseline contains no inferred client decision.
- No production data is modified.

## Task 2: Add frontend resilience primitives

Files:

- Create `lib/lodgify/errors.ts`
- Create `lib/lodgify/resilience.ts`
- Modify `lib/security/logger.ts`
- Modify `.env.example`

Steps:

1. Define typed Lodgify failure categories and safe metadata.
2. Add environment parsing with clamped defaults.
3. Add retry classification and exponential delay with jitter.
4. Add process-local circuit breaker states.
5. Add ordered bounded-concurrency mapping.
6. Add aggregated warning logging for handled batch failures.
7. Verify pure behavior with deterministic assertions.

Checkpoint:

- At most one retry is possible.
- `401`, `403`, and `404` are not retried.
- Concurrency never exceeds the configured limit.
- Secrets are excluded from log metadata.

## Task 3: Refactor the Next.js Lodgify transport

Files:

- Modify `lib/lodgify/client.ts`
- Modify `lib/lodgify/types.ts`
- Modify `lib/lodgify.ts`

Steps:

1. Replace generic HTTP errors with typed Lodgify errors.
2. Classify Undici connection timeouts and abort timeouts consistently.
3. Apply retry and circuit-breaker policy to live requests.
4. Preserve the existing five-minute property cache rule.
5. Return explicit availability fetch outcomes so failures are distinguishable from empty successful responses.
6. Keep expected property `404` events at notice level.
7. Aggregate room failures at the caller instead of logging every property as an error.

Checkpoint:

- A handled rooms timeout does not invoke `console.error`.
- Authentication failures remain visible as critical errors.
- Successful endpoint return types remain compatible with current callers or are migrated in the same task.

## Task 4: Implement safe search availability

Files:

- Modify `lib/lodgify/availability.ts`
- Modify `lib/lodgify/villas.ts`
- Modify `lib/lodgify/types.ts`
- Modify `components/villas/PremiumVillaCard.tsx`
- Modify `app/villas/Villas.module.css`

Steps:

1. Add a search-level availability reducer for `available`, `unavailable`, and `unknown`.
2. Preserve `unknown` when availability fetch fails or is incomplete.
3. Replace unbounded room `Promise.all` with bounded mapping.
4. Exclude only confirmed unavailable villas when dates are supplied.
5. Keep unknown villas visible with neutral copy.
6. Preserve the current no-date behavior without claiming live availability.
7. Add an accessible card status with existing Summerhouse styling.

Checkpoint:

- Timeout does not produce an empty villa collection.
- Unknown is never displayed as available.
- Desktop and mobile cards remain usable.

## Task 5: Add reconciliation persistence

Files:

- Create a migration extending `villa_caches`
- Create a migration for `lodgify_sync_runs`
- Modify `backend/app/Models/VillaCache.php`
- Create `backend/app/Models/LodgifySyncRun.php`
- Modify `backend/config/services.php`
- Modify `backend/.env.example`

Steps:

1. Add status, room snapshot, last-seen, full-sync, missing-count, and snapshot-version fields.
2. Add durable run status and count fields.
3. Add model casts, fillable fields, and status constants.
4. Add bounded configuration values for pagination, timeout, concurrency, retries, and anomaly ratio.
5. Ensure migrations are reversible and additive.

Checkpoint:

- Existing rows remain valid after migration.
- Rollback does not affect unrelated CMS tables.

## Task 6: Replace Laravel sync with reconciliation

Files:

- Refactor `backend/app/Services/LodgifyService.php`
- Create focused Lodgify transport or reconciliation support classes if needed
- Create `backend/app/Console/Commands/SyncLodgify.php`
- Modify `backend/app/Console/Kernel.php`
- Modify `backend/app/Filament/Pages/HomepageManager.php`

Steps:

1. Fetch all property pages with typed failure outcomes.
2. Validate response shape, uniqueness, and normal pagination termination.
3. Reject candidate totals below the configured safe ratio.
4. Fetch rooms with bounded concurrency and retain previous rooms on transient failure.
5. Reconcile all property states in one database transaction.
6. Require two complete successful absences before `missing`.
7. Record every run and return meaningful command exit codes.
8. Schedule the command every five minutes with overlap protection.
9. Remove the blocking sync from Homepage Manager mount.

Checkpoint:

- Failed, partial, and anomaly-rejected runs do not promote state.
- Repeated successful syncs are idempotent.
- Homepage Manager performs no Lodgify network request during rendering.

## Task 7: Expose and consume the last-known-good snapshot

Files:

- Modify `backend/app/Http/Controllers/CmsController.php`
- Modify `backend/routes/api.php`
- Modify `lib/cms.ts`
- Modify `lib/lodgify/client.ts`

Steps:

1. Add a sanitized public snapshot response.
2. Exclude raw errors, secrets, and admin-only health details.
3. Add the Next.js CMS snapshot fetcher with a five-minute cache.
4. Use the snapshot only after transient live property or room failure.
5. Preserve live availability as a separate concern.

Checkpoint:

- Snapshot fallback can render villa metadata during simulated Lodgify failure.
- Snapshot never claims live availability.

## Task 8: Add focused backend tests

Files:

- Create `backend/tests/Feature/LodgifyReconciliationTest.php`
- Create `backend/tests/Feature/LodgifySnapshotApiTest.php`
- Create or update command scheduling tests as appropriate

Cases:

1. Multi-page sync.
2. Idempotent repeated sync.
3. Active and inactive transitions.
4. Two-run missing transition.
5. Missing recovery.
6. Partial-page protection.
7. Anomaly rejection.
8. Previous room snapshot retention.
9. Sanitized snapshot payload.
10. Command success and failure exit codes.

Checkpoint:

- Focused tests pass.
- Full Laravel suite passes.

## Task 9: Verify the integrated batch

Steps:

1. Run frontend type checking.
2. Run the Next.js production build.
3. Run Laravel focused tests.
4. Run the full Laravel test suite.
5. Run migrations in the test environment.
6. Browser-test `/villas` without dates.
7. Browser-test `/villas` with dates.
8. Simulate degraded availability and confirm neutral status copy.
9. Confirm no repeated console errors.
10. Inspect the final diff for secrets, hard deletes, and unrelated changes.

Completion:

- Report each Stage 0 to 3 acceptance criterion with evidence.
- Record any client-owned pending decision separately from engineering completion.
- Keep Stages 4 through 9 open as the next program batch.
