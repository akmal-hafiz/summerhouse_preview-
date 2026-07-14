<script>
(function () {
  /* Pattern is matched against window.location.pathname. First match wins.
     Keep specific patterns BEFORE generic ones. */
  window.SHTutorialRoutes = [
    { pattern: '^/admin/?$',                                      key: 'dashboard' },
    { pattern: '^/admin/homepage-managers?',                      key: 'homepage-manager' },
    { pattern: '^/admin/bali-collections/create',                 key: 'bali-collection-edit' },
    { pattern: '^/admin/bali-collections/[^/]+/edit',             key: 'bali-collection-edit' },
    { pattern: '^/admin/bali-collections',                        key: 'resource-list' },
    { pattern: '^/admin/articles/create',                         key: 'article-edit' },
    { pattern: '^/admin/articles/[^/]+/edit',                     key: 'article-edit' },
    { pattern: '^/admin/articles',                                key: 'resource-list' },
    { pattern: '^/admin/gallery-items/create',                    key: 'gallery-edit' },
    { pattern: '^/admin/gallery-items/[^/]+/edit',                key: 'gallery-edit' },
    { pattern: '^/admin/(testimonials|faqs|service-cards|gallery-items|media|users|contact-submissions)/(create|[^/]+/edit)', key: 'resource-edit' },
    { pattern: '^/admin/(testimonials|faqs|service-cards|gallery-items|media|users|contact-submissions)', key: 'resource-list' },
  ];

  window.SHTutorialSteps = {
    /* ── Main dashboard ───────────────────────────────────── */
    dashboard: [
      {
        selector: '.fi-sidebar',
        position: 'right',
        title: 'Your CMS sidebar',
        body: 'Every section of the public website is grouped here. Homepage, static pages, journal, and inbox — pick a group to expand it.',
      },
      {
        selector: '.fi-sidebar-item-button.fi-active',
        position: 'right',
        title: 'You are here',
        body: 'The sage tick on the left marks the page you are currently editing. The dashboard is your starting point each day.',
      },
      {
        selector: '.sh-greeting',
        position: 'bottom',
        title: 'Welcome panel',
        body: 'Quick context: who you are, what time it is, and what the team is working on. Nothing here is editable — it is just orientation.',
      },
      {
        selector: '.sh-note',
        position: 'right',
        title: 'Quick shortcuts',
        body: 'Three places you will visit most: Homepage Manager, Journal Articles, and Gallery. Click any chip to jump in.',
      },
      {
        selector: '.sh-card-split',
        position: 'left',
        title: 'Latest guest inquiry',
        body: 'New contact-form submissions land here first. Open the inbox to reply, mark as read, and triage with the concierge team.',
      },
      {
        selector: '.sh-prompt',
        position: 'top',
        title: 'Universal search (coming soon)',
        body: 'Will let you jump to a villa, article, or collection by name. For now, use the sidebar to navigate.',
      },
      {
        selector: '.sh-tour-fab',
        position: 'left',
        title: 'Replay anytime',
        body: 'Forgot something? This button lives on every page. Click it to start the tour for the page you are on.',
      },
    ],

    /* ── Homepage Manager ─────────────────────────────────── */
    'homepage-manager': [
      {
        selector: '.sh-page-intro',
        position: 'bottom',
        title: 'Homepage Manager',
        body: 'One place to control every section of the public homepage. Changes go live within five minutes of saving.',
      },
      {
        selector: '.fi-tabs',
        position: 'bottom',
        title: 'Section tabs',
        body: 'Hero, Stay Styles, Signature Villa, Featured Collection, Explore Bali. Click any tab to edit that section.',
      },
      {
        selector: '.fi-fo-file-upload-dropzone',
        position: 'auto',
        title: 'Hero video & poster',
        body: 'Upload the looping hero clip and a poster image. Posters show while the video loads — keep it light for fast first paint.',
      },
      {
        selector: '[wire\\:key*="badge_text"]',
        position: 'auto',
        title: 'Hero badge chips',
        body: 'Each chip becomes a slash-separated word in the hero badge. Press Enter after each one. The order matters — left to right on the public site.',
      },
      {
        selector: '[wire\\:key*="heading_text"]',
        position: 'auto',
        title: 'Hero heading',
        body: 'The big copy line over the video. Keep it short and emotive — two lines max looks best on mobile.',
      },
      {
        selector: '[wire\\:key*="show_badge"], [wire\\:key*="show_heading"]',
        position: 'auto',
        title: 'Show / hide toggles',
        body: 'Turn the badge or heading off without losing the text. Use this when running a clean visual campaign or A/B testing the hero copy.',
      },
      {
        selector: '.fi-form-actions',
        position: 'top',
        title: 'Save bar',
        body: 'Pinned to the bottom as you scroll. Click "Save Homepage" — caches flush automatically, public site updates within five minutes.',
      },
    ],

    /* ── Bali Collection edit ─────────────────────────────── */
    'bali-collection-edit': [
      {
        selector: '.fi-page-header',
        position: 'bottom',
        title: 'Bali Collection',
        body: 'Each card on the homepage "Explore Bali" flipbook maps to one collection here. Edit copy, swap photos, change the order.',
      },
      {
        selector: '.fi-section:first-of-type',
        position: 'right',
        title: 'Identity',
        body: 'Fill in the location and pick a category — everything else (slug, public link, tag) is generated automatically. You will not need to write URLs.',
      },
      {
        selector: '[id*="location"]',
        position: 'right',
        title: 'Location is the source of truth',
        body: 'Type the destination as it should appear on the card, e.g. "Canggu - Berawa". The slug and link will mirror it without manual edits.',
      },
      {
        selector: '[id*="category"]',
        position: 'right',
        title: 'Category preset or custom',
        body: 'Pick from the dropdown — or type a new one and press Enter to create it. The category is reused as the card tag automatically.',
      },
      {
        selector: '.fi-fo-file-upload-dropzone',
        position: 'top',
        title: 'Card and gallery images',
        body: 'The primary image is the destination card. The gallery (5–8 images) feeds the immersive flipbook viewer.',
      },
      {
        selector: '.fi-fo-repeater-item',
        position: 'top',
        title: 'Repeaters',
        body: 'Facts, lifestyle pillars, moods — drag rows to reorder, click the trash to remove. Use the "Add" button below to create more.',
      },
      {
        selector: '.fi-form-actions',
        position: 'top',
        title: 'Save and verify',
        body: 'After saving, open the public site in a new tab to verify the destination card. Changes are live within five minutes.',
      },
    ],

    /* ── Article edit ─────────────────────────────────────── */
    'article-edit': [
      {
        selector: '[id*="title"]',
        position: 'bottom',
        title: 'Headline first',
        body: 'Type the article title here. The URL slug is generated from it automatically — you can override it below if you need a custom URL.',
      },
      {
        selector: '[id*="category"]',
        position: 'right',
        title: 'Category',
        body: 'Pick from the dropdown (Lifestyle, Architecture, etc.) or type your own and press Enter to create a new category.',
      },
      {
        selector: '[id*="read_time"]',
        position: 'right',
        title: 'Read time is automatic',
        body: 'Leave it blank — we calculate it from the content blocks on save (~220 words per minute). Override only if you want a specific value.',
      },
      {
        selector: '.fi-fo-file-upload-dropzone',
        position: 'top',
        title: 'Hero image',
        body: 'A large editorial photo above the article. 1600×1000px or larger looks best. Drag-drop or click to choose.',
      },
      {
        selector: '.fi-fo-repeater-item',
        position: 'top',
        title: 'Content blocks',
        body: 'Each block is a paragraph, heading, subheading, pull quote, or image. Drag to reorder, clone with the duplicate icon, collapse for an overview.',
      },
      {
        selector: '[id*="is_published"]',
        position: 'left',
        title: 'Publish toggle',
        body: 'Keep this off while drafting. Flip on when ready — the article appears at /journal/{slug} immediately after the cache refreshes.',
      },
    ],

    /* ── Gallery item edit ────────────────────────────────── */
    'gallery-edit': [
      {
        selector: '[id*="type"]',
        position: 'right',
        title: 'Choose the block type',
        body: 'Image, text, or video. The form below changes to show only the fields that matter for the type you pick.',
      },
      {
        selector: '[id*="label"]',
        position: 'right',
        title: 'Auto-numbered',
        body: 'Leave blank — the next number in sequence is assigned on save. Override if you want a custom label like "01" or "Bali I".',
      },
      {
        selector: '.fi-fo-file-upload-dropzone',
        position: 'top',
        title: 'Upload your media',
        body: 'Images get an inline editor. Videos accept MP4 / WebM / MOV up to 200 MB. Add a poster image for videos so the gallery loads cleanly.',
      },
      {
        selector: '.fi-form-actions',
        position: 'top',
        title: 'Save and place',
        body: 'After saving, return to the gallery list and drag rows to reorder. The order here is the order shown on the public gallery page.',
      },
    ],

    /* ── Generic resource list ─────────────────────────────── */
    'resource-list': [
      {
        selector: '.fi-page-header',
        position: 'bottom',
        title: 'List view',
        body: 'Every row is a piece of content on the public site. Click "New" in the top right to add one, or click any row to edit it.',
      },
      {
        selector: '.fi-ta-ctn',
        position: 'top',
        title: 'Sortable table',
        body: 'Click any column heading to sort. Drag the grip handle on a row to reorder content — order saved here is order shown on the public site.',
      },
      {
        selector: '.fi-ta-row',
        position: 'top',
        title: 'Edit a row',
        body: 'Click anywhere on a row to open it for editing. Use the actions on the right for quick delete or duplicate.',
      },
    ],

    /* ── Generic resource edit ─────────────────────────────── */
    'resource-edit': [
      {
        selector: '.fi-page-header',
        position: 'bottom',
        title: 'Editing a record',
        body: 'You are now editing one row. Fields are grouped into white cards by topic. Required fields show a small red dot beside the label.',
      },
      {
        selector: '.fi-section:first-of-type',
        position: 'right',
        title: 'Section card',
        body: 'Each card is a logical group of fields. The section description, when present, tells you what the card is for.',
      },
      {
        selector: '.fi-form-actions',
        position: 'top',
        title: 'Save your work',
        body: 'The save bar floats at the bottom while you scroll. Hit "Save" — changes go live within five minutes thanks to caching.',
      },
    ],
  };
})();
</script>
