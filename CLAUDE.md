# Summerhouses Next — Engineering Rules

Next.js frontend (root) + Laravel 10 / Filament v3 CMS (`backend/`). MySQL via Laragon. Dev: `npm run dev` (port 3000) + `php artisan serve` (port 8000).

## Post-Change Verification Protocol

Applies after EVERY debugging session, error fix, refactor, or new feature. No exceptions. Work is not "done" until every applicable step passes.

### 1. Syntax & static checks
- PHP: `php -l <changed file>` for every changed PHP file.
- Frontend: `npx tsc --noEmit` if any `.ts/.tsx` changed.

### 2. Runtime verification — never claim "fixed" without executing the code path
- Reproduce the original failure first. Confirm it fails. Then apply fix. Confirm it passes.
- Filament resources: verify query actually runs — `php artisan tinker` the resource query (`Resource::getEloquentQuery()->count()`), and exercise tab/filter closures if touched.
- API endpoints: `curl` the route, assert status + JSON shape.
- Livewire pages: load page in browser or assert no exception via HTTP status.

### 3. Cache flush — Laravel serves stale code without this
```
php artisan view:clear && php artisan cache:clear && php artisan config:clear
```
Run after ANY change to: Blade views, Filament resources/pages, config, render hooks, service providers. Then hard-refresh browser (Ctrl+Shift+R) before judging the result.

### 4. Regression sweep
- Re-test adjacent features sharing the changed code (e.g. change TestimonialResource → test ALL its tabs, not just the broken one).
- If a shared component/service changed, grep for all usages and spot-check each.

### 5. Report honestly
- State what was verified WITH evidence (command + output), what was not verified, and why.
- Failed test = say so, show output. Never report success on unverified work.

## Filament v3 Gotchas (learned from real bugs)

1. **Closure param names are injection keys.** `modifyQueryUsing`, `visible`, `action`, etc. resolve closure params BY NAME (`$query`, `$record`, `$livewire`, `$state`). Wrong name (e.g. `$q`) → Laravel container injects a fresh, model-less object → runtime `Error: Call to a member function ... on null`. Always use canonical names.
2. **`defaultSort` on a nullable column** (e.g. `published_at`) makes rows with NULL sort unpredictably and can hide pending records. Sort admin queues by `created_at`.
3. **Eager-load table relations** in `getEloquentQuery()` (`->with('villa:id,...')`) — avoids N+1 that makes rows appear stuck loading during Livewire hydration.
4. **Render hooks inject on every panel page.** Global overlays (tours, modals) with `box-shadow: 0 0 0 9999px` spotlight patterns dim the whole viewport when their target selector misses. Guard or remove.
5. **CMS media fields use `FileUpload`**, never a `TextInput` URL (project rule).
6. **Never name a scope `scopeForPage`.** Eloquent resolves scopes before query-builder methods, so `forPage()` (used internally by `paginate()`) gets shadowed → `where page = '1'` instead of `LIMIT/OFFSET` → tables show "Showing 0 to 0 of N results" with zero rows. Same risk for any scope matching a `Illuminate\Database\Query\Builder` method name (`forPage`, `latest`, `oldest`, `when`, ...). Use `scopeOnPage` etc.
7. **Keep `filament/filament` constraint caret-pinned (`^3.x`)**, never exact-pinned while Livewire floats — version drift breaks Alpine plugins silently: all `fi-modal-close-overlay` backdrops render visible and dim the whole panel.

## Data Rules

- Testimonials/reviews enter ONLY via public website forms (`POST /v1/reviews`, `/v1/owner-testimonials`) → land as `status=pending`. No manual CreateAction in CMS.
- Status transitions enforced in `ReviewService::TRANSITIONS` — never bypass with direct `update()`.
- Never modify DB schema/migrations for a UI bug. UI bugs get UI fixes.
- Public visibility = `status=approved` + `is_active=1` + `published_at NOT NULL` (`scopePublished`).

## Debugging Method (mandatory order)

1. Read the exact error + stack trace. Identify the first APP frame (not vendor).
2. Reproduce minimally (tinker / curl / isolated call) before editing anything.
3. Read vendor source at the failing line to understand the mechanism — don't guess.
4. One hypothesis → one targeted fix → re-run the reproduction.
5. Then run the full Post-Change Verification Protocol above.
