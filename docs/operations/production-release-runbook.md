# Summerhouses production release gate, Stages 8 and 9

Updated: 2026-09-17
Release status: NO-GO until the security audit blockers are closed and staging/server evidence exists. Documentation readiness is not production completion.

## Stage 8: local regression gate

Run from the repository root:

```text
npm ci
npm run typecheck
npx --yes tsx --test tests/lodgify-resilience.test.ts tests/lodgify-availability.test.ts
npm run build
npm audit --omit=dev --audit-level=high
```

The npx runner is temporary for this verification; an approved implementation should pin a project test runner in the lockfile for CI reproducibility.

Run from backend:

```text
composer install --prefer-dist --no-interaction
php artisan test
composer audit --no-dev --locked
php artisan schedule:list
```

Tests use in-memory SQLite, fake HTTP, fake mail or array mail. Do not run feature tests against a production database. Confirm APP_ENV=testing and the isolated DB before testing a staging build. Audit exit failures block release; never use --ignore-platform-reqs or npm audit fix --force to force release.

Covered: 429/5xx retry and recovery; no retry on 401/403/404; connect timeout; incomplete pagination and malformed responses; single/all HTTP room failures and previous room preservation; property discovery, absence, recovery, inactive state, anomaly rejection; incident dedupe, stale health recovery, notification escalation, invalid homepage references, retention and append-only model behavior; frontend circuit open/probe/recovery, concurrency/order, and available/unavailable/unknown semantics; unauthorized admin access, wishlist ownership and role escalation.

Still required: real server DNS/HTTPS/egress, actual latency/timeouts and room transport pool failures, process restart/recovery, shared sync locking, security hardening regression, SMTP inbox delivery and concurrency/race tests, browser refresh after stack migration, and staging with a sanitized production copy.

## Stage 9: sequence

### 1. Establish the server contract

- Supported OS, Node/PHP/database versions and installed extensions recorded.
- Approved production domains and trusted proxy IP ranges recorded.
- HTTPS at ingress and between hosts where traffic crosses network boundaries; TLS verification enabled for outbound requests.
- Only necessary public HTTP/HTTPS ports exposed. SSH restricted to engineering addresses or private access. Database, Redis, PHP-FPM and Node origin ports private or loopback.
- Reverse proxy overwrites forwarding headers, enforces API rate limits/body size/timeouts, and denies .env, vendor, source maps, VCS, logs, backup files and executable uploads. Laravel document root is backend/public, not backend.
- SSH keys, unique least-privilege DB accounts, no shared admin passwords, log rotation and disk-space monitoring.
- Egress limited to required Lodgify, mail and approved content endpoints after resolving all application dependencies. Never disable TLS to address a timeout.

### 2. Provision and test staging

- Use separate APP_KEY, DB credentials, Lodgify secrets and mail test recipients. Mask customer data in the production copy.
- APP_DEBUG=false; ensure API failures do not expose stack traces or secret values.
- Validate runtime environment from inside the deployed process, not only the shell. Keep Next server secrets out of NEXT_PUBLIC variables.
- Validate images, managed upload queue/WebP conversion, editorial save immediacy and five-minute villa cache policy.
- Set the mail transport only after default-mailer hardening. Existing OTP controllers force Resend, so SMTP env alone is insufficient until that change ships.
- SMTP check: TLS, auth, from domain, SPF/DKIM/DMARC, inbox/spam, bounce and timeout behavior. Send solely to an engineering-owned test recipient, with explicit authorization per real send.
- Contact/newsletter currently store data without sending email; verify actual intended flows instead of assuming mail is present.
- Database-backed Lodgify notifications do not require SMTP. Email alerts remain optional and must not become a core dependency.
- Run normal/outage/recovery tests only against fakes or staging. Do not simulate overload or upstream failure on live production.

### 3. Protect data and prepare rollout

