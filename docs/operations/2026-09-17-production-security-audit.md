# Production security audit and proposed hardening

Date: 2026-09-17
Historical baseline: NO-GO for production. This is a preliminary code/dependency audit, not a penetration-test certificate. The client approved this design on 2026-09-18. Findings below describe the original baseline. See [implementation evidence](2026-09-18-hardening-implementation.md) for changes and remaining release gates.

## Scope and boundaries

Reviewed Next.js public pages and API routes, Laravel authentication, Filament access, Lodgify reconciliation, queue configuration, logs, and dependency lockfiles. No production host was accessed, no real email was sent, no real booking was created, and no production database was changed.

The threat model includes anonymous API abuse, credential/OTP attacks, cross-account access, untrusted CMS/upstream content, compromised dependencies, accidental secret disclosure, and upstream outages. Infrastructure controls cannot be verified from source alone.

## Evidence and release blockers

| Finding | Evidence | Required resolution |
| --- | --- | --- |
| Frontend vulnerable dependency ranges | `npm audit --omit=dev`: 7 packages, 2 critical, 3 high, 2 moderate | Upgrade patched Next.js, MapLibre and transitives, remove outdated PostCSS override, then repeat audit and browser QA |
| Backend advisories | `composer audit --no-dev --locked`: 16 advisories on Guzzle, Laravel, CommonMark and Livewire, including overlapping reports of the same issue | Update supported compatible versions and rerun audit; counts are advisory records, not distinct exploited vulnerabilities |
| Unsupported backend baseline | Locked Laravel 10.50.2; local CLI PHP 8.1.10 | Migrate to a supported Laravel/PHP combination, checking Filament, Livewire, tests, images and queues |
| SMTP setting does not control OTP delivery | Both OTP controllers call `Mail::mailer('resend')` | Route mail through configured default mailer; test SMTP and optional Resend independently; never silently report success through a log-only fallback |
| OTP codes stored in original form | `OtpCode.code` plus direct string comparisons in both controllers | Hash new OTPs, atomically consume with row lock and attempt limit, invalidate outstanding old codes during migration; never log the code |
| Long-lived browser tokens | Sanctum expiration null; `auth-client.ts` stores bearer tokens in localStorage | Expiring/revocable sessions; propose same-origin HttpOnly cookie boundary with explicit CSRF/origin checks and a migration that signs out old sessions |
| Enumeration and abuse exposure | Lookup returns existence and first name; login throttled by IP only; password reset limiter lacks independent IP bound | Generic lookup response and neutral UX; combine normalized account plus trusted-IP limits and bounded token creation |
| Build bypasses TypeScript gate | `next.config.ts` sets `ignoreBuildErrors: true` | Build must fail on type errors; keep separate typecheck too |
| Broad cross-origin configuration | Next globally sends wildcard ACAO; Laravel CORS wildcard | Explicit deployment origins for auth/write routes; public GET exposure is not itself authorization; maintain bearer/cookie architecture consistency |
| Header-based per-process limiter | `rateLimit.ts` trusts leftmost forwarded IP; unbounded Map without expired-entry pruning | Trusted reverse-proxy IP contract, bounded eviction, edge limits and shared limits for multiple replicas; do not trust arbitrary incoming forwarding headers |
| Queue timing and lock mismatch | Job has no timeout; connection retry_after 90s; scheduler and unique job use separate locks | One shared sync lock, bounded sync duration, job timeout below retry_after, separate media/Lodgify workers; test abandoned job recovery |
| Room transport failures need explicit coverage | Pool can throw; HTTP room errors retain old data but pool transport exception can fail whole sync | Preserve full snapshot on any failure, add retry within concurrency bound, test one/all transport failures and delayed upstream |
| Log sanitization is incomplete | Logger filters metadata key names but accepts original error.message and ordinary string values; OTP controller logs email/error | Redact known secret values and credential-bearing URLs, bound strings/control characters, exclude OTP/PII, test both message and metadata |
| Application-only append-only protection | Eloquent event hooks block model update/delete; bulk queries/direct DB writes bypass hooks | Least-privilege runtime DB grants and restricted audit-table mutation; document backup/admin access boundaries, never claim WORM immutability |
| HTML map popup construction | `LibreDestinationMap.tsx` uses setHTML with destination properties | Render text through DOM textContent/setDOMContent; installed MapLibre attribution advisory separately requires patched dependency |
| Collection response cache exceeds five-minute villa policy | Collection-images sends s-maxage 1800 | Align Lodgify-backed HTTP cache with 300s maximum and explicitly review stale handling |

## OWASP Top 10:2025 coverage matrix

These are risk categories, not ten packages to install. A passing unit test does not close a category.

