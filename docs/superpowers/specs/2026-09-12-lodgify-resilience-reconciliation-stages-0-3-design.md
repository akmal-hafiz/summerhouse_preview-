# Lodgify B+ Production-Grade Internal: Stages 0 to 3

Date: 2026-09-12

Status: Proposed for final user review

## 1. Objective

This specification defines the first implementation batch of the Summerhouse Lodgify reliability program. The long-term objective remains completion of Stages 0 through 9. This batch is intentionally limited to:

1. Stage 0: property baseline and data confirmation
2. Stage 1: resilient Lodgify communication in Next.js
3. Stage 2: safe tri-state availability
4. Stage 3: scheduled Laravel reconciliation and last-known-good snapshots

The implementation must make the public website resilient to transient Lodgify failures, preserve an auditable local view of Lodgify properties, and prevent failed availability checks from being misrepresented as confirmed unavailability.

No paid external monitoring service is part of this design.

## 2. Current State and Confirmed Findings

### 2.1 Live Lodgify inventory

The Lodgify API currently returns 44 properties:

- 39 properties are active.
- 5 properties are inactive.
- Bawa House, property ID `796460`, is absent from the property list and its detail endpoint returns HTTP `404`.

The known inactive properties are:

| Lodgify ID | Property |
| --- | --- |
| `494871` | Villa Charli |
| `598367` | The Warehouse Loft |
| `707108` | Berawa Factory II Canggu |
| `818095` | Villa Semanggi Canggu |
| `831493` | Casaluna Umalas (OPS ONLY) |

Client confirmation remains required to determine whether those inactive states are intentional and whether Bawa House was archived, deleted, moved, or assigned a replacement ID.

### 2.2 Next.js behavior

`lib/lodgify/client.ts` currently:

- Uses a single abort timeout.
- Fetches all property pages with a five-minute Next.js cache.
- Returns empty arrays or `null` when requests fail.
- Logs room failures through `console.error`.
- Does not distinguish transient network failures from authentication, not-found, or response-format failures.

`lib/lodgify/villas.ts` currently:

- Correctly excludes properties where `is_active === false`.
- Starts one room request for every candidate through an unbounded `Promise.all`.
- Treats a failed availability fetch as an empty availability response.
- Filters villas with unknown availability as if they were confirmed unavailable.

`lib/lodgify/availability.ts` already defines `unknown` as an internal availability status. The missing part is preserving that status through the search result and user interface instead of collapsing it to a boolean.

### 2.3 Laravel behavior

`backend/app/Services/LodgifyService.php` currently:

- Fetches only the default properties response without explicit pagination.
- Updates or creates cache rows.
- Does not reconcile inactive or missing properties.
- Does not retain detailed room snapshots.
- Swallows individual room failures.
- Does not produce a durable sync-run record.

Sync is currently triggered when `HomepageManager` is opened. `backend/app/Console/Kernel.php` has no scheduled Lodgify synchronization.

## 3. Design Principles

The first batch follows these principles:

1. Lodgify remains the external source of truth for active status and live availability.
2. Laravel stores the last fully validated property snapshot and reconciliation state.
3. Next.js remains responsible for rendering and graceful degradation.
4. A partial or suspicious sync must never replace a known-good snapshot.
5. A transient request failure must never become a confirmed business fact.
6. No property is hard-deleted automatically.
7. Every retry, timeout, concurrency limit, and anomaly threshold is configurable.
8. Handled transient failures produce structured warnings, not repeated console errors.
9. The first batch must create clean extension points for Stages 4 through 9.

## 4. Architecture

### 4.1 Layer one: Next.js Lodgify gateway

Next.js continues to read Lodgify for public pages. The client is divided into focused units:

- HTTP transport: timeout, headers, response parsing, and typed errors.
- Retry policy: determines whether and when one retry is allowed.
- Circuit breaker: prevents repeated calls during a concentrated outage.
- Concurrency limiter: restricts room-detail fan-out.
- Repository functions: properties, property detail, rooms, images, availability, and rates.
- Snapshot fallback adapter: reads the sanitized Laravel last-known-good snapshot when the live property or room request cannot be completed.

The circuit breaker is process-local and requires no Redis service. Laravel provides the durable snapshot. This keeps the first release compatible with a single Summerhouse server and avoids a new infrastructure dependency.

### 4.2 Layer two: Laravel reconciliation service

Laravel performs a scheduled full property reconciliation every five minutes:

1. Create a synchronization run.
2. Fetch all property pages into an in-memory or temporary candidate snapshot.
3. Validate pagination completeness, response shape, and count safety.
4. Fetch room details with bounded concurrency.
5. Preserve the previous room snapshot when a transient room request fails.
6. Apply property changes within a database transaction.
7. Update last-seen and missing counters.
8. Mark the run complete and promote the snapshot.

Only a fully validated property-list fetch may change active or missing reconciliation states. Room warnings may produce `completed_with_warnings` without invalidating a complete property-list reconciliation.

### 4.3 Public snapshot endpoint

Laravel exposes a sanitized public snapshot endpoint for server-side Next.js fallback. It returns only fields already used on public villa pages:

- Property ID and name
- Active state
- Public location and description fields
- Public images
- Price summary fields available in the Lodgify property response
- Sanitized room snapshot
- Snapshot generation time

It does not expose API keys, internal errors, sync history, raw authorization details, or admin-only health data.

The endpoint is a fallback source, not the source for live availability.

## 5. Stage 0: Production Property Baseline

### 5.1 Baseline artifact

Create `docs/operations/lodgify-property-baseline.md` with one row per known property and these fields:

- Lodgify property ID
- Property name
- Current Lodgify state
- Expected public state
- Client decision
- Homepage selection references
- Replacement property ID, if applicable
- Notes and confirmation date

Allowed client decision values are:

- `confirmed_active`
- `confirmed_inactive`
- `replace_property_id`
- `remove_from_website`
- `pending_client_confirmation`

The first version records the current 44-property API inventory, the five inactive properties, Bawa House, and known stale admin-cache records. Unconfirmed items remain pending. They are not silently resolved by code.

### 5.2 Stage 0 completion criteria

Stage 0 is technically complete when:

- The baseline artifact exists and reflects the latest API audit.
- Every uncertain property is explicitly marked pending.
- Existing homepage selections are cross-referenced.
- No cache row or homepage selection has been deleted.

Business confirmation can remain pending while Stages 1 through 3 are built. Production cleanup of disputed properties waits for the client response.

## 6. Stage 1: Resilient Next.js Lodgify Client

### 6.1 Typed failures

Introduce a typed Lodgify error with these categories:

- `timeout`
- `network`
- `rate_limited`
- `server_error`
- `authentication`
- `not_found`
- `invalid_response`
- `cancelled`

Each error carries safe metadata:

- Request operation
- Sanitized endpoint path
- HTTP status when present
- Attempt number
- Retriable flag
- Correlation ID

Secrets and complete authorization headers are never logged.

### 6.2 Retry policy

Allow one retry for:

- Connect or request timeout
- Network failure
- HTTP `429`
- HTTP `500`, `502`, `503`, and `504`

Do not retry:

- HTTP `400`
- HTTP `401` or `403`
- HTTP `404`
- Invalid configuration
- Caller cancellation

The retry delay uses exponential backoff with jitter. Defaults are configurable through environment variables and have safe bounds.

### 6.3 Timeout policy

Use one total request timeout controlled through `LODGIFY_REQUEST_TIMEOUT_MS`. The initial default remains compatible with the current twelve-second expectation. The implementation must classify both application aborts and Undici connection timeouts as `timeout`.

### 6.4 Bounded concurrency

All room fan-out uses a shared concurrency helper. The default limit is five concurrent room requests and is configurable through `LODGIFY_ROOMS_CONCURRENCY`.

The helper must preserve input order, isolate individual failures, and avoid rejecting the entire villa list when one room request fails.

### 6.5 Circuit breaker

The breaker states are `closed`, `open`, and `half_open`.

- Only transient failures count toward opening the breaker.
- Authentication failures bypass retries and surface immediately as critical configuration failures.
- A default threshold of five transient failures within sixty seconds opens the breaker.
- The default cooldown is sixty seconds.
- One probe request is allowed in `half_open`.
- Success closes the breaker and clears its transient failure window.

Thresholds are configurable. The breaker does not persist across application restarts.

### 6.6 Logging behavior

- Handled transient failures use one structured warning per operation summary.
- Individual room failures are collected and summarized after the bounded batch.
- Authentication and invalid configuration remain error-level events.
- Expected `404` property misses are notices.
- The public page must not generate a Next.js console-error overlay for a handled timeout.

### 6.7 Fallback behavior

For property and room metadata:

1. Prefer valid live or Next.js-cached Lodgify data.
2. On a transient failure, try the Laravel last-known-good snapshot.
3. If both sources fail, return a controlled empty result with a degraded-state marker.