- Capture DB/media backup, encryption key reference and current release artifact. Perform a restore into an isolated DB and verify records/media before approving go-live.
- Record actual portfolio baseline at deployment time, not a hardcoded 39-villa assumption.
- Review migrations on staging and run additive migrations first. Retain cache rows, selections, reviews and audit history.
- Existing lodgify:sync command is mutating and has no dry-run flag. For the planned inspection-only first run, use an isolated staging database or implement/test an approved dry-run mode. Do not invent a --dry-run option.
- Compare complete synchronized portfolio with Lodgify/client baseline. Unexplained disappearance or auth rejection blocks rollout.
- Build verified artifacts with clean locked installs. Deploy backend policy/monitoring before frontend resilience/catalog consumers.
- Rebuild config caches only after final secret provisioning; reload long-running processes after changes. Do not expose cached config or print it to logs.

### 4. Start supervised processes

- Invoke `php artisan schedule:run` every minute using host cron/task scheduling. schedule:list alone is insufficient proof.
- Supervise workers for lodgify, media and default queues. Prefer separate media and Lodgify workers to prevent large uploads starving sync.
- Set worker timeout strictly below connection retry_after, with both sized above the tested job duration. Current retry_after=90 and default worker timeout may be insufficient for multiple rooms timeout batches. Resolve before production.
- Scheduler and queued/manual sync must share one exclusion lock before production. Existing independent withoutOverlapping/unique locks do not provide mutual exclusion across these entry points.
- Verify a test job is processed and a process restart resumes safely. Ensure process manager respawn and graceful deployment restart.

### 5. Production smoke and observation

- Read-only public homepage, villas, detail, destinations, search and calendar; desktop 1440, laptop 1280, tablet 768 and mobile 390 widths, keyboard and reduced-motion behavior.
- Confirm inactive/removed villas hidden, no secrets in public DTOs, tri-state availability truthful, safe homepage fallback and no console error.
- Confirm unauthorized admin/API requests denied. Do not create customer accounts or bookings as deployment smoke.
- Confirm scheduler produces a new successful sync within ten minutes and subsequent runs remain healthy. Check counts, warning ratios, duration and queue backlog.
- Check internal notification bell and incident recovery. Optional manual Sync Now creates a real job and must be explicitly included in the deployment change window.
- One SMTP delivery smoke to an authorized internal recipient if email features are enabled.
- Observation: 30-minute initial gate, 24-hour engineering review. Watch freshness (<10 minutes), health, unexpected count changes, latency versus staging baseline, HTTP 5xx/429, failed jobs and worker uptime.
- If schema/policy, critical incident, unexpected property exposure, missing secrets or sync staleness fails, stop rollout and follow rollback. Red status is not success just because pages respond 200.
- External alert channels stay disabled until core health is stable and client approves the channel/cost. No paid external tracking required.

### 6. Rollback

- Roll back to the last verified compatible application artifact. Retain additive migrations and audit history; do not run migrate:rollback by default.
- Keep the safe active/managed catalog filter in every fallback artifact. Never bypass policy by switching to a raw upstream catalog.
- Pause new incompatible jobs, restart compatible workers, preserve pending/failed jobs and logs for investigation. Do not blindly retry side-effecting jobs.
- Do not rotate APP_KEY during rollback: encrypted data/cookies may become unreadable. Separate secret rotation is a reviewed operation.
- Restore data only after determining corruption and obtaining explicit authority. Validate an isolated restore first; backup rollback must not overwrite newer bookings/reviews without a recovery plan.

## Evidence record for 2026-09-17

- Frontend: typecheck passed, baseline production build passed, nine pure resilience/availability tests passed.
- Backend: final full suite 103 tests / 346 assertions passed.
- Browser production artifact: Villas 39 cards at desktop 1440, laptop 1280, tablet 768, mobile 390; no horizontal overflow; Bawa/Semanggi absent. Homepage mobile checked; no Bawa/Semanggi or horizontal overflow. Browser console: zero errors/warnings.
- Dependency audits: FAILED production gate (npm 7 packages; Composer 16 records on 4 packages).
- Scheduled definitions: verified. Host scheduler, worker uptime and real SMTP: NOT VERIFIED.
- No production deploy, DNS/firewall change, live email or backup restore performed.

The preliminary [security audit](2026-09-17-production-security-audit.md) is the required next review gate.