| Category | Existing evidence | Proposed closure evidence |
| --- | --- | --- |
| A01 Broken Access Control | Admin/customer boundary, user-scoped wishlists and profile role restrictions pass regression tests | Test all admin actions, public write inputs, object ownership, non-admin Livewire actions and signed routes |
| A02 Security Misconfiguration | Debug/host/proxy/firewall production settings not verified; broad CORS; build type bypass | Fail-closed production preflight, explicit origins/hosts, secure cookies, HTTPS headers, restricted debug routes, server checks |
| A03 Software Supply Chain Failures | npm and Composer audit blockers above | Supported stack, patched lockfiles, reproducible clean installs, audit gate, dependency review and update policy |
| A04 Cryptographic Failures | Passwords hashed; original OTPs and browser tokens remain concerns | Hashed OTPs, expiring HttpOnly sessions, TLS verification, secure secret provisioning and encrypted tested backups |
| A05 Injection | Eloquent bindings used; public review HTML stripping already tested; map HTML construction identified | DOM text rendering, hostile-input tests, CRLF/email validation, context-safe output and staged CSP rollout |
| A06 Insecure Design | Tri-state availability, anomaly rejection and LKG fallback already exist | Threat model, bounded abuse limits, approved operational policy and complete-failure/recovery tests |
| A07 Authentication Failures | Generic invalid login; OTP attempt limits exist but consumption is not atomic | Atomic OTP use, replay/race tests, generic lookup, account/IP limits, expiry/revocation and admin MFA rollout |
| A08 Software or Data Integrity Failures | Sync promotion is transactional; model audit update/delete blocked | Shared sync lock, upstream schema tests, DB audit privileges and restore verification; no destructive migration |
| A09 Security Logging and Alerting Failures | Structured Lodgify logs/incidents/DB notifications exist | Redaction tests, auth/security events, alert dedupe/recovery, restricted log access and retention review |
| A10 Mishandling of Exceptional Conditions | Timeout, retry, circuit, partial pagination and LKG regression tests added | Slow API, abort/transport room pool, abandoned worker and SMTP failure tests; all failure responses bounded and safe |

## Approaches and recommendation

1. Recommended: supported-stack migration plus targeted hardening in small verified commits. Preserve CMS schema, villa policy and visual language. Start with runtime/framework/dependency compatibility, then authentication/mail, perimeter/logging, and finally release gates. This costs more regression effort but addresses the root production blockers without a rewrite or paid monitoring service.
2. Patch only in the current stack: faster initially, but unsupported Laravel/PHP and missing compatible security fixes remain. Not an acceptable production recommendation.
3. Full backend rewrite: more disruption and migration risk; not justified for this Summerhouses project.

Proposed target: latest patched PHP 8.4 runtime and a supported Laravel version. Evaluate Laravel 13 compatibility first with current Filament/Livewire packages; Laravel 12 is a fallback only with an explicit upgrade-before-EOL milestone. Do not choose a target version by bypassing Composer platform requirements. Next.js must be at least 16.3.3 for the reviewed RCE advisory; MapLibre at least 6.4.1 for its reviewed advisory. Recheck advisories on installation day rather than treating these minimums as forever safe.

## Approval boundary

Proposed components and migration behavior:

- Keep Laravel authoritative for users, role checks, villa policy and reconciliation. Next.js becomes a same-origin session boundary for customer authentication and wishlist operations, with explicit fixed upstream routes rather than an arbitrary URL proxy.
- Store the opaque customer token only in a server-set HttpOnly, SameSite=Lax cookie, Secure in production. Use a seven-day absolute token expiry, revoke on logout/reset and require login after expiry. Reject cross-origin writes using an approved exact Origin allowlist plus CSRF protection. Public CMS GETs remain intentionally public.
- Migrate browser users by clearing legacy localStorage credentials and requiring one fresh login. Admin Filament sessions remain separate and retain Laravel CSRF and role enforcement. Review MFA or private admin ingress without paid services; do not alter admin access without a tested recovery path.
- Store only a keyed digest of new OTPs in an additive field, expire outstanding legacy OTPs, consume through a DB transaction/row lock, and enforce account/IP limits. Failed delivery never returns a usable successful-send state. Keep mail configurable through the default Laravel mailer with bounded network timeout.
- Add a shared reconciliation lock covering scheduler, queued and manual runs, then size workers and retry_after using measured worst-case request budgets. Do not drop old schema, audit data, reviews or selections during migration.
- Roll security headers/CSP out against actual browser asset and connection requirements. Start CSP in report-only mode, inspect violations, then enforce a tested policy; never claim report-only blocks XSS.
- Add non-mutating deployment preflight checks with redacted output, isolated tests and a supported-runtime/dependency gate. Server firewall, TLS, DNS and backup restore remain deployment evidence, not source-code claims.

Stage 8 regression tests and Stage 9 release documentation follow the already approved plan. The broader security migration changes runtime requirements, email provider behavior, lookup UX, and session storage. The brainstorming skill requires review of this new design before implementation. No major dependency upgrade, global Laragon runtime switch, token/session migration, real SMTP send, DNS/firewall mutation or production deploy is authorized by this audit alone.

## Verification performed this session

- Baseline Laravel: 85 tests, 285 assertions passed.
- Expanded suite before final room case: 102 tests, 342 assertions passed.
- Frontend resilience/availability: 9 tests passed, no upstream requests.
- Typecheck passed; existing production build passed but skipped internal type validation because of current configuration.
- `schedule:list` contains both Lodgify commands every five minutes; this does not prove a host cron process is running.
- Dependency audit failed release criteria. Composer initially timed out, then a retry completed and reported advisories.
- Full suite and browser evidence for the final test set are recorded in the release runbook.
- Final Laravel suite: 103 tests, 346 assertions passed. No application hardening behavior has been changed yet.

## Primary sources

- [OWASP Top 10:2025](https://top10.owasp.org/2025/)
- [Laravel support policy](https://laravel.com/framework/docs/12.x/releases#support-policy)
- [PHP supported versions](https://www.php.net/supported-versions.php)
- [Next.js Windows RCE advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36)
- [MapLibre attribution sanitizer advisory](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579)
- [Laravel email validation advisory](https://github.com/laravel/framework/security/advisories/GHSA-5vg9-5847-vvmq)
