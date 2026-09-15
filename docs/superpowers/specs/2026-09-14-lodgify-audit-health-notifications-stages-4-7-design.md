# Lodgify Internal Operations: Stages 4 to 7

Date: 2026-09-14

Status: Approved with zero-touch automation amendment on 2026-09-15

## 1. Executive Decision

This specification continues the approved B+ Production-Grade Internal program after Stages 0 to 3. It covers:

4. Append-only property audit trail and complete sync inspection
5. Filament Lodgify Health Dashboard and anomaly evaluation
6. Homepage selection validation and publishing protection
7. Structured logging, internal incident management, and database notifications

The operating model is deliberately low-touch:

- Lodgify remains the operational source of truth for property publication and availability.
- A managed property that becomes active in Lodgify may appear automatically after normal validation.
- An inactive or missing property is automatically hidden from public discovery.
- Admins do not approve routine five-minute synchronizations.
- Lodgify active status is treated as operational approval, including when a previously removed property returns.
- No paid monitoring or third-party alerting service is required.

## 2. Confirmed Business State

The client confirmed the following decisions on 2026-09-14.

| Lodgify ID | Property | Business decision | Public behavior |
| --- | --- | --- | --- |
| `494871` | Villa Charli | Managed, temporarily unavailable | Hidden while inactive; returns automatically when active |
| `598367` | The Warehouse Loft | Managed, temporarily unavailable | Hidden while inactive; returns automatically when active |
| `707108` | Berawa Factory II Canggu | Managed, temporarily unavailable | Hidden while inactive; returns automatically when active |
| `831493` | Casaluna Umalas (OPS ONLY) | Managed, temporarily unavailable | Hidden while inactive; returns automatically when active |
| `818095` | Villa Semanggi Canggu | No longer managed | Hidden while inactive or absent; restored automatically if Lodgify makes it active |
| `796460` | Bawa House | No longer managed | Hidden while inactive or absent; restored automatically if Lodgify makes it active |

The last-known database records for Semanggi and Bawa House must be retained. Removing them from Lodgify must not cascade into deletion of homepage selections, reviews, wishlists, media links, or historical audit data.

## 3. Current-State Architecture Audit

### 3.1 What already works

- Laravel synchronizes all Lodgify property pages every five minutes with overlap protection.
- A validated candidate snapshot is protected by pagination and count anomaly checks.
- Missing properties require two complete successful absences before becoming `missing`.
- Room failures preserve last-known-good room data.
- `lodgify_sync_runs` stores durable run boundaries, result counts, categories, and safe messages.
- Next.js applies bounded room concurrency, retry, timeout classification, circuit breaking, fallback snapshots, and tri-state availability.
- Public villa and homepage queries currently exclude Lodgify properties where `is_active` is false.

### 3.2 Gaps to close

1. `lodgify_sync_runs` describes a run, but there is no immutable record of each property transition.
2. The sync service updates `villa_caches` in place, so the previous value cannot be reconstructed reliably.
3. Business portfolio state is not separate from Lodgify's observed active state.
4. Known client decisions are documented but are not enforceable by runtime policy.
5. The Filament dashboard has no Lodgify health summary, incident queue, or sync history view.
6. Homepage villa selectors can offer inactive, missing, or removed cache records.
7. Existing invalid homepage selections are silently skipped or replaced by frontend fallback logic.
8. Laravel logging has categories but lacks a common event schema, correlation fields, and incident deduplication.
9. Next.js logging sanitizes common secret names but does not consistently emit event name, severity, correlation ID, recovery state, or fallback use.
10. Admin users support Laravel notifications, but the database notification storage and Lodgify notification policy are not implemented.

## 4. Core Domain Model

### 4.1 Keep observed state separate from business state

`villa_caches.lodgify_status` remains the observed Lodgify state:

- `active`
- `inactive`
- `suspected_missing`
- `missing`

Add `villa_caches.management_status`:

- `managed`: Summerhouse currently manages the property
- `removed_from_portfolio`: confirmed to be outside Summerhouse management

Newly discovered Lodgify properties default to `managed`. This treats publication in the dedicated Summerhouse Lodgify account as operational approval and avoids a review step for every new property.

Add supporting fields:

- `management_status_changed_at`
- `management_status_changed_by`, nullable admin user ID
- `management_status_note`, short text

The public eligibility rule is:

```text
eligible = lodgify_status == active
           AND management_status == managed
           AND required public data is valid
```

