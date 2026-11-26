"use client";

import "./toast.css";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { FiAlertCircle, FiCheck, FiInfo, FiX } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  deckGesture,
  LONG_PRESS_MS,
  PRESS_SLOP_PX,
  shouldSwipeDismiss,
  stackLayout,
  toastDuration,
  toastReducer,
  type ToastAction,
  type ToastItem,
  type ToastVariant,
} from "@/lib/notifications/toast-queue";

// When to use a toast, and when not to: docs/design/notifications.md. Look and motion: toast.css.

export type ToastInput = {
  title: string;
  message?: string;
  action?: ToastAction;
  /** A photo in place of the status icon (the villa's, on wishlist toasts). */
  image?: string;
};

type ToastContextValue = {
  success: (toast: ToastInput) => number;
  error: (toast: ToastInput) => number;
  info: (toast: ToastInput) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: FiCheck,
  error: FiAlertCircle,
  info: FiInfo,
};

/** Exit length; the card leaves the DOM when it ends (toast.css uses the same values). */
const EXIT_MS = 200;
const REDUCED_EXIT_MS = 160;

/** Alt+N moves keyboard focus to the newest notification; Escape there closes it and returns focus. */
const isToastHotkey = (event: KeyboardEvent) =>
  event.altKey && !event.ctrlKey && !event.metaKey && event.code === "KeyN";

/** True while the tab is hidden, so a toast never runs out unseen. */
function useDocumentHidden() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return hidden;
}

/** The touch deck (phones): open state, how many cards it has, and whether gestures may open it here. */
type Deck = { open: boolean; count: number; enabled: boolean; setOpen: (open: boolean) => void };

type CardProps = {
  item: ToastItem;
  layout: { y: number; scale: number; opacity: number } | null;
  /** Place from the front (0 = front), for the fan-out stagger. */
  depth: number;
  reduced: boolean;
  deck: Deck;
  onDismiss: (id: number) => void;
  onRemove: (id: number) => void;
  onHeight: (id: number, height: number) => void;
};

