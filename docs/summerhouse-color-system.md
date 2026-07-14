# SummerHouse Color System

This document is the public website color contract. Use semantic CSS tokens from `app/globals.css` instead of introducing raw colors in components.

## Official Palette

- `#FAFAF9` — Porcelain White
- `#2E2E2C` — Deep Charcoal
- `#446B4A` — Deep Moss Green
- `#F2EDE3` — Alabaster Cream
- `#7F8C78` — Warm Sage Green
- `#C7A58A` — Muted Terracotta

## Semantic Mapping

- `--color-page`: default page background, usually `#FAFAF9`.
- `--color-surface`: quiet raised surface.
- `--color-surface-warm`: warm editorial panels and card surfaces, from `#F2EDE3`.
- `--color-text`: default text and headings, `#2E2E2C`.
- `--color-text-muted`: body copy and secondary metadata.
- `--color-text-soft`: low-emphasis metadata.
- `--color-brand`: primary brand action, `#446B4A`.
- `--color-button-primary-bg`: main CTA background.
- `--color-border`: light neutral divider.
- `--color-border-moss`: selected/active moss border.
- `--color-card-bg` and `--color-card-bg-warm`: card surfaces.
- `--color-chip-bg`, `--color-chip-text`, `--color-chip-border`: chip system.
- `--color-glass-bg` and `--color-glass-border`: frosted drawer/search material.
- `--color-state-*`: functional feedback only.

## Color Jobs

Use Porcelain White for calm page space and default backgrounds.

Use Deep Charcoal for headings, body copy, navigation text, villa names, important metadata, and default icons.

Use Deep Moss Green for primary buttons, selected states, active filters, focus rings, important brand accents, and CTAs. Do not turn every icon green.

Use Alabaster Cream for warm alternate sections, destination cards, testimonial panels, soft editorial cards, and frosted material bases. Do not make every section cream.

Use Warm Sage Green for chip backgrounds, icon tile backgrounds, subtle supporting surfaces, and nature-tinted accents. Do not use it for small text unless contrast is tested.

Use Muted Terracotta for sparse editorial accents, subtle dividers, and warm decorative details. Do not use it as a primary CTA or small body text.

## What Not To Do

- Do not introduce new off-whites, random grays, navy, blue, purple, or bright tourism colors in public UI.
- Do not use sage or terracotta as small text on light backgrounds.
- Do not use terracotta for primary buttons.
- Do not make broad global selectors for all headings, paragraphs, or cards.
- Do not force the public marketing palette onto admin/CMS status colors.

## Accessibility Notes

`#2E2E2C` on `#FAFAF9` is safe for normal text.

`#FAFAF9` on `#446B4A` is safe for primary buttons.

`#7F8C78` on `#FAFAF9` is not reliable for small text. Use it as a surface, chip background, or icon tile.

`#C7A58A` on `#FAFAF9` fails small-text contrast. Use it only as a subtle accent, divider, or warm background tint.

## Public Website Examples

- Primary CTA: `background: var(--color-button-primary-bg); color: var(--color-button-primary-text);`
- Card surface: `background: var(--color-card-bg-warm); border: 1px solid var(--color-card-border);`
- Muted copy: `color: var(--color-text-muted);`
- Chip: `background: var(--color-chip-bg); color: var(--color-chip-text); border-color: var(--color-chip-border);`
- Glass drawer/search material: `background: var(--color-glass-bg); border-color: var(--color-glass-border);`

## Future Developer Notes

When a color is needed, first ask what job it performs: page, surface, text, action, border, chip, glass, overlay, or functional state. If the answer is unclear, do not add a color.

If a third-party API requires literal colors, use official palette hex values and document the exception near the code.