### 4.2 Public catalog boundary

Laravel's sanitized five-minute Lodgify snapshot becomes the authoritative public **catalog** because it is the only boundary that knows both observed Lodgify state and Summerhouse management state. Next.js must not publish an unfiltered live Lodgify property list.

- Laravel reconciliation reads Lodgify and builds the validated catalog.
- The public snapshot endpoint returns only eligible properties.
- Next.js caches that response for five minutes, which is permitted for Lodgify-backed villa data.
- Live availability and rate checks continue to use Lodgify because they are date-sensitive.
- If the catalog endpoint is temporarily unavailable, Next.js uses its last-known-good cached catalog.
- On a cold start where neither the policy-filtered catalog nor a safe cache is available, the website returns a controlled degraded result instead of exposing an unverified property.

This makes automatic return work for managed villas while keeping confirmed removed villas out of every public list, detail lookup, search option, homepage fallback, and destination collection.

### 4.3 Return-to-portfolio behavior

A temporarily inactive managed villa returns automatically when Lodgify reports it active.

A confirmed removed villa remains hidden while it is inactive or absent. If Lodgify later reports it active, reconciliation automatically changes its management state back to `managed`, appends a `property_reappeared` event, and makes it eligible after the normal cache window. This trusts the dedicated Summerhouse Lodgify account as operational approval and requires no separate admin action. The original cache row, property ID, audit history, and related records are reused.

## 5. Stage 4: Append-Only Audit Trail

### 5.1 Separate operational runs from immutable events

`lodgify_sync_runs` remains an operational run table. A running row may be finalized once, after which application code treats it as immutable.

Create `lodgify_property_events` as the permanent append-only audit ledger. It records meaningful changes, not every unchanged five-minute observation.

Required columns:

- UUID event ID
- Nullable sync-run ID and run UUID
- Villa-cache ID and Lodgify property ID
- Event type
- Previous observed status and new observed status
- Previous management status and new management status
- Sanitized changed fields as JSON
- Previous and current canonical snapshot hashes
- Actor type: `system`, `admin`, or `client_confirmation`
- Nullable actor user ID
- Safe reason and metadata JSON
- `occurred_at` and `created_at`

No `updated_at` column is required. The model exposes no update or delete workflow. Application guards reject update and delete attempts, and tests verify immutability.

### 5.2 Event taxonomy

- `property_discovered`
- `lodgify_status_changed`
- `property_suspected_missing`
- `property_missing_confirmed`
- `property_reappeared`
- `public_fields_changed`
- `rooms_snapshot_updated`
- `rooms_snapshot_retained`
- `management_status_changed`
- `client_decision_recorded`
- `homepage_reference_invalidated`
- `homepage_reference_restored`
- `incident_opened`
- `incident_resolved`

Room snapshots emit events only when their canonical public hash changes or when an old snapshot must be retained after a failure. Raw API payloads and secrets are never copied into events.

### 5.3 Atomicity and idempotency

- Cache updates and their property events are written in the same database transaction.
- Every event has a deterministic deduplication key based on run UUID, property ID, event type, and resulting hash.
- Retried jobs cannot create duplicate transition events.
- A failed or partial property-list sync creates a run-level record and incident, but does not emit false missing-property events.

### 5.4 Initial ledger baseline

The schema migration does not invent historical transitions or run network work. After deployment, a one-time idempotent baseline command records one `client_decision_recorded` or `property_discovered` event per existing row using the backfill execution time.

It explicitly records:

- The four temporarily unavailable managed villas
- Villa Semanggi and Bawa House as removed from the portfolio
- Other unresolved stale IDs as pending operational evidence, without classifying their business relationship

### 5.5 Retention

- Property audit events are retained indefinitely because they are change-only and low volume.
- Detailed sync runs are retained for 90 days.
- Daily aggregate sync-health records may be retained indefinitely.
- Incident records are retained for at least two years after resolution.
- Pruning never removes property cache records, property events, client decisions, or relational content.

## 6. Stage 5: Lodgify Health Dashboard

### 6.1 Dashboard structure

Add a dedicated Filament page named `Lodgify Health`, linked from the main dashboard. It contains:

1. Health status card: green, yellow, or red
2. Last successful sync time and data age
3. Active, inactive, suspected-missing, missing, and removed counts
4. Current unresolved incidents by severity
5. Homepage selections requiring attention
6. Latest property transitions
7. Last 20 sync runs with duration and result counts
8. `Sync now` action with progress and result notification

