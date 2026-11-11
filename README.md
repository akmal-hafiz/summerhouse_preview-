# Summerhouse Bali client preview

Frontend only. This repository is a showcase of the Summerhouse Bali website, built from a data snapshot of 2026-11-11 (`data/previewCmsSnapshot.json`).

It has no accounts, no live availability or prices, and no checkout. Sign-in, review and enquiry forms show an "unavailable in this preview" message.

## Run

```
npm ci
cp .env.example .env.local
npm run build
npm start
```

`NEXT_PUBLIC_SHOWCASE_PREVIEW=1` must be set at build time; it makes the site read content from the snapshot instead of a CMS.
