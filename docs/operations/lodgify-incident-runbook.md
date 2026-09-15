# Lodgify Internal Incident Runbook

Last updated: 2026-09-15

## Purpose

The Summerhouse Lodgify integration is designed to recover automatically. This runbook is for engineering when the internal dashboard reports an issue that automation cannot safely resolve.

No villa cache row, homepage selection, review, wishlist, media relation, or property audit event should be hard-deleted during incident response.

## Normal operation

- Laravel runs `lodgify:sync` every five minutes.
- Laravel runs `lodgify:health-check` every five minutes.
- Next.js reads the policy-filtered Laravel property catalog with a five-minute cache.
- Live availability and prices continue to come from Lodgify.
- An active managed property appears automatically.
- An inactive or missing property is hidden automatically.
- A previously removed property is restored automatically if Lodgify reports it active.
- Individual inactive transitions are informational and do not require acknowledgement.

## Health meanings

### Green

- The latest successful sync is less than 10 minutes old.
- No critical incident is open.
- No removed or missing property is referenced by the homepage.

No action is required.

### Yellow

- Data is 10 to 30 minutes old.
- A repeated transient failure, count anomaly, room degradation, or suspected missing property exists.

Automation continues using the last-known-good snapshot. Inspect the latest sync runs and correlation IDs before changing configuration.

### Red

- Data is more than 30 minutes old.
- Authentication failed.
- Repeated synchronization failed.
- A removed or missing property remains referenced by the homepage.
- No safe snapshot exists.

Public pages continue to prefer known-good data and controlled fallback behavior.

## Timeout or network incident

1. Open Admin, then Lodgify Health.
2. Confirm whether the latest failure recovered on the next scheduled run.
3. Check the incident occurrence count and latest run UUID.
4. Search the Laravel log for the run UUID or correlation ID.
5. If failures continue beyond 30 minutes, verify outbound HTTPS and DNS connectivity from the production server to `api.lodgify.com`.
6. Do not clear villa records or homepage selections.

## Authentication incident

1. Confirm `LODGIFY_API_KEY` exists in the production secret environment.
2. Confirm the key has not been revoked in Lodgify.
3. Replace the secret if required without copying it into logs, tickets, or database records.
4. Clear Laravel configuration cache after a secret change.
5. Run one manual sync and confirm the authentication incident resolves.

## Count anomaly

1. Compare the candidate count with the previous successful run.
2. Confirm pagination completed and Lodgify itself shows the expected portfolio.
3. Do not lower the safety threshold merely to force a suspicious snapshot through.
4. Allow the next complete run to promote automatically after the upstream response returns to normal.

## Missing property

- First complete absence becomes `suspected_missing`.
- Second complete absence becomes `missing`.
- Neither state deletes the local property record.
- If the property returns in Lodgify, it recovers automatically.
- If it returns active, it also becomes managed and publicly eligible automatically.

## Homepage reference incident

The public website already excludes the invalid property and selects an eligible fallback. The saved selection remains for auditability.

Engineering may replace the selection in Homepage Manager when convenient. This is not required to keep the public page safe.

## Manual commands

From the Laravel backend directory:

```text
php artisan lodgify:sync
php artisan lodgify:health-check
php artisan lodgify:prune-operations --dry-run
```

The prune command removes only old completed sync-run records and old resolved incidents. It never prunes property audit events.

## Production process requirements

The server must run both processes continuously:

```text
php artisan schedule:run
php artisan queue:work --queue=lodgify,media,default
```

The scheduler should be invoked by the host every minute. The queue worker should be managed by the production process manager and restarted during deployment.

Without the scheduler, automatic five-minute synchronization and health checks do not run. Without the queue worker, the optional Admin `Sync now` action remains queued, although scheduled synchronization continues.

## Safe rollback

1. Disable incident notifications before reverting application code if migrations must remain temporarily.
2. Keep the current `villa_caches` and `lodgify_property_events` data.
3. Revert the public catalog only if a verified safe property filter remains in place.
4. Do not drop audit tables in production incident response.
5. Preserve a database backup before any later schema rollback.
