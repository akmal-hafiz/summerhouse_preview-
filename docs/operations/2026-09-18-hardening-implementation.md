# Approved hardening implementation

The client approved the security audit and release runbook on 2026-09-18.
Production remains blocked until local, staging and server gates are verified.

## Execution order

1. Refresh locked dependency advisories and upgrade compatible supported packages.
2. Hash OTPs, atomically consume them, preserve attempt counts, and use configured mail.
3. Move customer credentials to a same-origin HttpOnly session boundary with origin/CSRF protection.
4. Bound rate limiting, sanitize logs, remove HTML construction, align villa cache policy.
5. Protect reconciliation with one shared lock and measured queue timing.
6. Add preflight/CI regression evidence and update the release runbook.

Use explicit runtime paths, not a global Laragon runtime switch. Additive migrations
must preserve villa selections, reviews and audit history. Never send real mail or
mutate production infrastructure as part of local verification.

## Review integration boundary

Airbnb guest reviews require an authorized source, permitted reuse and a verified
Airbnb listing-to-Lodgify property mapping. Do not scrape Airbnb, expose credentials,
or treat host-to-guest review automation as guest-review export. Existing reviews
remain unchanged until a supported source and design are confirmed.

## Implemented controls and reasons

| Area | Implementation | Reason |
| --- | --- | --- |
| Customer sessions | Same-origin fixed-route Next.js proxy, HttpOnly cookies, exact origin and CSRF checks, seven-day tokens, no browser bearer storage | Reduce credential theft and forged authenticated writes. Backend authorization remains mandatory. |
| OTP | Keyed digest only, atomic locked consumption, committed wrong-attempt counts, invalidation after failed mail delivery | A database leak should not reveal plaintext codes; replay and parallel consumption must not create multiple outcomes. |
| Account privacy | Neutral lookup response and normalized email; bounded account/IP limits | Avoid account enumeration and trivial forwarding-header rate-limit bypass. |
| Lodgify | Shared reconciliation lock, bounded request/retry budget, queue timing alignment, genuine read-only dry run | Avoid overlapping reconciliation and duplicate jobs; preserve prior room data during transient failures. |
| CMS recovery | Cache only validated successful JSON; scalar/array cache payloads with object deserialization disabled | Do not cache HTML error pages or deserialize arbitrary objects. Editorial data remains uncached in Next.js; villa caching stays at most 300 seconds. |
| Logs | Secret, bearer, email, credential URL and control-character redaction in both runtimes | Keep useful operational evidence without leaking customer or provider credentials. |
| Browser boundary | Exact hosts/proxies/CORS, secure production cookies, conditional HSTS, CSP report-only, safe map popup text nodes | Reduce cross-origin, host-spoofing and injection exposure without prematurely breaking checkout or assets. |
| Dependencies | Locked supported Next.js/Laravel stack, PHP 8.4 requirement, zero current dependency advisories | Remove known vulnerable versions and make installation reproducible. |
| Release process | Read-only production preflight and pinned CI actions with tests, build and audits | Make incorrect configuration and regressions visible before deployment. |

The historical audit is a baseline, not a claim that all OWASP categories or infrastructure risks are closed. CSP is deliberately report-only pending staging review. Process-local Next.js limits supplement, rather than replace, shared backend and ingress limits.

## Verification on 2026-09-18

- Frontend type checking: passed.
- Frontend tests: 17 passed.
- Production Next.js build: passed, TypeScript build errors are no longer ignored.
- Backend PHPUnit under explicit PHP 8.4.25: 113 tests, 393 assertions passed.
- Frontend and Composer dependency audits: no known advisories at verification time.
- Browser development QA at widths 1440, 1280, 768 and 390: 39 villa cards, no horizontal overflow, Bawa House and Semanggi absent.
- Login modal: neutral lookup flow, keyboard focus and mobile layout checked; no browser bearer token stored. About/map page loaded without console errors in the isolated test setup.
- Local OTP migration applied after verifying the environment and loopback database. Application cache cleared locally after the serialization change.
- CI configuration added, but no remote CI run or production deployment performed.

An initial `artisan test` invocation spawned PHP without the explicitly enabled SQLite extensions and failed with missing-driver errors. Direct PHPUnit with the same explicit PHP 8.4 binary and extensions passed the complete suite. The failed invocation is not treated as an application regression or hidden from this evidence.

## Operator requirements before production

1. Use PHP 8.4+ for web requests, Composer, scheduler and queue workers, not just the terminal. The existing local port 8000 server still uses PHP 8.1; it was not stopped or globally reconfigured. Restart it with the supported runtime before continuing local work.
2. Back up first. Pause traffic/workers as needed, apply the additive OTP migration, clear old application cache, rebuild configuration and restart workers. Legacy customer tokens without expiry are revoked and outstanding legacy OTPs invalidated; customers must sign in/request a new code. Villa records, reviews and admin accounts are not deleted.
3. Configure exact session origins, hosts, CORS and trusted proxies. Ingress must overwrite trusted client-IP headers and the backend must not be publicly bypassable. Use shared locks for multiple hosts.
4. Run frontend and backend preflight on the actual host. Local production preflight intentionally does not pass local debug/HTTP settings.
5. Test real SMTP inbox delivery, bad credentials, provider timeout, queue restart and scheduler execution. No real customer email was sent during local tests.
6. Test actual MySQL concurrent OTP consumption, backup restoration, staging checkout/assets, CSP violations, stale snapshot recovery and multi-worker reconciliation. SQLite tests alone do not prove infrastructure behavior.
7. Verify private admin ingress/MFA and least-privilege database/audit grants separately. Application append-only behavior is not immutable storage against a database administrator.

Production remains NO-GO until these host/staging gates are evidenced. No paid monitoring service or Airbnb scraping integration was added.