The page refreshes its displayed state at a modest interval such as 60 seconds. It does not call Lodgify directly while rendering.

### 6.2 Health evaluation service

Create one server-side `LodgifyHealthService` that produces a typed health snapshot. Widgets, notifications, tests, and commands consume the same evaluation rather than reimplementing thresholds.

Green:

- Last successful sync is less than 10 minutes old
- No critical incident is open
- Every invalid homepage reference has a safe active fallback
- No count anomaly is unresolved

Yellow:

- Last successful sync is 10 to 30 minutes old
- One recent sync failed after a previous success
- A property entered suspected-missing or reappeared state
- Room warnings exceed the configured ratio
- A new property was discovered
- A temporary frontend fallback was required repeatedly

Red:

- Last successful sync is more than 30 minutes old
- Authentication is rejected or the API key is missing
- Three consecutive full-sync failures occur
- A candidate snapshot is repeatedly rejected as anomalous
- An invalid homepage selection has no safe active fallback
- No usable last-known-good snapshot exists

An individual inactive transition is treated as an intentional Lodgify publishing decision. It is listed informationally but does not keep the dashboard yellow and does not require acknowledgement. The four confirmed temporarily unavailable villas therefore do not generate persistent alarms. A sudden multi-property active-count drop is still evaluated as an anomaly.

### 6.3 Anomaly rules

Initial configurable rules:

- Candidate property count falls below 50 percent of the previous successful count: reject promotion and open warning incident
- Active count drops by 20 percent or five properties in one run, whichever is smaller: open warning incident
- Any property moves to `suspected_missing`: informational transition, no immediate critical alert
- The same property becomes `missing` after two complete syncs: warning unless it is confirmed removed
- Removed property becomes active in Lodgify: restore automatically and record an informational transition
- Room failures exceed 20 percent in a run: warning
- Authentication failure: immediate critical incident

Thresholds live in validated Laravel configuration and environment variables.

### 6.4 Sync-now safety

`Sync now` dispatches the existing synchronization through a database-backed queue job and uses the same overlap lock as the scheduler. Repeated clicks cannot start concurrent reconciliations. The action reports that the sync was queued and later shows the resulting run rather than keeping an HTTP request open.

## 7. Stage 6: Homepage Selection Protection

### 7.1 Selection eligibility

Homepage Manager and every other villa picker must use one shared eligibility query.

- Active and managed: selectable normally
- Inactive and managed: visible for existing values, labeled `Temporarily unavailable`, unavailable for new selections
- Suspected missing: visible with warning, unavailable for new selections
- Missing: visible with warning, unavailable for new selections
- Removed from portfolio: visible for existing values, labeled `No longer managed`, unavailable for new selections

This policy also applies to Signature Villa, Stay Styles, gallery property links, and other CMS selectors that use `VillaCache`.

### 7.2 Existing invalid references

Existing invalid selections are never deleted automatically. The dashboard identifies the exact section, slot, property, and reason.

Publishing behavior:

- Removed or confirmed-missing selection: preserve it, warn in the editor, and keep it excluded from public rendering
- Temporarily inactive selection: allow the configuration to remain, show a warning, and let the public frontend use a recorded active fallback
- Suspected-missing selection: allow the first observation window, show a warning, and prevent choosing it elsewhere
- Recovered active managed selection: automatically becomes valid again

### 7.3 Auditable fallback

The existing public fallback behavior remains, but it becomes observable:

- Laravel validates selections after every successful reconciliation.
- A newly invalid reference creates one property event and one deduplicated incident.
- The frontend never writes audit state during rendering.
- When the selected villa becomes valid or is replaced, the incident auto-resolves and a restoration event is appended.
- Every fallback candidate is drawn from the same policy-filtered Laravel catalog. A live Lodgify property cannot bypass management status through fallback selection.

Known initial exceptions are:

- Bawa House in `extended_stays`
- Bawa House in `featured_homes`
- Berawa Factory II in `short_stays`
- Property `751982` in `short_stays`

Bawa House requires editorial replacement because it is confirmed outside the portfolio. Berawa Factory II may remain configured while temporarily inactive, with a visible admin warning and public fallback. Property `751982` remains unresolved until its business state is confirmed.

## 8. Stage 7: Structured Logging and Internal Notifications

### 8.1 Common structured event schema

Laravel and Next.js use the same conceptual fields:

- `timestamp`
- `service`: `laravel` or `nextjs`
- `environment`
- `event`
- `severity`
- `correlation_id`
- `run_uuid`, when available
- `operation`
- `property_id`, when applicable
- `category`
- `http_status`, when safe
- `attempt`
- `duration_ms`
- `recovered`
- `fallback_used`
- `message`

Production logging emits one-line structured JSON. Development may remain human-readable. Sanitization removes API keys, tokens, authorization headers, cookies, passwords, secrets, query-string credentials, and raw request or response bodies.

Laravel is the durable incident authority. Next.js does not post browser or rendering logs into a new public ingestion endpoint. Next.js structured logs remain server logs, while catalog, sync, and homepage conditions that require durable action are derived inside Laravel. This avoids creating an unauthenticated or secret-bearing logging surface.

### 8.2 Error categories

- `timeout`
- `network`
- `rate_limited`
- `server_error`
- `authentication`
- `not_found`
- `invalid_response`
- `partial_sync`
- `count_anomaly`
- `room_degradation`
- `homepage_reference`
- `portfolio_conflict`
- `configuration`

Expected inactive and handled property `404` events are notices or audit events, not error-level noise.

### 8.3 Incident registry

Create `lodgify_incidents` with:

- UUID
- Stable fingerprint
- Severity: `info`, `warning`, or `critical`
- Category
- Status: `open`, `acknowledged`, or `resolved`
- Safe title and explanation
- Optional property ID and homepage reference
- First-seen and last-seen timestamps
- Occurrence count
- First and latest run UUID
- Sanitized context JSON
- Acknowledged and resolved user/timestamps

The fingerprint groups repeated occurrences of the same root problem. A ten-minute outage creates one incident whose count increases, not dozens of notifications.

Successful recovery auto-resolves technical incidents when their recovery rule is satisfied. A removed property becoming active is treated as an automatic recovery because Lodgify is the operational authority.

### 8.4 Internal notification policy

Use Laravel database notifications and Filament's notification center. Notify all active admin users only when a new actionable incident opens or its severity increases.

- Single recovered timeout: log only
- First isolated sync failure: dashboard warning, no persistent notification
- Second consecutive failure: one warning notification
- Third consecutive failure or data age above 30 minutes: critical notification
- Authentication failure: immediate critical notification
- Count anomaly rejection: warning notification
- Removed property active again: informational audit event; no action notification
- Removed or missing villa with a safe fallback: informational incident, no action notification
- Invalid homepage villa with no safe fallback: critical notification
- Resolution of a critical incident: one success notification

Acknowledging a notification does not hide or resolve the underlying incident. It only records that an admin has seen it.

Email, Slack, Sentry, or other paid/external channels remain outside this stage and may be added later without changing the incident model.

### 8.5 Operational runbook

Create `docs/operations/lodgify-incident-runbook.md` during implementation with:

- Meaning of green, yellow, and red
- Safe steps for timeout, authentication, count anomaly, missing property, and homepage conflict
- How to run a manual sync
- How to inspect a correlation ID
- How automatic property recovery is verified
- How to replace an invalid homepage selection
- Which actions must never hard-delete historical records
- Production scheduler and queue-worker checks

## 9. End-to-End Data Flow

```text
Laravel scheduler or Sync now
        |
        v
Validated Lodgify candidate snapshot
        |
        +--> failed or anomalous --> sync run + structured log + deduplicated incident
        |
        v
Transactional reconciliation
        |
        +--> update current VillaCache state
        +--> append property transition events
        +--> validate homepage references
        +--> open or resolve incidents
        |
        v
Health snapshot and Filament notifications
        |
        v
Next.js public eligibility
active + managed + valid data --> visible
all other combinations        --> hidden or controlled fallback
```

## 10. Failure and Recovery Matrix

| Event | State mutation | Public result | Incident result |
| --- | --- | --- | --- |
| One timeout, retry succeeds | Promote valid snapshot | Normal | Structured recovered log only |
| Full sync fails | No property mutation | Last-known-good remains | Increment deduplicated incident |
| Partial pagination | No missing transition | Last-known-good remains | Warning incident |
| One room request fails | Retain prior room snapshot | Villa remains usable | Warning only if ratio or repetition threshold is met |
| Managed property becomes inactive | Record transition | Hide property | Informational unless count anomaly |
| Managed property becomes active | Record transition | Show automatically | Resolve inactive-related issue |
| Property absent once | `suspected_missing` | Hide property | Informational transition |
| Property absent twice | `missing` | Hide property | Warning unless confirmed removed |
| Removed property appears active | Restore to managed and append event | Show after normal cache refresh | Resolve prior missing/removal issue |
| Homepage references removed property | Preserve selection | Active fallback | Informational incident when safely mitigated; critical only when no fallback exists |

