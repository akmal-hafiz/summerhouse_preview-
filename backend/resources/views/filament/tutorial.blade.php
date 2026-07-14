<style>
  /* ════════════════════════════════════════════════════════
     Summerhouses CMS — Guided tour
     Spotlight overlay · Stratify-themed tooltip · FAB launcher
  ════════════════════════════════════════════════════════ */
  .sh-tour-fab {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 9000;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    height: 48px;
    padding: 0 18px 0 14px;
    background: var(--sh-sky, #446B4A);
    color: #fff;
    border: none;
    border-radius: 999px;
    font-family: var(--sh-sans, 'Outfit', sans-serif);
    font-weight: 600;
    font-size: 0.88rem;
    letter-spacing: -0.005em;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35), 0 2px 6px rgba(15, 23, 42, 0.12);
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), background 160ms;
  }
  .sh-tour-fab:hover { background: var(--sh-sky-dark, #2563EB); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(59, 130, 246, 0.45); }
  .sh-tour-fab:focus-visible { outline: 3px solid rgba(59, 130, 246, 0.45); outline-offset: 3px; }
  .sh-tour-fab svg { width: 18px; height: 18px; }
  .sh-tour-fab[hidden] { display: none !important; }

  .sh-tour-fab--unseen::after {
    content: '';
    position: absolute;
    top: 6px; right: 6px;
    width: 10px; height: 10px;
    border-radius: 999px;
    background: #FACC15;
    box-shadow: 0 0 0 2px #fff;
    animation: sh-tour-pulse 1.6s ease-in-out infinite;
  }
  @keyframes sh-tour-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.25); opacity: 0.7; } }

  /* Overlay */
  .sh-tour-overlay {
    position: fixed;
    inset: 0;
    z-index: 9500;
    pointer-events: none;
    visibility: hidden;
  }
  .sh-tour-overlay--active { pointer-events: auto; visibility: visible; }

  .sh-tour-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(8, 13, 24, 0.68);
    backdrop-filter: blur(8px) saturate(140%);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    transition: opacity 240ms ease;
    opacity: 0;
  }
  .sh-tour-overlay--active .sh-tour-backdrop { opacity: 1; }

  .sh-tour-spotlight {
    position: fixed;
    border-radius: 16px;
    box-shadow:
      0 0 0 9999px rgba(8, 13, 24, 0.68),
      0 0 0 4px rgba(59, 130, 246, 0.65),
      0 0 0 8px rgba(59, 130, 246, 0.22);
    transition: top 320ms cubic-bezier(0.22, 1, 0.36, 1), left 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), height 320ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 320ms ease;
    pointer-events: none;
  }
  .sh-tour-spotlight--no-target {
    top: 50%; left: 50%; width: 1px; height: 1px;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 9999px rgba(8, 13, 24, 0.78);
    border-radius: 0;
  }

  /* Tooltip */
  .sh-tour-card {
    position: fixed;
    width: min(340px, calc(100vw - 32px));
    background: #fff;
    border: 1px solid #EEF1F6;
    border-radius: 22px;
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(15, 23, 42, 0.08);
    padding: 18px 20px 16px;
    font-family: var(--sh-sans, 'Outfit', sans-serif);
    color: var(--sh-ink, #1E293B);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .sh-tour-overlay--active .sh-tour-card { opacity: 1; transform: translateY(0); }

  .sh-tour-arrow {
    position: absolute;
    width: 14px; height: 14px;
    background: #fff;
    border: 1px solid #EEF1F6;
    transform: rotate(45deg);
  }
  .sh-tour-arrow--top    { top: -8px;    left: 24px; border-right: none; border-bottom: none; }
  .sh-tour-arrow--bottom { bottom: -8px; left: 24px; border-left: none; border-top: none; }
  .sh-tour-arrow--left   { left: -8px;   top: 24px;  border-right: none; border-top: none; }
  .sh-tour-arrow--right  { right: -8px;  top: 24px;  border-left: none; border-bottom: none; }

  .sh-tour-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.7rem;
    border-radius: 999px;
    background: #DCE5DD;
    color: #355538;
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    margin-bottom: 0.6rem;
  }
  .sh-tour-eyebrow-dot { width: 6px; height: 6px; border-radius: 999px; background: #446B4A; }

  .sh-tour-title {
    font-weight: 600;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
    margin: 0 0 0.4rem;
    line-height: 1.25;
  }
  .sh-tour-body {
    font-size: 0.86rem;
    line-height: 1.55;
    color: #475569;
    margin: 0 0 1rem;
  }

  .sh-tour-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .sh-tour-skip {
    background: none;
    border: none;
    color: #64748B;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    transition: color 140ms, background 140ms;
  }
  .sh-tour-skip:hover { color: #1E293B; background: #F1F5F9; }
  .sh-tour-nav { display: flex; gap: 0.4rem; align-items: center; }
  .sh-tour-btn {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.82rem;
    border-radius: 999px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 140ms, color 140ms, border-color 140ms, transform 140ms;
  }
  .sh-tour-btn:hover { transform: translateY(-1px); }
  .sh-tour-btn--ghost { background: #fff; border-color: #E2E8F0; color: #1E293B; }
  .sh-tour-btn--ghost:hover { background: #F8FAFC; }
  .sh-tour-btn--ghost:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .sh-tour-btn--primary { background: #446B4A; color: #fff; box-shadow: 0 4px 14px rgba(68, 107, 74, 0.32); }
  .sh-tour-btn--primary:hover { background: #2563EB; }
  .sh-tour-btn--done { background: #446B4A; color: #fff; box-shadow: 0 4px 14px rgba(68, 107, 74, 0.32); }
  .sh-tour-btn--done:hover { background: #3A5C40; }

  .sh-tour-progress {
    margin-top: 0.85rem;
    height: 3px;
    border-radius: 999px;
    background: #EEF1F6;
    overflow: hidden;
  }
  .sh-tour-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #446B4A, #6E9273);
    transition: width 320ms ease;
  }

  /* Highlight ring on the live element (in addition to spotlight cutout) */
  .sh-tour-target {
    position: relative;
    z-index: 9501 !important;
    isolation: isolate;
  }
  /* Lift the entire chain of stacking contexts so target shows above the dim layer */
  .sh-tour-lift {
    z-index: 9500 !important;
    position: relative;
  }

  /* Docked-card fallback when no good side fits */
  .sh-tour-card--docked {
    position: fixed !important;
    left: 50% !important;
    bottom: 20px !important;
    top: auto !important;
    transform: translateX(-50%);
    width: min(420px, calc(100vw - 32px)) !important;
  }
  .sh-tour-card--docked .sh-tour-arrow { display: none; }

  /* Mobile: dock tooltip to bottom */
  @media (max-width: 640px) {
    .sh-tour-fab { right: 16px; bottom: 16px; }
    .sh-tour-card {
      position: fixed !important;
      left: 12px !important;
      right: 12px !important;
      bottom: 12px !important;
      top: auto !important;
      width: auto !important;
      max-width: none;
    }
    .sh-tour-arrow { display: none; }
  }
</style>

<button type="button" class="sh-tour-fab" id="shTourFab" aria-label="Open tutorial" hidden>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </svg>
  <span class="sh-tour-fab-label">Tutorial</span>
</button>

<div class="sh-tour-overlay" id="shTourOverlay" aria-hidden="true">
  <div class="sh-tour-backdrop"></div>
  <div class="sh-tour-spotlight sh-tour-spotlight--no-target" id="shTourSpotlight"></div>
  <div class="sh-tour-card" id="shTourCard" role="dialog" aria-live="polite" aria-labelledby="shTourTitle">
    <span class="sh-tour-arrow sh-tour-arrow--top" id="shTourArrow"></span>
    <span class="sh-tour-eyebrow">
      <span class="sh-tour-eyebrow-dot"></span>
      <span id="shTourCounter">Step 1 of 1</span>
    </span>
    <h3 class="sh-tour-title" id="shTourTitle"></h3>
    <p class="sh-tour-body" id="shTourBody"></p>
    <div class="sh-tour-foot">
      <button type="button" class="sh-tour-skip" id="shTourSkip">Skip tutorial</button>
      <div class="sh-tour-nav">
        <button type="button" class="sh-tour-btn sh-tour-btn--ghost" id="shTourPrev">Back</button>
        <button type="button" class="sh-tour-btn sh-tour-btn--primary" id="shTourNext">Next</button>
      </div>
    </div>
    <div class="sh-tour-progress"><div class="sh-tour-progress-bar" id="shTourBar" style="width: 0%"></div></div>
  </div>
</div>

<script>
(function () {
  if (window.__shTutorialBooted) return;
  window.__shTutorialBooted = true;

  const STORAGE_NS = 'summerhouses-tutorial:done:';
  const PAD = 16;
  const SETTLE_MS = 380;

  const els = {};
  const state = {
    routeKey: null,
    steps: [],
    index: 0,
    active: false,
    target: null,
    scrollRoot: null,
    liftedAncestors: [],
    repositionRaf: 0,
  };

  function $(s) { return document.querySelector(s); }

  function pickRouteKey() {
    const path = window.location.pathname.replace(/\/+$/, '');
    const matchers = window.SHTutorialRoutes || [];
    for (const m of matchers) {
      try { if (new RegExp(m.pattern).test(path)) return m.key; } catch (_) {}
    }
    if (/\/admin$/.test(path)) return 'dashboard';
    return null;
  }

  function isDone(key) {
    try { return window.localStorage.getItem(STORAGE_NS + key) === '1'; } catch (_) { return false; }
  }
  function markDone(key) {
    try { window.localStorage.setItem(STORAGE_NS + key, '1'); } catch (_) {}
    if (els.fab) els.fab.classList.remove('sh-tour-fab--unseen');
  }

  function resolveTarget(selector) {
    if (!selector) return null;
    try { return document.querySelector(selector); } catch (_) { return null; }
  }

  /* Walk up to find the first scrollable ancestor. */
  function findScrollRoot(el) {
    let node = el && el.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      const overflowY = cs.overflowY;
      const canScrollY = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay');
      if (canScrollY && node.scrollHeight > node.clientHeight + 2) return node;
      node = node.parentElement;
    }
    return window;
  }

  /* Programmatic scroll that works on both window and inner containers. */
  function scrollTargetIntoView(target, scrollRoot) {
    if (!target) return Promise.resolve();
    const rect = target.getBoundingClientRect();
    const vh = window.innerHeight;
    /* If already fully visible with breathing room, skip. */
    if (rect.top >= 80 && rect.bottom <= vh - 80) return Promise.resolve();

    if (scrollRoot === window) {
      const targetY = window.scrollY + rect.top - (vh / 2) + (rect.height / 2);
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } else {
      const rootRect = scrollRoot.getBoundingClientRect();
      const delta = (rect.top - rootRect.top) - (scrollRoot.clientHeight / 2) + (rect.height / 2);
      scrollRoot.scrollTo({ top: scrollRoot.scrollTop + delta, behavior: 'smooth' });
    }

    return new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
  }

  /* Lift target + ancestors out of trapping stacking contexts. */
  function liftAncestors(target) {
    clearLifts();
    if (!target) return;
    let node = target.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      const transformed = cs.transform !== 'none' || cs.filter !== 'none' || cs.willChange !== 'auto' || cs.contain !== 'none';
      if (transformed || cs.position === 'fixed' || cs.position === 'sticky') {
        node.classList.add('sh-tour-lift');
        state.liftedAncestors.push(node);
      }
      node = node.parentElement;
    }
  }
  function clearLifts() {
    state.liftedAncestors.forEach((n) => n.classList.remove('sh-tour-lift'));
    state.liftedAncestors = [];
  }

  function placeSpotlight(rect) {
    const sp = els.spotlight;
    if (!rect || rect.width === 0 || rect.height === 0) {
      sp.classList.add('sh-tour-spotlight--no-target');
      sp.style.cssText = '';
      return;
    }
    sp.classList.remove('sh-tour-spotlight--no-target');
    const pad = 8;
    sp.style.top = (rect.top - pad) + 'px';
    sp.style.left = (rect.left - pad) + 'px';
    sp.style.width = (rect.width + pad * 2) + 'px';
    sp.style.height = (rect.height + pad * 2) + 'px';
  }

  /* Try a position, return computed coords + whether it fits. */
  function tryPosition(targetRect, cardRect, pos) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let top = 0, left = 0, fits = true;

    if (pos === 'bottom') {
      top = targetRect.bottom + PAD;
      left = Math.max(PAD, Math.min(vw - cardRect.width - PAD, targetRect.left));
      fits = top + cardRect.height <= vh - PAD;
    } else if (pos === 'top') {
      top = targetRect.top - cardRect.height - PAD;
      left = Math.max(PAD, Math.min(vw - cardRect.width - PAD, targetRect.left));
      fits = top >= PAD;
    } else if (pos === 'right') {
      left = targetRect.right + PAD;
      top = Math.max(PAD, Math.min(vh - cardRect.height - PAD, targetRect.top));
      fits = left + cardRect.width <= vw - PAD;
    } else {
      left = targetRect.left - cardRect.width - PAD;
      top = Math.max(PAD, Math.min(vh - cardRect.height - PAD, targetRect.top));
      fits = left >= PAD;
    }
    return { top, left, fits };
  }

  function placeTooltip(targetRect, requested) {
    const card = els.card;
    const arrow = els.arrow;
    card.classList.remove('sh-tour-card--docked');
    card.style.cssText = card.style.cssText.replace(/(top|left|right|bottom|transform|width):[^;]*;?/g, '');
    const cardRect = card.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;

    /* No target → center of screen. */
    if (!targetRect) {
      card.style.top = Math.max(PAD, (vh - cardRect.height) / 2) + 'px';
      card.style.left = Math.max(PAD, (vw - cardRect.width) / 2) + 'px';
      arrow.style.display = 'none';
      return;
    }
    arrow.style.display = '';

    /* Build position attempt order: requested → opposite → orthogonal axes. */
    const opposites = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const baseOrder = ['bottom', 'top', 'right', 'left'];
    let order;
    if (requested && requested !== 'auto') {
      order = [requested, opposites[requested]].concat(baseOrder.filter((p) => p !== requested && p !== opposites[requested]));
    } else {
      const scores = [
        { p: 'bottom', s: vh - targetRect.bottom },
        { p: 'top',    s: targetRect.top },
        { p: 'right',  s: vw - targetRect.right },
        { p: 'left',   s: targetRect.left },
      ].sort((a, b) => b.s - a.s);
      order = scores.map((x) => x.p);
    }

    let chosen = null;
    for (const p of order) {
      const r = tryPosition(targetRect, cardRect, p);
      if (r.fits) { chosen = { pos: p, ...r }; break; }
    }

    /* Nothing fits → dock to viewport bottom-center. */
    if (!chosen) {
      card.classList.add('sh-tour-card--docked');
      return;
    }

    arrow.className = 'sh-tour-arrow';
    if (chosen.pos === 'bottom') {
      arrow.classList.add('sh-tour-arrow--top');
      arrow.style.left = Math.max(20, Math.min(cardRect.width - 28, targetRect.left + targetRect.width / 2 - chosen.left)) + 'px';
      arrow.style.top = '';
    } else if (chosen.pos === 'top') {
      arrow.classList.add('sh-tour-arrow--bottom');
      arrow.style.left = Math.max(20, Math.min(cardRect.width - 28, targetRect.left + targetRect.width / 2 - chosen.left)) + 'px';
      arrow.style.top = '';
    } else if (chosen.pos === 'right') {
      arrow.classList.add('sh-tour-arrow--left');
      arrow.style.top = Math.max(20, Math.min(cardRect.height - 28, targetRect.top + targetRect.height / 2 - chosen.top)) + 'px';
      arrow.style.left = '';
    } else {
      arrow.classList.add('sh-tour-arrow--right');
      arrow.style.top = Math.max(20, Math.min(cardRect.height - 28, targetRect.top + targetRect.height / 2 - chosen.top)) + 'px';
      arrow.style.left = '';
    }
    card.style.top = chosen.top + 'px';
    card.style.left = chosen.left + 'px';
  }

  function repositionNow() {
    if (!state.active) return;
    const rect = state.target ? state.target.getBoundingClientRect() : null;
    placeSpotlight(rect);
    placeTooltip(rect, state.steps[state.index]?.position || 'auto');
  }
  function repositionRaf() {
    cancelAnimationFrame(state.repositionRaf);
    state.repositionRaf = requestAnimationFrame(repositionNow);
  }

  async function renderStep(dir = 1) {
    const step = state.steps[state.index];
    if (!step) return finish();

    /* Skip steps whose target is absent (e.g. an empty table has no .fi-ta-row).
       A missing target would otherwise render a full-black no-cutout overlay. */
    if (step.selector && !resolveTarget(step.selector)) {
      const nextIndex = state.index + dir;
      if (nextIndex < 0 || nextIndex >= state.steps.length) return finish();
      state.index = nextIndex;
      return renderStep(dir);
    }

    els.title.textContent = step.title || '';
    els.body.textContent = step.body || '';
    els.counter.textContent = `Step ${state.index + 1} of ${state.steps.length}`;
    els.bar.style.width = (((state.index + 1) / state.steps.length) * 100) + '%';

    els.prev.disabled = state.index === 0;
    const last = state.index === state.steps.length - 1;
    els.next.textContent = last ? 'Done' : 'Next';
    els.next.classList.toggle('sh-tour-btn--done', last);
    els.next.classList.toggle('sh-tour-btn--primary', !last);

    if (state.target) state.target.classList.remove('sh-tour-target');
    clearLifts();

    const target = resolveTarget(step.selector);
    state.target = target;

    if (!target) {
      placeSpotlight(null);
      placeTooltip(null, 'auto');
      return;
    }

    /* Phase 1: scroll into view (uses inner container if it's the scroller). */
    state.scrollRoot = findScrollRoot(target);
    await scrollTargetIntoView(target, state.scrollRoot);

    /* Phase 2: lift stacking, mark target. */
    target.classList.add('sh-tour-target');
    liftAncestors(target);

    /* Phase 3: measure final layout after settle, then place. */
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    repositionNow();
  }

  function start() {
    if (!state.steps.length) return;
    state.index = 0;
    state.active = true;
    els.overlay.classList.add('sh-tour-overlay--active');
    els.overlay.setAttribute('aria-hidden', 'false');
    renderStep(1);
  }
  function next() {
    if (state.index >= state.steps.length - 1) return finish();
    state.index += 1;
    renderStep(1);
  }
  function prev() {
    if (state.index === 0) return;
    state.index -= 1;
    renderStep(-1);
  }
  function finish() {
    state.active = false;
    els.overlay.classList.remove('sh-tour-overlay--active');
    els.overlay.setAttribute('aria-hidden', 'true');
    if (state.target) state.target.classList.remove('sh-tour-target');
    clearLifts();
    state.target = null;
    if (state.routeKey) markDone(state.routeKey);
  }

  function bindScrollListeners() {
    /* Track scroll on window + any visible scrollable container so the spotlight follows. */
    const onScroll = () => { if (state.active && state.target) repositionRaf(); };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', () => { if (state.active) repositionRaf(); });
  }

  function init() {
    els.fab = $('#shTourFab');
    els.overlay = $('#shTourOverlay');
    els.card = $('#shTourCard');
    els.spotlight = $('#shTourSpotlight');
    els.arrow = $('#shTourArrow');
    els.title = $('#shTourTitle');
    els.body = $('#shTourBody');
    els.counter = $('#shTourCounter');
    els.bar = $('#shTourBar');
    els.prev = $('#shTourPrev');
    els.next = $('#shTourNext');
    els.skip = $('#shTourSkip');

    state.routeKey = pickRouteKey();
    const all = window.SHTutorialSteps || {};
    state.steps = state.routeKey && Array.isArray(all[state.routeKey]) ? all[state.routeKey] : [];
    if (!state.steps.length) return;

    els.fab.hidden = false;
    if (!isDone(state.routeKey)) els.fab.classList.add('sh-tour-fab--unseen');

    els.fab.addEventListener('click', start);
    els.skip.addEventListener('click', finish);
    els.next.addEventListener('click', next);
    els.prev.addEventListener('click', prev);

    document.addEventListener('keydown', (e) => {
      if (!state.active) return;
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    bindScrollListeners();

    /* Auto-start disabled — the tour only runs when the user clicks the FAB.
       Re-enable by uncommenting the block below.
    if (!isDone(state.routeKey)) {
      setTimeout(() => { if (!state.active) start(); }, 1100);
    }
    */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
