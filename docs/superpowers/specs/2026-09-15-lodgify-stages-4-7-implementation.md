# Lodgify Stages 4 to 7 Implementation Plan

Date: 2026-09-15

Status: Approved for execution

## Objective

Implement zero-touch Lodgify operations for Summerhouse. Routine active, inactive, missing, and recovery transitions run automatically. Admin UI is observational and protective, not an approval queue.

## Slice 1: Domain State and Append-Only Audit

### Database

Create migrations to:

1. Add `management_status`, management change metadata, and useful compound indexes to `villa_caches`.
2. Create `lodgify_property_events` with immutable transition data and a unique event key.
3. Backfill Semanggi (`818095`) and Bawa House (`796460`) as `removed_from_portfolio` when rows exist.
4. Create baseline client-decision events without inventing earlier timestamps.

### Models and services

- Extend `VillaCache` with management constants, public eligibility scope, status helpers, and event relationship.
- Add immutable `LodgifyPropertyEvent` model.
- Add `LodgifyAuditService` to canonicalize public fields, calculate hashes, append idempotent events, and sanitize metadata.
- Update `LodgifyService` so cache changes and events share one transaction.
- Automatically restore a removed property to managed when Lodgify reports it active.
- Emit no event for unchanged sync observations.

### Tests

- Initial discovery and status changes append one event.
- Repeated unchanged sync creates no duplicate events.
- Missing progression and recovery are audited.
- Removed property becomes managed automatically only when active.
- Audit rows reject update and delete.

## Slice 2: Incidents, Health, and Structured Logging

### Database and models

- Create `lodgify_incidents` with stable fingerprint, severity, occurrence counters, lifecycle timestamps, and sanitized context.
- Create Laravel's database notifications table.
- Add `LodgifyIncident` model.

### Services

- Add `LodgifyIncidentService` for deduplicated open, touch, escalation, and resolution.
- Add `LodgifyHealthService` as the single green, yellow, and red evaluator.
- Add `LodgifyHomepageValidator` to inspect selections after complete reconciliation.
- Add `LodgifyLog` for consistent safe Laravel context.
- Integrate sync completion, failure, anomaly, room degradation, property missing, recovery, and homepage validation.

### Configuration

Add validated environment-backed thresholds for:

- Healthy and critical snapshot age
- Active-count drop anomaly
- Room warning ratio
- Consecutive failure notification thresholds
- Sync-run and resolved-incident retention

### Tests

- Repeated root cause updates one incident.
- Recovery resolves the correct incident.
- Authentication and stale data become red.
- One isolated recoverable failure does not create notification spam.
- Invalid homepage references create deterministic incidents.

## Slice 3: Filament Health and Internal Notifications

### Admin experience

- Create `Lodgify Health` Filament page using native Filament styling.
- Show health status, last successful sync, counts, current incidents, property transitions, invalid homepage references, and latest sync runs.
- Add non-blocking `Sync now` action backed by a unique database queue job.
- Add links and compact health summary to the main dashboard.
- Add acknowledge action for operational visibility only. Automation continues regardless of acknowledgement.

### Notifications

- Send database notifications only when an actionable incident is newly opened or escalated.
- Notify on authentication failure, repeated sync failures, stale data, repeated anomaly rejection, and removed/missing homepage references.
- Send one recovery notification only for previously critical incidents.

### Tests

- Admin can render the health page.
- Sync action dispatches one unique job.
- Notification recipients are admin users only.
- Incident acknowledgement does not affect reconciliation.

## Slice 4: Public Catalog and Homepage Guard

### Laravel API

- Make the sanitized Laravel snapshot the policy-filtered public catalog.
- Return only `active + managed` properties.
- Keep five-minute cache behavior aligned with Next.js.
- Exclude business status, incident data, raw private fields, and secrets from the public response.

### Next.js

- Change `fetchProperties` to consume the policy-filtered Laravel catalog as the primary and safe property list.
- Continue using Lodgify for live availability, rates, images, and rooms where needed.
- Treat missing safe catalog data as a controlled degraded state instead of exposing an unfiltered live list.
- Extend structured server logs with event, severity, operation, correlation, recovery, and fallback fields.

### Homepage and CMS selectors

- Add status and selectability data to `VillaPicker`.
- Preserve an invalid existing value visibly with its reason.
- Prevent choosing inactive, suspected-missing, missing, or removed villas for new placements.
- Do not block unrelated editorial saves or delete existing selections.
- Ensure all automatic public fallbacks draw only from the policy-filtered catalog.

### Tests and verification

- Snapshot excludes inactive, missing, and removed properties.
- A reactivated previously removed property becomes public automatically.
- Existing invalid homepage rows remain stored.
- Villa picker data labels invalid states correctly.
- Next.js type checking passes.
- Next.js production build passes.
- Relevant Laravel tests and the complete Laravel suite pass.
- Browser QA covers public Villas, homepage, Homepage Manager, and Lodgify Health at desktop and mobile widths.

## Slice 5: Operations and Retention

- Add `lodgify:prune-operations` command and daily schedule for 90-day sync-run and configured resolved-incident retention.
- Never prune property events or villa cache rows.
- Add the Lodgify incident runbook.
- Document required production scheduler and database queue worker processes for Stage 9 deployment.

## Commit Strategy

Use reviewable commits:

1. `feat(lodgify): add property audit lifecycle`
2. `feat(lodgify): add incidents and health evaluation`
3. `feat(admin): add Lodgify health monitoring`
4. `feat(lodgify): enforce safe public catalog`
5. `docs(lodgify): add internal incident runbook`

## Completion Gate

Do not report completion until migrations, focused tests, full Laravel tests, Next.js type checking, production build, and browser verification all pass. If production-only scheduler or worker activation remains, report it explicitly as a Stage 9 deployment requirement rather than claiming it is active.