function ToastCard({ item, layout, depth, reduced, deck, onDismiss, onRemove, onHeight }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const documentHidden = useDocumentHidden();
  const remaining = useRef(toastDuration(item));
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; touch: boolean; start: number; at: number; edge: number; distance: number; held: boolean } | null>(null);
  const holdTimer = useRef<number | undefined>(undefined);
  // A leaving card keeps the place it had, so it exits from where the guest last saw it.
  const lastLayout = useRef(layout ?? { y: 0, scale: 1, opacity: 1 });
  if (layout && !item.leaving) lastLayout.current = layout;
  const Icon = icons[item.variant];
  // Nothing leaves while the guest is looking: hovered, focused, the tab hidden, or the touch deck open.
  const paused = hovered || focused || documentHidden || deck.open;

  useEffect(() => {
    if (paused || item.leaving) return undefined;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(item.id), Math.max(remaining.current, 1200));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [item.id, item.leaving, onDismiss, paused]);

  // Leaving (dismissed, or pushed out by a fourth toast): play the exit, then leave the DOM.
  useEffect(() => {
    if (!item.leaving) return undefined;
    const timer = window.setTimeout(() => onRemove(item.id), reduced ? REDUCED_EXIT_MS : EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [item.id, item.leaving, onRemove, reduced]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    onHeight(item.id, node.offsetHeight);
    const observer = new ResizeObserver(() => onHeight(item.id, node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  const runAction = () => {
    item.action?.onClick?.();
    onDismiss(item.id);
  };

  // Swipe toward the screen edge to dismiss. Drags write a CSS variable on this card only (no re-render per move);
  // a drag that starts on the action or close button is left to the button. On phones the deck also opens with a
  // still press of LONG_PRESS_MS (the card sinks while held, like a home-screen widget) or a swipe away from the edge,
  // and an open deck closes with a swipe toward the edge.
  const stopHold = (node: HTMLElement) => {
    window.clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    delete node.dataset.pressing;
  };
  const openDeck = () => {
    deck.setOpen(true);
    navigator.vibrate?.(8); // Android only; iOS has no web vibration
  };
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || item.leaving || drag.current || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    const node = event.currentTarget;
    const region = node.parentElement;
    const edge = Number(region ? getComputedStyle(region).getPropertyValue("--sh-toast-edge") : 1) || 1;
    // Capture can fail when the pointer is already gone; the drag still works without it.
    try { node.setPointerCapture(event.pointerId); } catch { /* keep going */ }
    const touch = event.pointerType !== "mouse";
    drag.current = { pointer: event.pointerId, touch, start: event.clientY, at: Date.now(), edge, distance: 0, held: false };
    node.dataset.swiping = "";
    if (touch && deck.enabled && !deck.open && deck.count >= 2) {
      node.dataset.pressing = "";
      holdTimer.current = window.setTimeout(() => {
        if (drag.current) drag.current.held = true;
        stopHold(node);
        openDeck();
      }, LONG_PRESS_MS);
    }
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointer) return;
    const delta = event.clientY - current.start;
    current.distance = delta * current.edge;
    if (Math.abs(delta) > PRESS_SLOP_PX) stopHold(event.currentTarget);
    // Toward the edge it follows the finger; away from it, it resists (a little less on a phone, where that pull opens the deck).
    const offset = current.distance > 0 ? delta : delta * (current.touch && deck.enabled ? 0.35 : 0.2);
    event.currentTarget.style.setProperty("--sh-toast-drag", `${offset}px`);
  };
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointer) return;
    drag.current = null;
    const node = event.currentTarget;
    stopHold(node);
    delete node.dataset.swiping;
    node.style.setProperty("--sh-toast-drag", "0px");
    if (event.type !== "pointerup" || current.held) return;
    const elapsedMs = Date.now() - current.at;
    if (!current.touch || !deck.enabled) {
      if (shouldSwipeDismiss(current.distance, elapsedMs)) onDismiss(item.id);
      return;
    }
    const gesture = deckGesture({ distance: current.distance, elapsedMs, held: false, open: deck.open, count: deck.count });
    if (gesture === "open") openDeck();
    else if (gesture === "close") deck.setOpen(false);
    else if (gesture === "dismiss") onDismiss(item.id);
  };

  const place = lastLayout.current;
  return (
    <div
      ref={ref}
      className={`sh-toast sh-toast--${item.variant}${item.image ? " sh-toast--media" : ""}`}
      data-toast-id={item.id}
      data-leaving={item.leaving ? "" : undefined}
      role={item.variant === "error" ? "alert" : undefined}
      style={{ "--sh-toast-y": place.y, "--sh-toast-scale": place.scale, "--sh-toast-opacity": place.opacity, "--sh-toast-depth": depth } as CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") onDismiss(item.id);
      }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // A long press must not open the system menu (save image, copy) under the deck gesture.
      onContextMenu={(event) => { if (drag.current?.touch) event.preventDefault(); }}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- a 44px thumbnail of an image the page already loaded
        <img className="sh-toast__media" src={item.image} alt="" />
      ) : (
        <span className="sh-toast__glyph" aria-hidden="true"><Icon /></span>
      )}
      <div className="sh-toast__copy">
        <p className="sh-toast__title">{item.title}</p>
        {item.message ? <p className="sh-toast__message">{item.message}</p> : null}
      </div>
      {item.action ? (
        item.action.href ? (
          <Link className="sh-toast__action" href={item.action.href} onClick={runAction}>{item.action.label}</Link>
        ) : (
          <button type="button" className="sh-toast__action" onClick={runAction}>{item.action.label}</button>
        )
      ) : null}
      <button type="button" className="sh-toast__close" aria-label={`Dismiss: ${item.title}`} onClick={() => onDismiss(item.id)}>
        <FiX aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * An open modal <dialog> makes everything outside it inert and paints over it, toasts included.
 * ModalLayer registers its dialog here; while one is open the toasts render inside the newest one,
 * so they stay visible, clickable and announced.
 */
const ToastHostContext = createContext<((host: HTMLElement) => () => void) | null>(null);