## 11. Database and Migration Safety

Implementation order:

1. Add nullable/defaulted business-state fields to `villa_caches`.
2. Create append-only property-event table.
3. Create incident table and Laravel database-notifications table.
4. Backfill management state and baseline events without deleting or rewriting relations.
5. Deploy models and services that can read both old and new fields.
6. Switch the public catalog to the policy-filtered Laravel snapshot.
7. Enable dashboard and selection guards.
8. Enable incident notifications only after the first successful production reconciliation.

All migrations must have reversible schema operations. A rollback removes new monitoring structures but never deletes pre-existing villa, homepage, review, wishlist, or media data.

## 12. Verification Strategy

### 12.1 Laravel tests

- Property event is created exactly once for each meaningful transition
- Unchanged sync creates no property event noise
- Audit event update and delete attempts fail
- Cache change and event append are atomic
- Client-confirmed management statuses are backfilled correctly
- Managed inactive property returns automatically when active
- Removed property remains hidden when Lodgify reports active
- Automatic restore-to-managed transition is audited
- Incident fingerprints deduplicate repeated failures
- Technical incidents auto-resolve after recovery
- Notification thresholds avoid alert storms
- Health status transitions through green, yellow, and red
- Sync-now dispatch respects the overlap lock
- Invalid homepage references are detected without deletion
- Homepage saving blocks removed or missing new selections
- Temporarily inactive legacy selections remain visible with warning

### 12.2 Next.js tests and checks

- Public eligibility excludes inactive and removed properties
- A live Lodgify response cannot bypass Laravel management policy
- A recovered managed property reappears after cache revalidation
- Homepage fallback does not expose removed property data
- Structured logs contain correlation and recovery fields
- Sanitization strips secret-like keys and raw credentials
- Type checking and production build pass

### 12.3 Browser QA

- Lodgify Health page at desktop, laptop, tablet, and mobile widths
- Keyboard access to Sync now, filters, acknowledgement, and restore actions
- Screen-reader labels for severity and status, not color alone
- Reduced-motion mode does not hide status changes
- Homepage Manager clearly identifies invalid legacy selections
- Filament database notifications link to the relevant incident
- Public Villas and homepage never show Semanggi or Bawa House

## 13. Acceptance Criteria

Stages 4 to 7 are complete when:

1. Every meaningful property transition has an immutable, deduplicated event.
2. Current property state can be explained from the latest cache plus its event history.
3. Confirmed client decisions for six properties are represented in runtime data.
4. Ordinary active, inactive, and recovery transitions require no admin approval.
5. Semanggi and Bawa House remain hidden while inactive or missing and return automatically only if Lodgify reports them active.
6. Next.js obtains its public villa catalog from Laravel's policy-filtered snapshot.
7. Dashboard health uses one tested evaluation service.
8. Admins can inspect current incidents, property changes, and recent sync runs.
9. Homepage selectors cannot create new references to invalid properties.
10. Existing invalid references are preserved, identified, and safely replaced.
11. Repeated failures create one incident instead of notification spam.
12. Authentication, stale data, and homepage business conflicts generate actionable internal notifications.
13. Logs are structured, correlated, sanitized, and free from expected-error noise.
14. No external monitoring subscription is required.
15. Relevant Laravel tests, Next.js type checking/build, and browser QA pass.

## 14. Explicit Non-Goals

- Automatically inferring contractual ownership from a Lodgify response
- Automatically hard-deleting removed or missing villa records
- Requiring client approval for every synchronization
- Sending external email or chat alerts in this batch
- Replacing Lodgify's calendar and booking availability controls
- Implementing Stages 8 and 9 before Stages 4 to 7 are reviewed and verified

## 15. Implementation Slices After Approval

The code should be delivered in four reviewable slices:

1. Domain state, client-decision backfill, and append-only audit ledger
2. Incident registry, structured logging, and health evaluation
3. Filament health page, history views, Sync now, and database notifications
4. Homepage guards, fallback audit integration, runbook, and full verification

Each slice must include focused tests and preserve compatibility with the existing Stages 0 to 3 behavior.