Live availability is never fabricated from a property snapshot.

## 7. Stage 2: Safe Tri-State Availability

### 7.1 Search-level state

Extend villa search results with:

- `availabilityStatus: available | unavailable | unknown`
- `availabilityReason`
- `availabilityCheckedAt`

The existing calendar-specific states `booked` and `blocked` remain available for daily detail, but search eligibility is reduced to the three public states above.

### 7.2 State rules

- A complete availability response covering every requested night and reporting availability produces `available`.
- A complete response with a booking, closed period, or confirmed zero availability produces `unavailable`.
- A failed, incomplete, malformed, or missing response produces `unknown`.
- No dates selected means availability has not been requested and must not be labeled as confirmed available.

### 7.3 Search filtering

- With valid dates, confirmed `unavailable` villas are excluded.
- With valid dates, `unknown` villas remain visible but are not described as available.
- Without dates, active villas remain visible with no availability claim.
- Capacity and location filters continue to operate normally.

### 7.4 User-facing behavior

For `unknown`, the villa card and detail flow show neutral language such as `Availability temporarily unavailable` and provide retry or concierge options. Existing Summerhouse visual language and responsive behavior must be preserved.

User-facing copy must not expose HTTP status codes or internal service terminology.

## 8. Stage 3: Scheduled Laravel Reconciliation

### 8.1 Database extensions

Extend `villa_caches` with:

- `lodgify_status`: `active`, `inactive`, `suspected_missing`, or `missing`
- `rooms_raw`: sanitized room snapshot JSON
- `last_seen_at`
- `last_full_sync_at`
- `consecutive_missing_count`
- `snapshot_version`

Keep the current `raw` and `synced_at` fields for backward compatibility during rollout.

Create a minimal `lodgify_sync_runs` table now because a safe reconciliation requires a durable run boundary. The richer history interface belongs to Stage 4. Initial fields are:

- Run UUID
- Status: `running`, `completed`, `completed_with_warnings`, `partial`, `failed`, or `rejected_as_anomaly`
- Start and finish timestamps
- Total, active, inactive, new, changed, and suspected-missing counts
- Warning and error counts
- Safe error category and message
- Candidate snapshot version

### 8.2 Pagination and completeness

Laravel uses the same explicit page size and bounded maximum-page policy as Next.js. A sync is complete only when:

- Every requested page succeeds.
- Every response has a supported shape.
- Pagination terminates normally.
- Property IDs are present and unique after normalization.

A partial fetch never changes missing counters or promotes a snapshot.

### 8.3 Basic anomaly guard

Before promotion, compare the candidate total with the previous successful total. By default, a drop below fifty percent is rejected as an anomaly unless there is no previous successful snapshot.

The ratio is configurable. Manual resolution and richer anomaly policies belong to Stage 5. The first-batch guard exists only to prevent a clearly incomplete response from replacing good data.

### 8.4 Missing-state transition

After a full successful property sync:

- Seen active property: set `active`, reset missing count, update `last_seen_at`.
- Seen inactive property: set `inactive`, reset missing count, update `last_seen_at`.
- Unseen existing property with count zero: set `suspected_missing`, set count to one.
- Unseen existing property with count one or more: set `missing`, increment the count.
- Previously missing property seen again: restore its live active or inactive state and reset the count.

No missing transition occurs after a partial, failed, or anomaly-rejected sync.

### 8.5 Room snapshot policy

Room requests use bounded concurrency.

- On success, update `rooms_raw` and derived bedroom, guest, amenity, and image fields.
- On transient failure, retain the previous room snapshot and add a warning to the sync run.
- On a confirmed empty room response, store an empty room snapshot.
- A room warning cannot erase previously known room data.

### 8.6 Scheduling and locking

Add a dedicated Artisan command and schedule it every five minutes.

- Use `withoutOverlapping`.
- Use a database or application cache lock already available to the project.
- Use `onOneServer` only when production runs multiple application instances with a shared cache driver.
- The scheduler command returns a non-zero exit code for failed or anomaly-rejected runs.

Opening Homepage Manager no longer performs a blocking network sync. It may display cached data and optionally dispatch a refresh later, but page rendering must not depend on Lodgify availability.

## 9. Data Flow and Failure Decisions

