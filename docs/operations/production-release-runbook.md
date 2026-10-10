# Summerhouses production release gate, Stages 8 and 9

Updated: 2026-09-22
Release status: APPLICATION GATES READY. Production remains NO-GO until the Dewaweb runtime, staging evidence, SMTP delivery, backup restore, scheduler and worker supervision are verified.

## Stage 8: local regression gate

Run from the repository root:

```text
npm ci
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

The test runner is now pinned in the lockfile. CI runs typecheck, tests, build and dependency audit. Use Node 22+ and PHP 8.4+; do not run backend commands using the old PHP 8.1 executable.

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

### Pricing and checkout revenue gate

The public site must not present its calendar-rate subtotal as the amount payable. The villa list and detail may show only a clearly marked starting nightly price from the catalog's `original_min_price`; if that field is absent or invalid, show no number. Never strike through `max_price` as a supposed discount. The 2026-09-22 local catalog inspection found 38/38 active snapshot properties with `min_price`/`max_price` on a much smaller scale than `original_min_price` while `currency_code` was IDR, so those converted fields must not be formatted as IDR.

Before publishing, record a comparison matrix for at least three representative villas, including one with extra guest charges and one with minimum-stay rules. For each, open (without paying) 3-night and 4-night stays, weekday and weekend arrivals, and one versus maximum permitted guests. Verify the villa ID, check-in, checkout, guest count, currency, availability, accommodation charge, fees, taxes, discounts and final checkout amount. The checkout must show the intended villa and dates before any payment step. Do not assume URL aliases are honored; inspect the rendered checkout. Record screenshots or redacted evidence and the exact configuration used.

Release is blocked if the checkout prefill is wrong, the displayed starting price is not an attainable rate, the currency is misleading, an invalid room or guest count is accepted by the site, the checkout exposes an unreviewed price override, or a local amount is presented as a guaranteed total. Do not create a real reservation or charge as a smoke test. If pricing cannot be reconciled, keep the safe 'See your full stay price' call to action and suppress unverified numeric starting prices until the source data is corrected.

## Automated release path

The repository has three separate controls:

1. `release-gate.yml` runs regression and dependency checks on pushes and pull requests without production secrets.
2. `release-candidate.yml` is manually started from `master`. GitHub's Linux runner installs locked dependencies, runs all tests and audits, builds the Next.js standalone server, removes all environment files, packages Laravel with production dependencies, records release provenance, creates a SHA-256 checksum and retains the artifact for 14 days.
3. `deploy-production.yml` accepts only a numeric successful release run ID. It verifies checksum, repository, branch, commit format and ancestry before the protected `production` environment can expose SSH secrets. The exact deployment script inside the signed artifact is used for deployment.

Required public GitHub repository variables:

- `PRODUCTION_SITE_URL`
- `PRODUCTION_CMS_API_URL`
- `PRODUCTION_CMS_ADMIN_URL`

Required protected `production` environment secrets:

- `DEWAWEB_SSH_HOST`
- `DEWAWEB_SSH_PORT`
- `DEWAWEB_SSH_USER`
- `DEWAWEB_SSH_PRIVATE_KEY`
- `DEWAWEB_SSH_KNOWN_HOSTS`
- `DEWAWEB_APP_ROOT`
- `DEWAWEB_PHP84_BIN`
- `DEWAWEB_HEALTH_URL`

Enable required reviewers on the GitHub `production` environment. Production runtime secrets belong only in Dewaweb shared environment files and must never be copied into GitHub build variables or release artifacts.

## Stage 9: sequence

### 1. Establish the server contract

The planned target is Dewaweb Cloud Hosting Warrior: 2 CPU cores, 2 GB memory, 15 GB NVMe storage and 10 MB/s disk I/O. This is sufficient only if Dewaweb confirms a persistent Node.js 22 process, PHP 8.4 CLI/FPM, SSH/SFTP, one-minute cron, persistent queue workers or an approved worker substitute, symlinks, outbound HTTPS, and the ability to point Laravel traffic at `backend/public`. If any capability is absent, production deployment remains blocked and the topology must be split.

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
- OTP delivery now uses MAIL_MAILER, MAIL_FROM_ADDRESS and MAIL_FROM_NAME. Set MAIL_TIMEOUT (1-30 seconds). Production log/array/failover transports are rejected for OTP delivery. Do not silently fall back to log mail.
- SMTP check: TLS, auth, from domain, SPF/DKIM/DMARC, inbox/spam, bounce and timeout behavior. Send solely to an engineering-owned test recipient, with explicit authorization per real send.
- Contact/newsletter currently store data without sending email; verify actual intended flows instead of assuming mail is present.
- Database-backed Lodgify notifications do not require SMTP. Email alerts remain optional and must not become a core dependency.
- Run normal/outage/recovery tests only against fakes or staging. Do not simulate overload or upstream failure on live production.

### 3. Protect data and prepare rollout

- Capture DB/media backup, encryption key reference and current release artifact. Perform a restore into an isolated DB and verify records/media before approving go-live.
- Record actual portfolio baseline at deployment time, not a hardcoded 39-villa assumption.
- Review migrations on staging and run additive migrations first. Retain cache rows, selections, reviews and audit history.
- Run `php artisan lodgify:sync --dry-run` for complete-catalog inspection without database writes or incident creation. Normal `lodgify:sync` remains mutating. First verify inspection on staging and compare with the client baseline.
- Compare complete synchronized portfolio with Lodgify/client baseline. Unexplained disappearance or auth rejection blocks rollout.
- Build verified artifacts with clean locked installs. Deploy backend policy/monitoring before frontend resilience/catalog consumers.
- Rebuild config caches only after final secret provisioning; reload long-running processes after changes. Do not expose cached config or print it to logs.
- While traffic and workers are paused, clear application cache once during this upgrade to remove legacy serialized PHP objects. New CMS payloads and review ID caches contain arrays/scalars; arbitrary cache-class deserialization is disabled. Never clear a shared cache while reconciliation locks are active.
- The OTP migration invalidates legacy OTPs and revokes legacy unexpiring customer tokens. Users need one fresh login. Filament sessions are separate; no admin user or password is changed.
- Provision SESSION_ALLOWED_ORIGINS as exact HTTPS public origins, TRUSTED_CLIENT_IP_HEADER at private Next ingress, Laravel TRUSTED_PROXIES as exact Next/proxy addresses, ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS. Ingress must overwrite forwarding headers and prevent direct origin access. CMS GETs alone intentionally expose public CORS.
- Run `npm run preflight` and `php artisan production:preflight` inside deployed processes. Both are non-mutating. Local development is expected to fail production configuration gates.

### 4. Start supervised processes

- Invoke `php artisan schedule:run` every minute using host cron/task scheduling. schedule:list alone is insufficient proof.
- Supervise workers for lodgify, media and default queues. Prefer separate media and Lodgify workers to prevent large uploads starving sync.
- Lodgify job timeout is 480s, service budget 420s, shared sync lock 600s and default retry_after 660s. Run a separate Lodgify worker with `queue:work --queue=lodgify --timeout=480 --tries=1`; keep media worker sizing independent. Validate these budgets against real staging latency and DB reconciliation. Never configure retry_after <= 600s.
- Scheduler, queued and manual sync now acquire the same `lodgify:reconciliation` lock. Use one shared cache across replicas (Redis or database), or file cache only on one host. The process-local Next limiter is supplementary; provision shared/edge limits for multiple replicas.
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

## Evidence record for 2026-09-22

- Frontend: typecheck passed, 21 tests passed, and the Next.js 16.3.5 standalone production build passed.
- Backend: 116 tests and 400 assertions passed on PHP 8.4.25 and Laravel 13.32.0.
- Services browser QA: scroll direction, manual selection, keyboard focus guard and reduced-motion policy passed. Widths 390, 768, 1280 and 1440 had no horizontal overflow. All Services eyebrow labels are absent.
- Dependency audits: npm production audit and Composer locked production audit reported no known vulnerability advisories.
- Release artifact: standalone Next.js server, production Laravel vendor tree, release manifest, deployment script and SHA-256 workflow are implemented. Artifact inspection found zero environment files after the packaging guard was added.
- Scheduled definitions: Lodgify sync and health every five minutes plus daily operational/media/failed-job pruning are registered.
- Local production preflight intentionally fails production-only environment checks and detects seven retired queued mail payloads. These local jobs were not deleted because queue cleanup is an explicit deployment data operation.
- Host scheduler execution, worker uptime, real SMTP inbox delivery, backup restore, DNS, firewall and Dewaweb process support remain NOT VERIFIED.
- No production deploy, live email, DNS/firewall change or production database mutation was performed.

The preliminary [security audit](2026-09-17-production-security-audit.md) is the required next review gate.
