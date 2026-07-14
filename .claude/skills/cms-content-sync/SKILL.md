---
name: cms-content-sync
description: Keep CmsContentSeeder, page_sections JSON schema, and Next.js component fallback arrays consistent when hardcoded copy changes. Use when modifying defaultTestimonials, defaultFaqs, defaultServiceCards, defaultGalleryItems, or homepage section copy.
---

# CMS Content Sync

When admin-editable content changes anywhere in the codebase, three layers must stay in sync:

1. **Next.js fallback** (component `default*` arrays in `components/about/About.tsx`, `components/services/ServicesPageContent.tsx`, `components/contact/Contact.tsx`, `components/gallery/GalleryPage.tsx`)
2. **Laravel seeder** (`backend/database/seeders/CmsContentSeeder.php`, `ArticleSeeder.php`)
3. **CMS API contract** (`backend/app/Http/Controllers/CmsController.php` serializer keys must match what frontend expects in `lib/cms.ts` types)

## Workflow

When user edits a `default*` array:

1. **Identify which layer changed** — usually the React component
2. **Find the seeder row** — `grep -rn "{key-text-from-array}" backend/database/seeders/`
3. **Update the seeder** to match new content
4. **Re-seed** in dev: `php artisan db:seed --class=CmsContentSeeder` (or `--class=ArticleSeeder`)
5. **Verify cache flushed** — model `booted()` hooks fire on save() but bulk `update()` does NOT

## Schema mapping

| Component default array | Seeder method | Page sections row | CMS endpoint |
|---|---|---|---|
| `defaultTestimonials` (About.tsx) | `seedTestimonials()` | n/a (own table) | `GET /v1/cms/testimonials/about` |
| `defaultFaqs` (per page) | `seedFaqs()` | n/a | `GET /v1/cms/faqs/{page}` |
| `defaultOperationalServices` etc. | `seedServiceCards()` | n/a | `GET /v1/cms/service-cards/{category}` |
| `defaultGalleryItems` | `seedGalleryItems()` | n/a | `GET /v1/cms/gallery` |
| Hero hardcoded `heroSlides[0]` | `seedPageSections()` row `page=home,section=hero` | yes | `GET /v1/cms/page/home/section/hero` |

## Anti-patterns to flag

- Editing seeder without updating component fallback (mismatch when CMS empty)
- Adding new fields to seeder without adding to `CmsController` serializer
- Adding new fields to TS type without backend `$fillable` matching
- Using `Model::where()->update()` in seeders/tinker — skips events → cache stale
