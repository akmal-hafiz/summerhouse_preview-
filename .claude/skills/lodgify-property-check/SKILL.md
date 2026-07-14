---
name: lodgify-property-check
description: Validate that Lodgify property IDs referenced in homepage_villa_selections, env vars, or hardcoded DEFAULT_*_IDS arrays actually exist and are active in the Lodgify account. Use before admin saves homepage CMS selections or when debugging empty homepage sections.
disable-model-invocation: true
---

# Lodgify Property Check

CMS lets admin pick villa IDs by free text. Bad ID = silently empty homepage slot. This skill validates IDs against live Lodgify properties.

## Workflow

1. **Collect IDs to check** from:
   - `lib/lodgify/villas.ts` constants (`DEFAULT_FEATURED_PROPERTY_IDS`, `DEFAULT_SHORT_STAY_IDS`, etc.)
   - `homepage_villa_selections` table: `php artisan tinker --execute="echo json_encode(App\Models\HomepageVillaSelection::pluck('lodgify_property_id','slot'));"`
   - `.env` keys `FEATURED_PROPERTY_IDS`, `SHORT_STAY_PROPERTY_IDS`, `EXTENDED_STAY_PROPERTY_IDS`, `FEATURED_HOME_PROPERTY_IDS`

2. **Fetch live property list** via existing `lib/lodgify/client.ts → fetchProperties()`:
   ```bash
   cd C:/laragon/www/summerhouses-next
   npx tsx -e "import('./lib/lodgify/client').then(m => m.fetchProperties()).then(rows => console.log(rows.map(p => ({id: p.id, name: p.name, active: p.is_active}))))"
   ```

3. **Diff** — print which IDs are missing from Lodgify, which are present but `is_active=false`, which are unused

4. **Suggest fix** — drop dead IDs from homepage_villa_selections, or warn admin via HomepageManager

## Output

Plain text report:
```
✓ Active:   475365 (Villa Arta), 475372 (...)
✗ Missing:  996666 → not found in Lodgify account
⚠ Inactive: 703452 (Villa X) → is_active=false, will be filtered out
○ Unused:   862190 → in Lodgify but not in any CMS slot
```

## Cost

Uses Lodgify API quota — one `/properties` call. User-only because billing impact.
