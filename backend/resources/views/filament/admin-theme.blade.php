<style>
  /* ════════════════════════════════════════════════════════
     Summerhouses CMS — "Stratify" workspace
     Soft-sky macOS surface · white rounded cards · Inter
     Primary: sky blue   ·   Secondary: sage (project signature)
  ════════════════════════════════════════════════════════ */

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    /* ── Page surface ── */
    --sh-bg-1:        #E8F1FB;
    --sh-bg-2:        #DCE9F7;
    --sh-bg-3:        #F1F6FC;

    /* ── Cards & surfaces ── */
    --sh-card:        #FFFFFF;
    --sh-card-2:      #F8FAFC;
    --sh-card-edge:   #EEF1F6;
    --sh-card-edge-2: #F1F5F9;

    /* ── Ink (slate) ── */
    --sh-ink:        #1E293B;
    --sh-ink-soft:   #64748B;
    --sh-ink-faint:  #94A3B8;
    --sh-hairline:   rgba(30, 41, 59, 0.08);
    --sh-hairline-2: rgba(30, 41, 59, 0.05);

    /* ── Primary: sky ── */
    --sh-sky:        #3B82F6;
    --sh-sky-dark:   #2563EB;
    --sh-sky-soft:   #DBEAFE;
    --sh-sky-tint:   #EFF6FF;
    --sh-sky-glow:   rgba(59, 130, 246, 0.16);

    /* ── Secondary: sage (project signature) ── */
    --sh-sage:       #446B4A;
    --sh-sage-dark:  #3A5C40;
    --sh-sage-soft:  #DCE5DD;
    --sh-sage-tint:  rgba(68, 107, 74, 0.07);
    --sh-sage-glow:  rgba(68, 107, 74, 0.16);

    /* ── Signal pastels ── */
    --sh-yellow:     #FDE68A;
    --sh-yellow-bg:  #FEF3C7;
    --sh-yellow-edge:#FCD34D;
    --sh-yellow-ink: #92400E;
    --sh-purple:     #7C3AED;
    --sh-purple-soft:#EDE9FE;
    --sh-coral:      #DC2626;
    --sh-coral-soft: #FEE2E2;

    /* ── Type ── */
    --sh-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

    /* ── Geometry ── */
    --sh-radius:    14px;
    --sh-radius-lg: 18px;
    --sh-radius-xl: 24px;

    /* ── Shadow (soft, macOS) ── */
    --sh-lift:    0 4px 24px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03);
    --sh-lift-lg: 0 18px 48px rgba(15, 23, 42, 0.10), 0 4px 12px rgba(15, 23, 42, 0.05);

    --sh-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ───────── Base ───────── */
  body.fi-body {
    background:
      radial-gradient(1200px 600px at 80% -10%, rgba(255,255,255,0.6), transparent 60%),
      linear-gradient(135deg, var(--sh-bg-1) 0%, var(--sh-bg-2) 48%, var(--sh-bg-3) 100%) !important;
    background-attachment: fixed !important;
    font-family: var(--sh-sans) !important;
    color: var(--sh-ink) !important;
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.006em;
  }

  ::selection { background: var(--sh-sky-soft); color: var(--sh-sky-dark); }

  /* ───────── Light enforcement — never let a dark surface bleed ───────── */
  .fi-main,
  .fi-page,
  .fi-main-ctn { background: transparent !important; }
  .fi-section-content-ctn,
  .fi-fo-tabs,
  .fi-tabs-panel { background: transparent !important; }
  /* keep all headings / labels / field text dark on white */
  .fi-section-header-heading,
  .fi-fo-field-wrp-label,
  .fi-ta-cell,
  .fi-fo-repeater-item-label,
  .fi-input,
  .fi-textarea,
  .fi-select-input { color: var(--sh-ink) !important; }

  /* ───────── Sidebar — frosted white panel ───────── */
  .fi-sidebar {
    background: rgba(255, 255, 255, 0.72) !important;
    backdrop-filter: saturate(180%) blur(20px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(20px) !important;
    border-right: 1px solid var(--sh-hairline) !important;
    box-shadow: none !important;
  }
  .fi-sidebar-header {
    background: transparent !important;
    border-bottom: 1px solid var(--sh-hairline-2) !important;
    padding: 1.15rem 1.25rem !important;
  }
  .fi-sidebar-header::before { content: none !important; }

  .fi-logo {
    font-family: var(--sh-sans) !important;
    font-weight: 700 !important;
    font-size: 1.12rem !important;
    letter-spacing: -0.025em !important;
    color: var(--sh-ink) !important;
  }
  .fi-logo::after {
    content: 'Bali';
    font-weight: 500;
    color: var(--sh-sage);
    margin-left: 5px;
    font-size: 1.12rem;
  }

  /* Nav items — ghost rows, soft pill when active */
  .fi-sidebar-item-button {
    border-radius: 11px !important;
    transition: color 140ms var(--sh-ease), background 140ms var(--sh-ease) !important;
    margin: 1px 0 !important;
    padding: 0.55rem 0.75rem !important;
    font-family: var(--sh-sans) !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    color: var(--sh-ink-soft) !important;
    background: transparent !important;
  }
  .fi-sidebar-item-button:hover {
    color: var(--sh-ink) !important;
    background: rgba(148, 163, 184, 0.12) !important;
  }
  .fi-sidebar-item-button.fi-active {
    background: #FFFFFF !important;
    color: var(--sh-ink) !important;
    font-weight: 600 !important;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), inset 0 0 0 1px var(--sh-card-edge) !important;
  }
  /* sage = secondary signal: active item left tick */
  .fi-sidebar-item-button.fi-active { position: relative !important; }
  .fi-sidebar-item-button.fi-active::before {
    content: '';
    position: absolute;
    left: -2px; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px;
    border-radius: 999px;
    background: var(--sh-sage);
  }
  .fi-sidebar-item-button svg {
    color: var(--sh-ink-faint) !important;
    width: 1.1rem !important;
    height: 1.1rem !important;
  }
  .fi-sidebar-item-button:hover svg { color: var(--sh-ink-soft) !important; }
  .fi-sidebar-item-button.fi-active svg { color: var(--sh-sky) !important; }

  /* Group label — quiet caps */
  .fi-sidebar-group-label {
    font-family: var(--sh-sans) !important;
    font-size: 0.68rem !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    color: var(--sh-ink-faint) !important;
    padding: 1.3rem 0.85rem 0.4rem !important;
  }

  /* ───────── Topbar — frosted, hairline ───────── */
  .fi-topbar {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: saturate(180%) blur(16px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(16px) !important;
    border-bottom: 1px solid var(--sh-hairline-2) !important;
    height: 56px !important;
    box-shadow: none !important;
  }

  /* ───────── Page header ───────── */
  .fi-page-header { padding-bottom: 0.5rem !important; }
  .fi-page-header h1,
  .fi-header-heading {
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    letter-spacing: -0.03em !important;
    color: var(--sh-ink) !important;
    font-size: 2rem !important;
    line-height: 1.1 !important;
  }
  .fi-header-subheading {
    font-family: var(--sh-sans) !important;
    font-weight: 500 !important;
    color: var(--sh-ink-soft) !important;
    font-size: 0.95rem !important;
    margin-bottom: 0.3rem !important;
  }

  /* ───────── Sections — white rounded cards (the Stratify surface) ───────── */
  .fi-section {
    background: var(--sh-card) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift) !important;
    padding: 1.5rem 1.6rem !important;
    margin-top: 1.25rem !important;
    transition: box-shadow 200ms var(--sh-ease), transform 200ms var(--sh-ease) !important;
    animation: none !important;
  }
  .fi-section:first-of-type { margin-top: 0.5rem !important; }
  .fi-section:hover { box-shadow: var(--sh-lift-lg) !important; }

  .fi-section-header {
    padding: 0 0 1rem !important;
    border-bottom: none !important;
    display: flex !important;
    align-items: baseline !important;
    gap: 0.6rem !important;
  }
  .fi-section-header-heading {
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    letter-spacing: -0.02em !important;
    color: var(--sh-ink) !important;
  }
  .fi-section-header-description {
    font-family: var(--sh-sans) !important;
    color: var(--sh-ink-soft) !important;
    font-size: 0.84rem !important;
    margin-top: 0.2rem !important;
  }
  .fi-section-content { padding: 0 !important; }

  .fi-fo-component-ctn {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* ───────── Form inputs — white fill, clear visible line, sky focus ───────── */
  .fi-input,
  .fi-select-input,
  .fi-textarea {
    background: #fff !important;
    border: 1px solid var(--sh-line) !important;
    border-radius: 12px !important;
    transition: background 140ms var(--sh-ease), border-color 140ms var(--sh-ease), box-shadow 140ms var(--sh-ease) !important;
    font-family: var(--sh-sans) !important;
    font-size: 0.9rem !important;
    color: var(--sh-ink) !important;
    padding: 0.62rem 0.85rem !important;
  }
  .fi-input::placeholder,
  .fi-textarea::placeholder { color: var(--sh-ink-faint) !important; }
  .fi-input-wrp {
    background: #fff !important;
    border: 1px solid var(--sh-line) !important;
    border-radius: 12px !important;
    transition: background 140ms var(--sh-ease), border-color 140ms var(--sh-ease), box-shadow 140ms var(--sh-ease) !important;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03) !important;
  }
  .fi-input-wrp:hover,
  .fi-input:hover,
  .fi-textarea:hover {
    background: #fff !important;
    border-color: var(--sh-ink-faint) !important;
  }
  .fi-input-wrp:focus-within,
  .fi-input:focus,
  .fi-select-input:focus,
  .fi-textarea:focus {
    background: #fff !important;
    border-color: var(--sh-sky) !important;
    box-shadow: 0 0 0 4px var(--sh-sky-glow) !important;
    outline: none !important;
  }

  .fi-fo-field-wrp-label {
    font-family: var(--sh-sans) !important;
    font-size: 0.78rem !important;
    letter-spacing: 0 !important;
    text-transform: none !important;
    font-weight: 600 !important;
    color: var(--sh-ink) !important;
  }
  .fi-fo-field-wrp-hint,
  .fi-fo-field-wrp-helper-text {
    font-family: var(--sh-sans) !important;
    font-weight: 400 !important;
    color: var(--sh-ink-soft) !important;
    font-size: 0.8rem !important;
  }

  /* ───────── Buttons — pill, sky primary, sage confirm ───────── */
  .fi-btn {
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    font-size: 0.86rem !important;
    border-radius: 999px !important;
    letter-spacing: 0 !important;
    padding: 0.58rem 1.1rem !important;
    transition: background 140ms var(--sh-ease), border-color 140ms var(--sh-ease), color 140ms var(--sh-ease), box-shadow 140ms var(--sh-ease), transform 140ms var(--sh-ease) !important;
    box-shadow: none !important;
  }
  .fi-btn:hover { transform: translateY(-1px) !important; }
  .fi-btn[data-color="primary"],
  .fi-btn.fi-color-primary {
    background: var(--sh-sky) !important;
    border: 1px solid var(--sh-sky) !important;
    color: #fff !important;
    box-shadow: 0 4px 14px var(--sh-sky-glow) !important;
  }
  .fi-btn[data-color="primary"]:hover,
  .fi-btn.fi-color-primary:hover {
    background: var(--sh-sky-dark) !important;
    border-color: var(--sh-sky-dark) !important;
  }
  /* sage = secondary action signal (success / save-confirm) */
  .fi-btn[data-color="success"] {
    background: var(--sh-sage) !important;
    border: 1px solid var(--sh-sage) !important;
    color: #fff !important;
    box-shadow: 0 4px 14px var(--sh-sage-glow) !important;
  }
  .fi-btn[data-color="success"]:hover {
    background: var(--sh-sage-dark) !important;
    border-color: var(--sh-sage-dark) !important;
  }
  .fi-btn[data-color="gray"]:not(.fi-color-primary),
  .fi-btn[data-color="secondary"] {
    background: #fff !important;
    border: 1px solid var(--sh-card-edge) !important;
    color: var(--sh-ink) !important;
  }
  .fi-btn[data-color="gray"]:hover {
    background: var(--sh-card-2) !important;
    border-color: var(--sh-ink-faint) !important;
  }
  .fi-btn[data-color="danger"] {
    background: #fff !important;
    border: 1px solid var(--sh-coral-soft) !important;
    color: var(--sh-coral) !important;
  }
  .fi-btn[data-color="danger"]:hover {
    background: var(--sh-coral-soft) !important;
    border-color: var(--sh-coral) !important;
  }

  /* ───────── Tables — white rounded card ───────── */
  .fi-ta-ctn {
    background: var(--sh-card) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift) !important;
    overflow: hidden !important;
  }
  .fi-ta-table { background: transparent !important; }
  .fi-ta-header-cell {
    font-family: var(--sh-sans) !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    color: var(--sh-ink-faint) !important;
    font-weight: 600 !important;
    background: var(--sh-card-2) !important;
    border-bottom: 1px solid var(--sh-hairline-2) !important;
    padding: 0.85rem 1rem !important;
  }
  .fi-ta-row {
    border-bottom: 1px solid var(--sh-hairline-2) !important;
    transition: background 120ms ease !important;
  }
  .fi-ta-row:hover { background: var(--sh-sky-tint) !important; }
  .fi-ta-row:last-child { border-bottom: none !important; }
  .fi-ta-cell {
    font-size: 0.88rem !important;
    color: var(--sh-ink) !important;
    padding: 0.85rem 1rem !important;
  }

  /* ───────── Badges — pastel pills ───────── */
  .fi-badge {
    border-radius: 999px !important;
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    font-size: 0.72rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    padding: 0.25rem 0.65rem !important;
    border: none !important;
  }
  .fi-badge.fi-color-success, .fi-badge[data-color="success"] { background-color: #DCFCE7 !important; color: #166534 !important; }
  .fi-badge.fi-color-warning, .fi-badge[data-color="warning"] { background-color: #FEF3C7 !important; color: #92400E !important; }
  .fi-badge.fi-color-danger,  .fi-badge[data-color="danger"]  { background-color: #FEE2E2 !important; color: #991B1B !important; }
  .fi-badge.fi-color-info,    .fi-badge[data-color="info"]    { background-color: #DBEAFE !important; color: #1D4ED8 !important; }
  .fi-badge.fi-color-primary, .fi-badge[data-color="primary"] { background-color: #DBEAFE !important; color: #1D4ED8 !important; }
  .fi-badge.fi-color-gray,    .fi-badge[data-color="gray"]    { background-color: #F1F5F9 !important; color: #475569 !important; }

  /* ───────── Tabs — pill segmented ───────── */
  .fi-tabs {
    background: var(--sh-card-2) !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-bottom: 1px solid var(--sh-card-edge) !important;
    border-radius: 999px !important;
    padding: 0.25rem !important;
    gap: 0.15rem !important;
  }
  .fi-tabs-item {
    font-family: var(--sh-sans) !important;
    font-weight: 500 !important;
    font-size: 0.85rem !important;
    border-radius: 999px !important;
    padding: 0.5rem 1rem !important;
    background: transparent !important;
    color: var(--sh-ink-soft) !important;
    border: none !important;
    transition: color 140ms var(--sh-ease), background 140ms var(--sh-ease) !important;
    box-shadow: none !important;
  }
  .fi-tabs-item:hover { color: var(--sh-ink) !important; background: rgba(148,163,184,0.12) !important; }
  .fi-tabs-item.fi-active {
    color: var(--sh-sky-dark) !important;
    background: #fff !important;
    box-shadow: 0 1px 3px rgba(15,23,42,0.08) !important;
  }

  /* ───────── Modal & dropdown ───────── */
  .fi-modal-content {
    background: #fff !important;
    backdrop-filter: saturate(160%) blur(20px) !important;
    -webkit-backdrop-filter: saturate(160%) blur(20px) !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift-lg) !important;
  }
  .fi-dropdown-panel {
    background: #fff !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-lg) !important;
    box-shadow: var(--sh-lift-lg) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* ───────── Notification toast ───────── */
  .fi-no-notification {
    border-radius: var(--sh-radius-lg) !important;
    background: var(--sh-ink) !important;
    color: #fff !important;
    border: none !important;
    box-shadow: var(--sh-lift-lg) !important;
    font-family: var(--sh-sans) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  .fi-no-notification * { color: #fff !important; }

  /* ───────── Stats widget — white rounded cards ───────── */
  .fi-wi-stats-overview-stat {
    background: var(--sh-card) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift) !important;
    padding: 1.4rem 1.5rem !important;
    transition: transform 0.2s var(--sh-ease), box-shadow 0.2s var(--sh-ease) !important;
    animation: none !important;
  }
  .fi-wi-stats-overview-stat:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--sh-lift-lg) !important;
  }
  .fi-wi-stats-overview-stat-value {
    font-family: var(--sh-sans) !important;
    font-weight: 700 !important;
    font-size: 2.2rem !important;
    color: var(--sh-ink) !important;
    letter-spacing: -0.04em !important;
    line-height: 1 !important;
  }
  .fi-wi-stats-overview-stat-label {
    font-family: var(--sh-sans) !important;
    font-weight: 500 !important;
    font-size: 0.85rem !important;
    color: var(--sh-ink-soft) !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
  }
  .fi-wi-stats-overview-stat-description {
    font-family: var(--sh-sans) !important;
    font-size: 0.76rem !important;
    color: var(--sh-ink-faint) !important;
  }

  /* ───────── Login page ───────── */
  .fi-simple-page { background: transparent !important; }
  .fi-simple-main {
    background: rgba(255,255,255,0.86) !important;
    backdrop-filter: saturate(180%) blur(20px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(20px) !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift-lg) !important;
  }
  .fi-simple-main .fi-logo,
  .fi-simple-main h1,
  .fi-simple-main h2 {
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    color: var(--sh-ink) !important;
  }

  /* ───────── Repeater — soft cards ───────── */
  .fi-fo-repeater-item {
    background: var(--sh-card-2) !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-lg) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease !important;
    box-shadow: none !important;
  }
  .fi-fo-repeater-item:hover {
    background: #fff !important;
    border-color: var(--sh-ink-faint) !important;
    box-shadow: var(--sh-lift) !important;
  }
  .fi-fo-repeater-item-header {
    padding: 0.75rem 1rem !important;
    border-bottom: 1px solid var(--sh-hairline-2) !important;
  }
  .fi-fo-repeater-item-header-label,
  .fi-fo-repeater-item-label {
    font-family: var(--sh-sans) !important;
    font-weight: 600 !important;
    color: var(--sh-ink) !important;
    font-size: 0.9rem !important;
  }
  .fi-fo-repeater-actions .fi-btn {
    background: #fff !important;
    border: 1px solid var(--sh-card-edge) !important;
    color: var(--sh-sky) !important;
    font-weight: 600 !important;
  }
  .fi-fo-repeater-actions .fi-btn:hover {
    border-color: var(--sh-sky) !important;
    background: var(--sh-sky-tint) !important;
  }

  /* ───────── Floating save bar ───────── */
  .fi-form-actions {
    position: sticky !important;
    bottom: 1rem !important;
    background: rgba(255,255,255,0.86) !important;
    backdrop-filter: saturate(180%) blur(16px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(16px) !important;
    border: 1px solid var(--sh-card-edge) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-lift-lg) !important;
    padding: 0.75rem 1.1rem !important;
    margin-top: 2rem !important;
    z-index: 30 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 1rem !important;
  }
  .fi-form-actions::before {
    content: 'Changes go live within ~5 minutes';
    font-family: var(--sh-sans);
    font-weight: 500;
    color: var(--sh-ink-soft);
    font-size: 0.82rem;
    padding-left: 0.5rem;
    flex: 1;
  }

  /* ───────── Scrollbar ───────── */
  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-thumb {
    background: var(--sh-ink-faint);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--sh-ink-soft); background-clip: padding-box; }
  ::-webkit-scrollbar-track { background: transparent; }

  /* ───────── Tooltip ───────── */
  [x-data*="tooltip"] [role="tooltip"] {
    background: var(--sh-ink) !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-size: 0.76rem !important;
    font-family: var(--sh-sans) !important;
    padding: 0.4rem 0.65rem !important;
    box-shadow: var(--sh-lift) !important;
  }

  /* ───────── Signature villa live preview ───────── */
  .sh-signature-empty {
    padding: 1rem 0;
    color: var(--sh-ink-faint);
    font-size: 0.88rem;
    font-style: italic;
  }
  .sh-signature-live {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.4rem 0;
  }
  .sh-signature-thumb {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .sh-signature-thumb--fallback {
    background: var(--sh-sky-tint);
    color: var(--sh-sky);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
  }
  .sh-signature-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .sh-signature-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.18rem 0.6rem;
    background: #DCFCE7;
    color: #166534;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    align-self: flex-start;
  }
  .sh-signature-pill--fallback {
    background: #FEF3C7;
    color: #92400E;
  }
  .sh-signature-hint {
    color: var(--sh-ink-faint);
    font-size: 0.78rem;
    font-style: italic;
    margin-top: 4px;
    max-width: 460px;
    line-height: 1.45;
  }
  .sh-signature-name {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--sh-ink);
    letter-spacing: -0.01em;
  }
  .sh-signature-sub {
    color: var(--sh-ink-soft);
    font-size: 0.84rem;
  }

  /* ───────── Custom page intro block ───────── */
  .sh-page-intro { margin-bottom: 1.5rem; }
  .sh-page-intro h2 {
    font-family: var(--sh-sans);
    font-weight: 600;
    font-size: 1.4rem;
    letter-spacing: -0.025em;
    color: var(--sh-ink);
    margin: 0;
  }
  .sh-page-intro p {
    font-family: var(--sh-sans);
    font-size: 0.88rem;
    color: var(--sh-ink-soft);
    margin: 0.35rem 0 0;
    max-width: 62ch;
    line-height: 1.5;
  }
  .sh-form-actions-row { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; }

  /* ════════════════════════════════════════════════════════
     Welcome dashboard widget — Stratify layout (global classes)
  ════════════════════════════════════════════════════════ */
  .sh-dash { display: flex; flex-direction: column; gap: 1.5rem; }

  .sh-greeting { display: flex; flex-direction: column; gap: 0.4rem; }
  .sh-greeting-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    background: var(--sh-sky-soft);
    color: var(--sh-sky-dark);
    font-weight: 600;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
  }
  .sh-greeting-sub {
    font-size: 2rem;
    font-weight: 300;
    color: var(--sh-ink-faint);
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0;
  }

  .sh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 768px) { .sh-grid-2 { grid-template-columns: 1fr; } }

  /* generic card */
  .sh-card {
    background: var(--sh-card);
    border: 1px solid var(--sh-card-edge);
    border-radius: var(--sh-radius-xl);
    box-shadow: var(--sh-lift);
    padding: 1.4rem 1.5rem;
    transition: box-shadow 220ms var(--sh-ease), transform 220ms var(--sh-ease);
  }
  .sh-card:hover { box-shadow: var(--sh-lift-lg); transform: translateY(-2px); }

  .sh-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--sh-ink-faint);
    margin-bottom: 0.9rem;
  }
  .sh-eyebrow svg { width: 0.95rem; height: 0.95rem; }

  /* sticky note */
  .sh-note {
    background: var(--sh-yellow-bg);
    border: 1px solid var(--sh-yellow-edge);
    border-radius: var(--sh-radius-xl);
    padding: 1.4rem 1.5rem;
    box-shadow: var(--sh-lift);
    transform: rotate(-1deg);
    transition: transform 240ms var(--sh-ease), box-shadow 240ms var(--sh-ease);
  }
  .sh-note:hover { transform: rotate(0deg); box-shadow: var(--sh-lift-lg); }
  .sh-note .sh-eyebrow { color: var(--sh-yellow-ink); }
  .sh-note-head { display: flex; align-items: center; justify-content: space-between; }
  .sh-note-link {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.5rem; border-radius: 12px;
    text-decoration: none;
    color: var(--sh-yellow-ink);
    transition: background 140ms var(--sh-ease);
  }
  .sh-note-link:hover { background: rgba(252, 211, 77, 0.35); }
  .sh-note-list { display: flex; flex-direction: column; gap: 0.35rem; }
  .sh-glyph {
    width: 2rem; height: 2rem; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(15,23,42,0.12);
  }
  .sh-glyph--amber  { background: var(--sh-yellow-edge); color: var(--sh-yellow-ink); }
  .sh-glyph--pink   { background: #EC4899; }
  .sh-glyph--green  { background: var(--sh-sage); }
  .sh-glyph--sky    { background: var(--sh-sky); }
  .sh-note-link-body { display: flex; flex-direction: column; }
  .sh-note-link-title { font-weight: 600; font-size: 0.88rem; }
  .sh-note-link-sub { font-size: 0.72rem; font-weight: 400; opacity: 0.7; }

  /* inquiry card */
  .sh-card-split { display: flex; flex-direction: column; justify-content: space-between; }
  .sh-inquiry { display: flex; align-items: flex-start; gap: 1rem; }
  .sh-avatar {
    width: 2.5rem; height: 2.5rem; border-radius: 999px;
    background: var(--sh-sage-soft); color: var(--sh-sage-dark);
    border: 1px solid rgba(68,107,74,0.18);
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; flex-shrink: 0;
  }
  .sh-inquiry-title { font-weight: 500; color: var(--sh-ink); font-size: 0.88rem; margin: 0; }
  .sh-inquiry-sub { font-size: 0.76rem; color: var(--sh-ink-faint); margin: 0.25rem 0 0; }
  .sh-card-foot {
    margin-top: 1rem; padding-top: 1rem;
    border-top: 1px solid var(--sh-hairline-2);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.76rem;
  }
  .sh-status { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--sh-ink-faint); }
  .sh-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: #F59E0B; animation: sh-pulse 1.8s ease-in-out infinite; }
  .sh-status strong { color: #B45309; font-weight: 600; }
  @keyframes sh-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  .sh-link {
    display: inline-flex; align-items: center; gap: 0.25rem;
    color: var(--sh-sky); font-weight: 600; text-decoration: none;
    transition: color 140ms var(--sh-ease);
  }
  .sh-link:hover { color: var(--sh-sky-dark); }
  .sh-link svg { width: 0.9rem; height: 0.9rem; }

  /* suggested action cards */
  .sh-suggest {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--sh-card);
    border: 1px solid var(--sh-card-edge);
    border-radius: var(--sh-radius-lg);
    box-shadow: var(--sh-lift);
    padding: 1.1rem 1.25rem;
    transition: box-shadow 200ms var(--sh-ease), transform 200ms var(--sh-ease);
  }
  .sh-suggest:hover { box-shadow: var(--sh-lift-lg); transform: translateY(-2px); }
  .sh-suggest-main { display: flex; align-items: center; gap: 0.85rem; }
  .sh-suggest-icon {
    width: 2.25rem; height: 2.25rem; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .sh-suggest-icon svg { width: 1.2rem; height: 1.2rem; }
  .sh-suggest-icon--sky  { background: var(--sh-sky-tint); color: var(--sh-sky); }
  .sh-suggest-icon--sage { background: var(--sh-sage-tint); color: var(--sh-sage); }
  .sh-suggest-eyebrow { font-size: 0.64rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--sh-ink-faint); margin: 0; }
  .sh-suggest-title { font-weight: 500; color: var(--sh-ink); font-size: 0.88rem; margin: 0.1rem 0 0; }
  .sh-suggest-arrow { color: var(--sh-ink-faint); display: flex; transition: color 140ms var(--sh-ease); }
  .sh-suggest:hover .sh-suggest-arrow { color: var(--sh-sky); }
  .sh-suggest-arrow svg { width: 1.2rem; height: 1.2rem; }

  /* prompt bar */
  .sh-prompt {
    display: flex; align-items: center; gap: 0.6rem;
    background: #fff;
    border: 1px solid var(--sh-card-edge);
    border-radius: var(--sh-radius-lg);
    box-shadow: var(--sh-lift);
    padding: 0.5rem 0.6rem 0.5rem 1rem;
    max-width: 56rem; margin: 0.5rem auto 0; width: 100%;
    transition: border-color 200ms var(--sh-ease), box-shadow 200ms var(--sh-ease);
  }
  .sh-prompt:focus-within { border-color: var(--sh-sky); box-shadow: 0 0 0 4px var(--sh-sky-glow); }
  .sh-prompt-spark { color: var(--sh-sky); display: flex; }
  .sh-prompt-spark svg { width: 1.2rem; height: 1.2rem; }
  .sh-prompt input {
    flex: 1; border: none; outline: none; background: transparent;
    font-family: var(--sh-sans); font-size: 0.88rem; color: var(--sh-ink);
  }
  .sh-prompt input::placeholder { color: var(--sh-ink-faint); }
  .sh-prompt-send {
    width: 2rem; height: 2rem; border-radius: 999px;
    background: var(--sh-ink); color: #fff;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; flex-shrink: 0;
    transition: background 140ms var(--sh-ease);
  }
  .sh-prompt-send:hover { background: var(--sh-sky); }
  .sh-prompt-send svg { width: 1rem; height: 1rem; }

  /* ════════════════════════════════════════════════════════
     Villa Picker — restyled to Stratify tokens
  ════════════════════════════════════════════════════════ */
  [x-cloak] { display: none !important; }

  .villa-picker-preview {
    width: 100%;
    background: var(--sh-card-2);
    border: 1px solid var(--sh-card-edge);
    border-radius: var(--sh-radius-lg);
    padding: 0.85rem 1rem;
    text-align: left;
    cursor: pointer;
    transition: background 160ms var(--sh-ease), border-color 160ms var(--sh-ease), box-shadow 160ms var(--sh-ease);
    box-shadow: none;
  }
  .villa-picker-preview:hover { background: #fff; border-color: var(--sh-ink-faint); box-shadow: var(--sh-lift); }
  .villa-picker-preview.is-empty { border-style: dashed; border-color: var(--sh-ink-faint); background: transparent; }
  .villa-picker-preview-inner { display: flex; align-items: center; gap: 1rem; }
  .villa-picker-preview-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
  .villa-picker-thumb-fallback {
    background: var(--sh-sky-tint); color: var(--sh-sky);
    font-weight: 700; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
    text-transform: uppercase; font-family: var(--sh-sans);
  }
  .villa-picker-preview-body { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 2px; }
  .villa-picker-preview-name { font-family: var(--sh-sans); font-size: 1rem; font-weight: 600; color: var(--sh-ink); letter-spacing: -0.01em; }
  .villa-picker-preview-meta { font-family: var(--sh-sans); font-weight: 400; font-size: 0.84rem; color: var(--sh-ink-soft); display: flex; gap: 4px; flex-wrap: wrap; }
  .villa-picker-preview-cta {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--sh-sky); border: 1px solid var(--sh-sky);
    padding: 0.4rem 0.85rem; border-radius: 999px; flex-shrink: 0;
    background: transparent; transition: background 140ms, color 140ms;
  }
  .villa-picker-preview:hover .villa-picker-preview-cta { background: var(--sh-sky); color: #fff; }
  .villa-picker-preview-empty { display: flex; align-items: center; gap: 1rem; }
  .villa-picker-preview-empty-icon {
    width: 48px; height: 48px; border-radius: 12px; background: transparent;
    border: 1px dashed var(--sh-ink-faint); color: var(--sh-ink-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .villa-picker-preview-empty-text { display: flex; flex-direction: column; flex: 1; }
  .villa-picker-preview-empty-text strong { font-family: var(--sh-sans); font-weight: 600; color: var(--sh-ink); font-size: 1rem; }
  .villa-picker-preview-empty-text small { font-family: var(--sh-sans); font-weight: 400; font-size: 0.82rem; color: var(--sh-ink-soft); }

  .villa-picker-modal-root { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .villa-picker-modal-backdrop { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.34); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .villa-picker-modal {
    position: relative; width: min(1080px, 96vw); max-height: 86vh;
    background: var(--sh-bg-3); border: 1px solid var(--sh-card-edge);
    border-radius: var(--sh-radius-xl); box-shadow: var(--sh-lift-lg);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .vp-enter { transition: transform 220ms var(--sh-ease), opacity 220ms; }
  .vp-enter-from { opacity: 0; transform: translateY(8px) scale(0.99); }
  .vp-enter-to { opacity: 1; transform: translateY(0) scale(1); }

  .villa-picker-modal-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 1.4rem 1.6rem 1rem; border-bottom: 1px solid var(--sh-hairline-2); background: #fff;
  }
  .villa-picker-modal-title h2 { font-family: var(--sh-sans); font-weight: 600; color: var(--sh-ink); font-size: 1.4rem; letter-spacing: -0.02em; margin: 0; line-height: 1.1; }
  .villa-picker-modal-title p { font-family: var(--sh-sans); font-weight: 400; font-size: 0.86rem; color: var(--sh-ink-soft); margin: 4px 0 0; }
  .villa-picker-close {
    width: 32px; height: 32px; border-radius: 999px; background: var(--sh-card-2);
    border: 1px solid var(--sh-card-edge); color: var(--sh-ink-soft);
    display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 140ms, color 140ms;
  }
  .villa-picker-close:hover { background: var(--sh-coral-soft); color: var(--sh-coral); }

  .villa-picker-toolbar { display: flex; gap: 1rem; padding: 1rem 1.6rem; border-bottom: 1px solid var(--sh-hairline-2); flex-wrap: wrap; align-items: center; background: #fff; }
  .villa-picker-search {
    flex: 1; min-width: 240px; display: flex; align-items: center; gap: 0.5rem;
    background: var(--sh-card-2); border: 1px solid var(--sh-card-edge); border-radius: 12px;
    padding: 0.55rem 0.85rem; color: var(--sh-ink-soft); transition: background 140ms, border-color 140ms, box-shadow 140ms;
  }
  .villa-picker-search:focus-within { background: #fff; border-color: var(--sh-sky); box-shadow: 0 0 0 4px var(--sh-sky-glow); color: var(--sh-sky); }
  .villa-picker-search input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.9rem; color: var(--sh-ink); font-family: var(--sh-sans); }
  .villa-picker-filters { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .villa-picker-filters button {
    font-family: var(--sh-sans); font-size: 0.78rem; font-weight: 500;
    padding: 0.4rem 0.85rem; border-radius: 999px; border: 1px solid var(--sh-card-edge);
    background: #fff; color: var(--sh-ink-soft); cursor: pointer; transition: all 140ms;
  }
  .villa-picker-filters button:hover { border-color: var(--sh-ink-faint); color: var(--sh-ink); }
  .villa-picker-filters button.active { background: var(--sh-sky); border-color: var(--sh-sky); color: #fff; }

  .villa-picker-grid {
    flex: 1; overflow-y: auto; padding: 1.4rem 1.6rem 1.6rem;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; background: var(--sh-bg-3);
  }
  .villa-card {
    background: #fff; border: 1px solid var(--sh-card-edge); border-radius: var(--sh-radius-lg);
    padding: 0; text-align: left; cursor: pointer; overflow: hidden;
    transition: border-color 180ms ease, transform 200ms var(--sh-ease), box-shadow 200ms var(--sh-ease);
    box-shadow: none; position: relative; display: flex; flex-direction: column;
  }
  .villa-card { min-height: 248px; }
  .villa-card:hover { transform: translateY(-2px); border-color: var(--sh-ink-faint); box-shadow: var(--sh-lift); }
  .villa-card.is-selected { border-color: var(--sh-sage); box-shadow: 0 0 0 2px var(--sh-sage-glow); }
  .villa-card-thumb { position: relative; width: 100%; aspect-ratio: 4 / 3; min-height: 150px; overflow: hidden; background: var(--sh-card-2); flex-shrink: 0; }
  .villa-card-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms var(--sh-ease); }
  .villa-card:hover .villa-card-thumb img { transform: scale(1.04); }
  .villa-card-thumb-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--sh-sans); font-weight: 700; font-size: 2rem; color: var(--sh-sky); background: var(--sh-sky-tint); }
  .villa-card-id {
    position: absolute; top: 10px; left: 10px; font-family: var(--sh-sans); font-weight: 500; font-size: 0.74rem;
    background: rgba(15, 23, 42, 0.5); color: #fff; padding: 0.18rem 0.55rem; border-radius: 999px;
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  }
  .villa-card-body { padding: 0.85rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.45rem; flex: 1; }
  .villa-card-name { font-family: var(--sh-sans); font-weight: 600; color: var(--sh-ink); font-size: 1rem; line-height: 1.25; letter-spacing: -0.01em; }
  .villa-card-meta { display: flex; gap: 0.35rem; flex-wrap: wrap; }
  .villa-card-chip {
    font-family: var(--sh-sans); font-size: 0.66rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
    background: var(--sh-card-2); color: var(--sh-ink-soft); border: 1px solid var(--sh-card-edge); padding: 0.18rem 0.5rem; border-radius: 999px;
  }
  .villa-card-location { font-family: var(--sh-sans); font-weight: 400; font-size: 0.82rem; color: var(--sh-ink-soft); margin-top: auto; line-height: 1.35; }
  .villa-card-check {
    position: absolute; top: 12px; right: 12px; width: 26px; height: 26px; border-radius: 999px;
    background: var(--sh-sage); color: #fff; display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(0.7); transition: all 200ms var(--sh-ease);
  }
  .villa-card.is-selected .villa-card-check { opacity: 1; transform: scale(1); }
  .villa-picker-empty { grid-column: 1 / -1; text-align: center; color: var(--sh-ink-soft); font-family: var(--sh-sans); padding: 3rem 1rem; font-size: 1rem; }

  /* ───────── FileUpload ───────── */
  .fi-fo-file-upload-dropzone {
    background: var(--sh-card-2) !important;
    border: 1px dashed var(--sh-ink-faint) !important;
    border-radius: var(--sh-radius-lg) !important;
    transition: background 140ms, border-color 140ms !important;
  }
  .fi-fo-file-upload-dropzone:hover {
    background: var(--sh-sky-tint) !important;
    border-color: var(--sh-sky) !important;
  }
</style>
