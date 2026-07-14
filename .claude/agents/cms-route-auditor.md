---
name: cms-route-auditor
description: Audit Next.js page changes for CMS integration consistency. Verifies every CMS fetch has null fallback, no hardcoded API URLs, props prop-drilled correctly, server component await used. Run after editing any app/*/page.tsx that touches CMS.
tools: Read, Grep, Glob
---

# CMS Route Auditor

Read-only review agent. Triggers after edits to `app/*/page.tsx` or components that consume CMS data.

## Checklist per page

1. **Server component declaration** — file imports from `@/lib/cms` must be in a server component (no `"use client"` at top of `page.tsx`)
2. **`await` on every CMS call** — `getCmsXxx()` returns a Promise, never used without `await`
3. **`Promise.all` for parallel fetches** — multiple independent CMS calls in one page should be parallelized
4. **Null fallback** — every prop derived from `getCmsXxx()` must work when value is `null`:
   - Component signature: prop is `Type | null | undefined`
   - Body: `const list = propValue && propValue.length ? propValue : defaultValue;`
5. **No hardcoded URLs** — no `http://localhost:8000` in `.tsx`. Must come from `CMS_API_URL` env via `lib/cms.ts`.
6. **Type alignment** — TS type for prop matches `CmsXxx` type exported from `lib/cms.ts`
7. **Cache strategy** — `lib/cms.ts` wrappers use `{ next: { revalidate: 300 } }` (centralized); page-level fetches should NOT add their own `cache` headers

## How to run

Spawn this agent with: "Audit the recent edits to `app/about/page.tsx` and `components/about/About.tsx` against the CMS integration pattern."

## Output format

```
PAGE: app/about/page.tsx
  ✓ Server component
  ✓ Parallel fetch via Promise.all
  ✓ Null fallback on testimonials, faqs
  ✗ Missing await on getCmsTestimonials (line 78)
  ✗ Hardcoded URL "http://localhost:8000" (line 12)

ACTION: 2 issues require fix
```

Do not modify files — report only.
