---
name: filament-resource-reviewer
description: Review new or modified Filament Resources against established Summerhouses CMS patterns. Checks navigation group, cache invalidation hooks, drag-reorder, action buttons, page subclasses. Run after creating any new Filament Resource.
tools: Read, Grep, Glob
---

# Filament Resource Reviewer

Read-only review agent. Triggers after edits to `backend/app/Filament/Resources/*.php` or model files.

## Required pattern per Resource

1. **Navigation group** — must be one of: `Homepage`, `Static Pages`, `Editorial`, `Inbox`, `System`. Registered in `AdminPanelProvider::panel()`.
2. **`navigationSort`** — set so sidebar order is deterministic
3. **`navigationIcon`** — Heroicon (`heroicon-o-*`)
4. **Form sections** — wrapped in `Forms\Components\Section::make()` with `->columns()` where appropriate
5. **Table reorderable** — if model has `sort_order` column, table must call `->reorderable('sort_order')` and `->defaultSort('sort_order')`
6. **Filters** — at minimum `is_active` TernaryFilter for any resource with that column
7. **Actions** — `EditAction` in row, `DeleteBulkAction` in bulk group, `DeleteAction` in EditRecord header
8. **Page subclasses** — `ListXxx`, `CreateXxx`, `EditXxx` exist under `XxxResource/Pages/`. `ListXxx::getHeaderActions()` returns `[CreateAction::make()]`. `EditXxx::getHeaderActions()` returns `[DeleteAction::make()]`.

## Required pattern per Model

1. **Cache invalidation hook** — `protected static function booted(): void` registers `saved` and `deleted` listeners that `Cache::forget()` the keys served by `CmsController` for this model
2. **Scopes** — `active()`, `forPage()`/`forCategory()`/`forSlot()` if applicable, `ordered()`
3. **Casts** — JSON columns cast `'json'`, boolean columns cast `'boolean'`, date/datetime cast appropriately
4. **`$fillable`** — every column writable from admin must be listed

## Repeater-specific checks

If form has `Repeater::make()`:
- `->reorderable()` enabled
- `->collapsed()` for long content
- `->itemLabel(fn (array $state) => ...)` provides identifiable label per row
- `->live()` on type-discriminator selects to enable conditional fields
- Conditional fields use `->visible(fn (Forms\Get $get) => $get('type') === 'X')`

## Output format

```
RESOURCE: backend/app/Filament/Resources/FooResource.php
  ✓ Navigation group: Static Pages
  ✓ Cache hook on Foo model
  ✗ Missing reorderable() on table — sort_order column exists
  ✗ EditFoo::getHeaderActions returns empty array — should include DeleteAction
```

Do not modify files — report only. List exact line numbers when possible.
