<style>
  /* ════════════════════════════════════════════════════════
     Summerhouses CMS — macOS Editorial Theme
     Palette: #FAFAF9 paper · #2E2E2C ink · #446B4A sage
     Fonts: Playfair Display (serif), Outfit (sans) — match frontend
  ════════════════════════════════════════════════════════ */

  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

  :root {
    --sh-paper: #FAFAF9;
    --sh-paper-2: #F4F3F0;
    --sh-ink: #2E2E2C;
    --sh-ink-soft: rgba(46, 46, 44, 0.72);
    --sh-ink-mute: rgba(46, 46, 44, 0.48);
    --sh-sage: #446B4A;
    --sh-sage-soft: #5C8762;
    --sh-sage-tint: rgba(68, 107, 74, 0.08);
    --sh-sage-glow: rgba(68, 107, 74, 0.18);
    --sh-line: rgba(46, 46, 44, 0.08);
    --sh-line-strong: rgba(46, 46, 44, 0.14);
    --sh-card: rgba(255, 255, 255, 0.72);
    --sh-card-strong: rgba(255, 255, 255, 0.92);
    --sh-shadow-sm: 0 1px 2px rgba(46, 46, 44, 0.04), 0 1px 1px rgba(46, 46, 44, 0.03);
    --sh-shadow-md: 0 8px 24px rgba(46, 46, 44, 0.06), 0 2px 6px rgba(46, 46, 44, 0.04);
    --sh-shadow-lg: 0 24px 60px rgba(46, 46, 44, 0.10), 0 8px 18px rgba(46, 46, 44, 0.05);
    --sh-radius-sm: 8px;
    --sh-radius: 12px;
    --sh-radius-lg: 16px;
    --sh-radius-xl: 20px;
    --sh-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ───────── Base page — macOS desktop feel ───────── */
  body.fi-body {
    background:
      radial-gradient(1200px 600px at 0% 0%, rgba(68, 107, 74, 0.06), transparent 60%),
      radial-gradient(900px 500px at 100% 100%, rgba(68, 107, 74, 0.04), transparent 55%),
      linear-gradient(180deg, var(--sh-paper) 0%, var(--sh-paper-2) 100%) !important;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif !important;
    color: var(--sh-ink) !important;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'cv11', 'ss01';
  }

  /* ───────── Sidebar — macOS Finder vibe ───────── */
  .fi-sidebar {
    background: rgba(250, 250, 249, 0.78) !important;
    backdrop-filter: saturate(180%) blur(30px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(30px) !important;
    border-right: 1px solid var(--sh-line) !important;
    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.6) !important;
  }

  .fi-sidebar-header {
    background: transparent !important;
    border-bottom: 1px solid var(--sh-line) !important;
    padding: 1.25rem 1rem !important;
  }

  /* Traffic-light spacer — give logo room like macOS title bar */
  .fi-sidebar-header::before {
    content: '';
    display: inline-flex;
    gap: 6px;
    width: 52px;
    height: 12px;
    background-image:
      radial-gradient(circle at 6px 6px, #FF5F57 5px, transparent 6px),
      radial-gradient(circle at 26px 6px, #FEBC2E 5px, transparent 6px),
      radial-gradient(circle at 46px 6px, #28C840 5px, transparent 6px);
    margin-right: 12px;
    opacity: 0.92;
  }

  .fi-logo {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 500 !important;
    font-size: 1.15rem !important;
    letter-spacing: -0.01em !important;
    color: var(--sh-ink) !important;
  }

  /* Sidebar nav items */
  .fi-sidebar-item-button {
    border-radius: 8px !important;
    transition: background 160ms var(--sh-ease), color 160ms var(--sh-ease) !important;
    margin: 1px 0 !important;
    padding: 0.45rem 0.7rem !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    color: var(--sh-ink-soft) !important;
  }

  .fi-sidebar-item-button:hover {
    background: var(--sh-sage-tint) !important;
    color: var(--sh-ink) !important;
  }

  .fi-sidebar-item-button.fi-active {
    background: var(--sh-sage) !important;
    color: #fff !important;
    box-shadow: 0 1px 2px var(--sh-sage-glow), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
  }

  .fi-sidebar-item-button.fi-active svg {
    color: #fff !important;
  }

  .fi-sidebar-item-button svg {
    color: var(--sh-ink-mute) !important;
    width: 1.05rem !important;
    height: 1.05rem !important;
  }

  .fi-sidebar-group-label {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-size: 0.66rem !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    color: var(--sh-ink-mute) !important;
    padding: 1.1rem 0.75rem 0.4rem !important;
  }

  /* ───────── Topbar — translucent macOS ───────── */
  .fi-topbar {
    background: rgba(250, 250, 249, 0.72) !important;
    backdrop-filter: saturate(180%) blur(24px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(24px) !important;
    border-bottom: 1px solid var(--sh-line) !important;
    height: 52px !important;
  }

  /* ───────── Page header ───────── */
  .fi-page-header h1,
  .fi-header-heading {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 500 !important;
    letter-spacing: -0.018em !important;
    color: var(--sh-ink) !important;
    font-size: 2rem !important;
  }

  .fi-header-subheading {
    color: var(--sh-ink-soft) !important;
    font-size: 0.92rem !important;
  }

  /* ───────── Section cards — frosted macOS panels ───────── */
  .fi-section,
  .fi-fo-component-ctn,
  .fi-ta-ctn {
    background: var(--sh-card) !important;
    backdrop-filter: saturate(180%) blur(18px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(18px) !important;
    border: 1px solid var(--sh-line) !important;
    border-radius: var(--sh-radius-lg) !important;
    box-shadow: var(--sh-shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  }

  .fi-section-header {
    padding: 1rem 1.25rem !important;
    border-bottom: 1px solid var(--sh-line) !important;
  }

  .fi-section-header-heading {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 500 !important;
    font-size: 1.15rem !important;
    letter-spacing: -0.005em !important;
    color: var(--sh-ink) !important;
  }

  .fi-section-content {
    padding: 1.25rem !important;
  }

  /* ───────── Form inputs — macOS rounded ───────── */
  .fi-input,
  .fi-select-input,
  .fi-textarea {
    border-radius: var(--sh-radius-sm) !important;
    border: 1px solid var(--sh-line-strong) !important;
    background: rgba(255, 255, 255, 0.85) !important;
    transition: border-color 140ms var(--sh-ease), box-shadow 140ms var(--sh-ease) !important;
    font-size: 0.92rem !important;
    color: var(--sh-ink) !important;
  }

  .fi-input-wrp {
    border-radius: var(--sh-radius-sm) !important;
    border: 1px solid var(--sh-line-strong) !important;
    background: rgba(255, 255, 255, 0.85) !important;
    transition: border-color 140ms var(--sh-ease), box-shadow 140ms var(--sh-ease) !important;
  }

  .fi-input-wrp:focus-within,
  .fi-input:focus,
  .fi-select-input:focus,
  .fi-textarea:focus {
    border-color: var(--sh-sage) !important;
    box-shadow: 0 0 0 4px var(--sh-sage-glow) !important;
    outline: none !important;
  }

  .fi-fo-field-wrp-label {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-size: 0.78rem !important;
    letter-spacing: 0.01em !important;
    font-weight: 600 !important;
    color: var(--sh-ink) !important;
  }

  /* ───────── Buttons — macOS button feel ───────── */
  .fi-btn {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-weight: 500 !important;
    border-radius: var(--sh-radius-sm) !important;
    letter-spacing: 0 !important;
    transition: transform 120ms var(--sh-ease), box-shadow 160ms var(--sh-ease), filter 160ms var(--sh-ease) !important;
  }

  .fi-btn[data-color="primary"],
  .fi-btn.fi-color-primary {
    background: linear-gradient(180deg, var(--sh-sage-soft) 0%, var(--sh-sage) 100%) !important;
    border: 1px solid var(--sh-sage) !important;
    color: #fff !important;
    box-shadow: 0 1px 2px var(--sh-sage-glow), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
  }

  .fi-btn[data-color="primary"]:hover,
  .fi-btn.fi-color-primary:hover {
    filter: brightness(1.04) !important;
    box-shadow: 0 4px 12px var(--sh-sage-glow), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
  }

  .fi-btn[data-color="primary"]:active {
    transform: translateY(0.5px) !important;
    filter: brightness(0.96) !important;
  }

  .fi-btn[data-color="gray"]:not(.fi-color-primary) {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid var(--sh-line-strong) !important;
    color: var(--sh-ink) !important;
    box-shadow: var(--sh-shadow-sm) !important;
  }

  /* ───────── Tables ───────── */
  .fi-ta-table {
    background: transparent !important;
  }

  .fi-ta-header-cell {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-size: 0.68rem !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    color: var(--sh-ink-mute) !important;
    font-weight: 600 !important;
    background: rgba(46, 46, 44, 0.03) !important;
    border-bottom: 1px solid var(--sh-line) !important;
  }

  .fi-ta-row {
    transition: background 140ms ease !important;
    border-bottom: 1px solid var(--sh-line) !important;
  }

  .fi-ta-row:hover {
    background: var(--sh-sage-tint) !important;
  }

  .fi-ta-cell {
    font-size: 0.9rem !important;
    color: var(--sh-ink) !important;
  }

  /* ───────── Badges ───────── */
  .fi-badge {
    border-radius: 999px !important;
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.02em !important;
    padding: 0.25rem 0.6rem !important;
  }

  /* ───────── Tabs ───────── */
  .fi-tabs {
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: var(--sh-radius) !important;
    padding: 4px !important;
    border: 1px solid var(--sh-line) !important;
  }

  .fi-tabs-item {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.88rem !important;
    border-radius: 8px !important;
    transition: background 160ms var(--sh-ease), color 160ms var(--sh-ease) !important;
    color: var(--sh-ink-soft) !important;
    border: none !important;
  }

  .fi-tabs-item:hover {
    background: rgba(255, 255, 255, 0.6) !important;
    color: var(--sh-ink) !important;
  }

  .fi-tabs-item.fi-active {
    background: #fff !important;
    color: var(--sh-sage) !important;
    box-shadow: var(--sh-shadow-sm) !important;
  }

  /* ───────── Modal / Dropdown — macOS panel ───────── */
  .fi-modal-content,
  .fi-dropdown-panel {
    background: rgba(255, 255, 255, 0.94) !important;
    backdrop-filter: saturate(180%) blur(30px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(30px) !important;
    border: 1px solid var(--sh-line-strong) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-shadow-lg) !important;
  }

  /* ───────── Select with custom HTML option (villa picker) ───────── */
  .choices__list--dropdown .choices__item,
  .fi-dropdown-list-item {
    border-radius: 8px !important;
    margin: 2px 4px !important;
    transition: background 120ms ease !important;
  }

  .choices__list--dropdown .choices__item--selectable.is-highlighted,
  .fi-dropdown-list-item:hover {
    background: var(--sh-sage-tint) !important;
  }

  /* ───────── Notifications (toast) ───────── */
  .fi-no-notification {
    border-radius: var(--sh-radius) !important;
    backdrop-filter: saturate(180%) blur(24px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(24px) !important;
    background: rgba(255, 255, 255, 0.94) !important;
    border: 1px solid var(--sh-line-strong) !important;
    box-shadow: var(--sh-shadow-lg) !important;
  }

  /* ───────── Stats widget — macOS dashboard tile ───────── */
  .fi-wi-stats-overview-stat {
    background: var(--sh-card-strong) !important;
    backdrop-filter: saturate(180%) blur(18px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(18px) !important;
    border: 1px solid var(--sh-line) !important;
    border-radius: var(--sh-radius-lg) !important;
    box-shadow: var(--sh-shadow-md) !important;
    transition: transform 220ms var(--sh-ease), box-shadow 220ms ease !important;
    padding: 1.25rem !important;
  }

  .fi-wi-stats-overview-stat:hover {
    transform: translateY(-2px) !important;
    box-shadow: var(--sh-shadow-lg) !important;
  }

  .fi-wi-stats-overview-stat-value {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 500 !important;
    font-size: 1.95rem !important;
    color: var(--sh-ink) !important;
    letter-spacing: -0.02em !important;
  }

  .fi-wi-stats-overview-stat-label {
    font-family: 'Outfit', system-ui, sans-serif !important;
    font-size: 0.68rem !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    color: var(--sh-ink-mute) !important;
    font-weight: 600 !important;
  }

  /* ───────── Login page ───────── */
  .fi-simple-page {
    background:
      radial-gradient(900px 500px at 20% 10%, rgba(68, 107, 74, 0.10), transparent 55%),
      radial-gradient(700px 400px at 80% 90%, rgba(68, 107, 74, 0.07), transparent 50%),
      linear-gradient(180deg, var(--sh-paper) 0%, var(--sh-paper-2) 100%) !important;
  }

  .fi-simple-main {
    background: rgba(255, 255, 255, 0.86) !important;
    backdrop-filter: saturate(180%) blur(30px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(30px) !important;
    border: 1px solid var(--sh-line-strong) !important;
    border-radius: var(--sh-radius-xl) !important;
    box-shadow: var(--sh-shadow-lg) !important;
  }

  .fi-simple-main .fi-logo,
  .fi-simple-main h1,
  .fi-simple-main h2 {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-weight: 500 !important;
    color: var(--sh-ink) !important;
  }

  /* ───────── Repeater (villa selector) ───────── */
  .fi-fo-repeater-item {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 1px solid var(--sh-line) !important;
    border-radius: var(--sh-radius) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    transition: border-color 160ms ease, box-shadow 160ms ease !important;
  }

  .fi-fo-repeater-item:hover {
    border-color: var(--sh-line-strong) !important;
    box-shadow: var(--sh-shadow-sm) !important;
  }

  .fi-fo-repeater-item-header {
    padding: 0.7rem 1rem !important;
    border-bottom: 1px solid var(--sh-line) !important;
  }

  .fi-fo-repeater-item-header-label,
  .fi-fo-repeater-item-label {
    font-weight: 500 !important;
    color: var(--sh-ink) !important;
    font-size: 0.92rem !important;
  }

  /* Repeater add button */
  .fi-fo-repeater-actions .fi-btn {
    background: rgba(255, 255, 255, 0.9) !important;
    border: 1px dashed var(--sh-line-strong) !important;
    color: var(--sh-sage) !important;
    font-weight: 500 !important;
  }

  .fi-fo-repeater-actions .fi-btn:hover {
    background: var(--sh-sage-tint) !important;
    border-style: solid !important;
  }

  /* ───────── Custom HTML select (villa option) ───────── */
  /* Filament uses Choices.js — style the dropdown items */
  .choices__list--dropdown,
  .choices__list[aria-expanded] {
    background: rgba(255, 255, 255, 0.96) !important;
    backdrop-filter: saturate(180%) blur(24px) !important;
    -webkit-backdrop-filter: saturate(180%) blur(24px) !important;
    border: 1px solid var(--sh-line-strong) !important;
    border-radius: var(--sh-radius) !important;
    box-shadow: var(--sh-shadow-lg) !important;
    padding: 6px !important;
  }

  .choices__item--choice {
    border-radius: 8px !important;
    padding: 0.5rem 0.6rem !important;
  }

  /* ───────── Entrance animation ───────── */
  @keyframes shFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fi-section,
  .fi-wi-stats-overview-stat {
    animation: shFadeIn 360ms var(--sh-ease) backwards;
  }

  .fi-section:nth-child(2) { animation-delay: 50ms; }
  .fi-section:nth-child(3) { animation-delay: 100ms; }
  .fi-section:nth-child(4) { animation-delay: 150ms; }

  /* ───────── Scrollbar — macOS ───────── */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(46, 46, 44, 0.18);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(46, 46, 44, 0.32);
    background-clip: padding-box;
    border: 2px solid transparent;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* ───────── Tooltip ───────── */
  [x-data*="tooltip"] [role="tooltip"] {
    background: var(--sh-ink) !important;
    color: var(--sh-paper) !important;
    border-radius: 8px !important;
    font-size: 0.78rem !important;
    padding: 0.4rem 0.7rem !important;
    box-shadow: var(--sh-shadow-md) !important;
  }

  /* ════════════════════════════════════════════════════════
     Villa Picker (custom field) — all styles here, never inline
  ════════════════════════════════════════════════════════ */
  [x-cloak] { display: none !important; }

  .villa-picker-preview {
    width: 100%;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--sh-line-strong);
    border-radius: var(--sh-radius);
    padding: 0.7rem 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: border-color 160ms var(--sh-ease), box-shadow 160ms var(--sh-ease), transform 120ms var(--sh-ease);
    box-shadow: var(--sh-shadow-sm);
  }
  .villa-picker-preview:hover {
    border-color: var(--sh-sage);
    box-shadow: 0 4px 14px var(--sh-sage-glow);
  }
  .villa-picker-preview.is-empty {
    border-style: dashed;
    background: rgba(255, 255, 255, 0.5);
  }
  .villa-picker-preview-inner {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }
  .villa-picker-preview-img {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  .villa-picker-thumb-fallback {
    background: var(--sh-sage-tint);
    color: var(--sh-sage);
    font-weight: 600;
    font-size: 0.78rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }
  .villa-picker-preview-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .villa-picker-preview-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--sh-ink);
    letter-spacing: -0.005em;
  }
  .villa-picker-preview-meta {
    font-size: 0.74rem;
    color: var(--sh-ink-mute);
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .villa-picker-preview-cta {
    font-size: 0.74rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--sh-sage);
    background: var(--sh-sage-tint);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .villa-picker-preview-empty {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }
  .villa-picker-preview-empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: var(--sh-sage-tint);
    color: var(--sh-sage);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .villa-picker-preview-empty-text {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .villa-picker-preview-empty-text strong {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 500;
    color: var(--sh-ink);
    font-size: 1.02rem;
  }
  .villa-picker-preview-empty-text small {
    font-size: 0.76rem;
    color: var(--sh-ink-mute);
  }

  /* Modal */
  .villa-picker-modal-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .villa-picker-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(20, 22, 20, 0.42);
    backdrop-filter: blur(8px) saturate(120%);
    -webkit-backdrop-filter: blur(8px) saturate(120%);
  }
  .villa-picker-modal {
    position: relative;
    width: min(1100px, 96vw);
    max-height: 88vh;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: saturate(180%) blur(30px);
    -webkit-backdrop-filter: saturate(180%) blur(30px);
    border: 1px solid var(--sh-line-strong);
    border-radius: var(--sh-radius-xl);
    box-shadow: 0 24px 60px rgba(20, 22, 20, 0.28), 0 8px 18px rgba(20, 22, 20, 0.10);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .vp-enter { transition: transform 240ms var(--sh-ease), opacity 240ms; }
  .vp-enter-from { opacity: 0; transform: translateY(12px) scale(0.985); }
  .vp-enter-to { opacity: 1; transform: translateY(0) scale(1); }

  .villa-picker-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid var(--sh-line);
  }
  .villa-picker-modal-title h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 500;
    color: var(--sh-ink);
    font-size: 1.35rem;
    letter-spacing: -0.012em;
    margin: 0;
  }
  .villa-picker-modal-title p {
    font-size: 0.78rem;
    color: var(--sh-ink-mute);
    margin: 2px 0 0;
  }
  .villa-picker-close {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(46, 46, 44, 0.06);
    border: none;
    color: var(--sh-ink);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 140ms;
  }
  .villa-picker-close:hover { background: rgba(46, 46, 44, 0.12); }

  .villa-picker-toolbar {
    display: flex;
    gap: 0.8rem;
    padding: 0.9rem 1.4rem;
    border-bottom: 1px solid var(--sh-line);
    flex-wrap: wrap;
    align-items: center;
  }
  .villa-picker-search {
    flex: 1;
    min-width: 240px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--sh-line-strong);
    border-radius: 10px;
    padding: 0.55rem 0.75rem;
    color: var(--sh-ink-mute);
    transition: border-color 140ms, box-shadow 140ms;
  }
  .villa-picker-search:focus-within {
    border-color: var(--sh-sage);
    box-shadow: 0 0 0 4px var(--sh-sage-glow);
    color: var(--sh-sage);
  }
  .villa-picker-search input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.92rem;
    color: var(--sh-ink);
    font-family: inherit;
  }
  .villa-picker-filters {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .villa-picker-filters button {
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.4rem 0.78rem;
    border-radius: 999px;
    border: 1px solid var(--sh-line-strong);
    background: rgba(255, 255, 255, 0.85);
    color: var(--sh-ink-soft);
    cursor: pointer;
    transition: all 140ms;
  }
  .villa-picker-filters button:hover {
    border-color: rgba(68, 107, 74, 0.4);
    color: var(--sh-sage);
  }
  .villa-picker-filters button.active {
    background: var(--sh-sage);
    border-color: var(--sh-sage);
    color: #fff;
    box-shadow: 0 1px 4px var(--sh-sage-glow);
  }

  .villa-picker-grid {
    flex: 1;
    overflow-y: auto;
    padding: 1.1rem 1.4rem 1.4rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.9rem;
    background: linear-gradient(180deg, rgba(250,250,249,0.4) 0%, rgba(244,243,240,0.6) 100%);
  }
  .villa-card {
    background: #fff;
    border: 1px solid var(--sh-line);
    border-radius: 14px;
    padding: 0;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    transition: transform 180ms var(--sh-ease), border-color 180ms, box-shadow 180ms;
    box-shadow: var(--sh-shadow-sm);
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .villa-card:hover {
    transform: translateY(-3px);
    border-color: rgba(68, 107, 74, 0.4);
    box-shadow: 0 10px 26px rgba(46,46,44,0.10);
  }
  .villa-card.is-selected {
    border-color: var(--sh-sage);
    box-shadow: 0 0 0 3px rgba(68, 107, 74, 0.22), 0 10px 26px rgba(46,46,44,0.10);
  }
  .villa-card-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: rgba(68, 107, 74, 0.06);
  }
  .villa-card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 360ms var(--sh-ease);
  }
  .villa-card:hover .villa-card-thumb img {
    transform: scale(1.05);
  }
  .villa-card-thumb-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.8rem;
    color: var(--sh-sage);
    background: var(--sh-sage-tint);
  }
  .villa-card-id {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    background: rgba(20, 22, 20, 0.55);
    color: #fff;
    padding: 0.18rem 0.46rem;
    border-radius: 999px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .villa-card-body {
    padding: 0.7rem 0.85rem 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }
  .villa-card-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 500;
    color: var(--sh-ink);
    font-size: 0.98rem;
    line-height: 1.3;
    letter-spacing: -0.005em;
  }
  .villa-card-meta {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .villa-card-chip {
    font-size: 0.66rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--sh-sage-tint);
    color: var(--sh-sage);
    padding: 0.18rem 0.46rem;
    border-radius: 999px;
  }
  .villa-card-location {
    font-size: 0.74rem;
    color: var(--sh-ink-mute);
    margin-top: auto;
    line-height: 1.35;
  }
  .villa-card-check {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--sh-sage);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.7);
    transition: all 180ms var(--sh-ease);
    box-shadow: 0 4px 10px rgba(68, 107, 74, 0.38);
  }
  .villa-card.is-selected .villa-card-check {
    opacity: 1;
    transform: scale(1);
  }
  .villa-picker-empty {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--sh-ink-mute);
    padding: 3rem 1rem;
    font-size: 0.95rem;
  }
</style>