| Situation | Next.js response | Laravel reconciliation response |
| --- | --- | --- |
| Normal Lodgify response | Use current data | Promote validated snapshot |
| One room timeout | Keep villa, use fallback room facts, warn once | Retain old room snapshot, complete with warning |
| Availability timeout | Mark `unknown`, keep villa visible | No property-state change |
| HTTP `429` or `5xx` | Retry once, then fallback | Retry according to bounded policy, retain snapshot on failure |
| HTTP `401` or `403` | No retry, controlled degraded result, error log | Fail run without modifying snapshot |
| Property HTTP `404` | Treat property detail as missing | Reconcile only through complete property-list results |
| Partial pagination | Use last-known-good snapshot | Mark partial, do not promote |
| Suspicious count collapse | Use last-known-good snapshot | Reject as anomaly |

## 10. Configuration

The first batch adds documented configuration with validated defaults:

- `LODGIFY_REQUEST_TIMEOUT_MS`
- `LODGIFY_MAX_RETRIES`
- `LODGIFY_RETRY_BASE_DELAY_MS`
- `LODGIFY_ROOMS_CONCURRENCY`
- `LODGIFY_CIRCUIT_FAILURE_THRESHOLD`
- `LODGIFY_CIRCUIT_WINDOW_MS`
- `LODGIFY_CIRCUIT_COOLDOWN_MS`
- `LODGIFY_SYNC_INTERVAL_MINUTES`
- `LODGIFY_SYNC_MIN_COUNT_RATIO`

Values are clamped to safe minimums and maximums. API credentials remain in existing secret configuration.

## 11. Verification for the First Batch

### 11.1 Next.js

Because the frontend currently has no unit-test runner, the implementation must keep resilience policies in small pure functions. Verification includes:

- Type checking
- Production build
- Deterministic script-level or newly introduced lightweight unit tests for retry classification, availability-state reduction, and concurrency behavior
- Browser verification of `/villas` with no dates and with valid dates
- Browser verification of the degraded availability state
- Confirmation that handled timeouts do not trigger a console-error overlay

Any new test dependency requires separate justification in the implementation plan. Prefer testing without adding a large framework.

### 11.2 Laravel

Feature and unit tests must cover:

- Multi-page property synchronization
- Idempotent repeated sync
- Active and inactive transitions
- Two-successful-sync missing transition
- Missing property recovery
- Partial pagination protection
- Anomaly rejection
- Room snapshot retention after timeout
- Scheduler command locking and exit codes
- Sanitized public snapshot response

Run the full existing Laravel test suite after focused tests pass.

### 11.3 Data safety

Before applying production state changes:

- Run migrations in a reversible staging environment.
- Execute one dry-run reconciliation.
- Compare counts against the Stage 0 baseline.
- Confirm no homepage selection or review relation is deleted.
- Confirm the previous snapshot remains readable after a simulated failed sync.

## 12. Rollout Boundaries

This first batch does not implement:

- The complete Stage 4 history user interface
- Stage 5 Filament health widgets and advanced scoring
- Stage 6 homepage publishing guards
- Stage 7 internal notification center and incident deduplication
- Stage 8 full failure matrix and long-running reliability tests
- Stage 9 production rollout execution
- External monitoring or paid observability services

It does create the database and service boundaries required by those later stages.

## 13. Acceptance Criteria

Stages 0 through 3 are complete when:

1. The property baseline exists and all uncertain client decisions are explicit.
2. The `/villas` page does not issue unbounded room requests.
3. Transient failures receive at most one retry with jitter.
4. Authentication and not-found responses are not retried.
5. Repeated Lodgify failures open a local circuit breaker.
6. Handled room timeouts do not create repeated console-error overlays.
7. Unknown availability is not represented as unavailable or available.
8. Active villas with unknown availability remain discoverable.
9. Laravel fetches and validates all property pages every five minutes.
10. Partial or anomalous syncs do not replace the last-known-good snapshot.
11. A property requires two complete successful absences before becoming missing.
12. No automated process hard-deletes a villa cache row or homepage selection.
13. Homepage Manager no longer blocks on a live Lodgify synchronization.
14. Frontend type checking, production build, browser verification, focused Laravel tests, and the full Laravel test suite pass.

## 14. Continuity to Stages 4 through 9

The long-term target remains unchanged:

4. Complete sync history and change inspection
5. Filament Lodgify Health Dashboard and advanced anomaly scoring
6. Homepage selection validation and publishing protection
7. Structured internal notifications and incident documentation
8. Complete timeout, partial-failure, and recovery test matrix
9. Safe staged production rollout and operational stabilization

The project must not treat completion of this first batch as completion of the B+ program.