export function useToastHost(ref: RefObject<HTMLElement | null>) {
  const register = useContext(ToastHostContext);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!register || !host) return undefined;
    return register(host);
  }, [ref, register]);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(toastReducer, []);
  const reduced = usePrefersReducedMotion();
  const nextId = useRef(1);
  const regionRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const [heights, setHeights] = useState<Record<number, number>>({});
  // Hover spreads the deck for a mouse only: a finger's pointerenter would flash it open on every tap.
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const registerHost = useCallback((host: HTMLElement) => {
    setHosts((current) => [...current, host]);
    return () => setHosts((current) => current.filter((item) => item !== host));
  }, []);
  const host = hosts.at(-1);

  const dismiss = useCallback((id: number) => {
    const node = regionRef.current?.querySelector(`[data-toast-id="${id}"]`);
    if (node && node.contains(document.activeElement)) {
      // A toast never keeps focus once it leaves: go back to where the guest was before Alt+N.
      const target = returnFocus.current;
      returnFocus.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
    }
    dispatch({ type: "leave", id });
  }, []);
  const remove = useCallback((id: number) => {
    dispatch({ type: "dismiss", id });
    setHeights(({ [id]: _gone, ...rest }) => rest);
  }, []);
  const measure = useCallback((id: number, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);

  const show = useCallback((variant: ToastVariant, toast: ToastInput) => {
    const id = nextId.current;
    nextId.current += 1;
    dispatch({ type: "push", toast: { id, variant, ...toast } });
    return id;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isToastHotkey(event)) return;
      const toasts = regionRef.current?.querySelectorAll<HTMLElement>("[data-toast-id]:not([data-leaving])");
      const newest = toasts?.[toasts.length - 1];
      const target = newest?.querySelector<HTMLElement>(".sh-toast__action, .sh-toast__close");
      if (!target) return;
      event.preventDefault();
      if (!regionRef.current?.contains(document.activeElement)) returnFocus.current = document.activeElement as HTMLElement | null;
      target.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Escape folds an open touch deck back.
  useEffect(() => {
    if (!deckOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDeckOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deckOpen]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (toast) => show("success", toast),
    error: (toast) => show("error", toast),
    info: (toast) => show("info", toast),
    dismiss,
  }), [dismiss, show]);

  // The stack lays out the cards still on screen; the front (newest) sets the region's height.
  const live = items.filter((item) => !item.leaving);
  const liveHeights = live.map((item) => heights[item.id] ?? 0);
  // A deck needs two cards; one left (or none) folds it back.
  // Open only on the page: a dialog opening (the sheet from "New wishlist") takes the toasts in and folds the deck.
  const open = deckOpen && live.length >= 2 && !host && !reduced;
  useEffect(() => { if (deckOpen && (live.length < 2 || host || reduced)) setDeckOpen(false); }, [deckOpen, live.length, host, reduced]);
  const expanded = hovered || focusWithin || open;
  // Gestures open the deck on the page only: inside a dialog (the wishlist sheet, sign-in) the dialog owns the screen.
  const deck: Deck = { open, count: live.length, enabled: !reduced && !host, setOpen: setDeckOpen };
  const cards = items.map((item) => {
    const index = live.indexOf(item);
    const layout = index < 0 ? null : stackLayout({ index, count: live.length, expanded, heights: liveHeights });
    const depth = index < 0 ? 0 : live.length - 1 - index;
    return <ToastCard key={item.id} item={item} layout={layout} depth={depth} reduced={reduced} deck={deck} onDismiss={dismiss} onRemove={remove} onHeight={measure} />;
  });
  const region = (ref: RefObject<HTMLElement | null> | undefined, content: ReactNode) => (
    <section
      ref={ref}
      className="sh-toast-region"
      aria-label="Notifications (Alt+N)"
      aria-live="polite"
      aria-relevant="additions text"
      data-expanded={expanded ? "" : undefined}
      data-open={open ? "" : undefined}
      style={{ "--sh-toast-front": `${liveHeights.at(-1) ?? 0}px` } as CSSProperties}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setHovered(false); }}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
      }}
    >
      {content}
    </section>
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastHostContext.Provider value={registerHost}>
        {children}
      </ToastHostContext.Provider>
      {/* The open touch deck's focus mode: the page dims and blurs behind it; a tap folds the deck back. */}
      {host ? null : <div className="sh-toast-scrim" data-open={open ? "" : undefined} aria-hidden="true" onClick={() => setDeckOpen(false)} />}
      {/* The page region always exists so a live region is in place before a toast lands in it. */}
      {region(host ? undefined : regionRef, host ? null : cards)}
      {host ? createPortal(region(regionRef, cards), host) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
