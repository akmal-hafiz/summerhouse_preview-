// Pure toast stack rules, shared by ToastProvider and its tests. Policy: docs/design/notifications.md.

export type ToastVariant = "success" | "error" | "info";

export type ToastAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

export type ToastItem = {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
  action?: ToastAction;
  /** A photo shown in place of the status icon (a villa's, on wishlist toasts). */
  image?: string;
  /** Playing its exit; removed by a later dismiss. */
  leaving?: boolean;
};

export type ToastEvent =
  | { type: "push"; toast: ToastItem }
  | { type: "leave"; id: number }
  | { type: "dismiss"; id: number };

/** Three is the most a guest can read at a glance above a phone's bottom edge. */
export const MAX_VISIBLE_TOASTS = 3;

const sameNotice = (a: ToastItem, b: ToastItem) =>
  a.variant === b.variant && a.title === b.title && (a.message ?? "") === (b.message ?? "");

/**
 * Newest last (closest to the screen edge); a repeated notice replaces its older copy; beyond three, the oldest start
 * leaving (kept for their exit animation, then dismissed).
 */
export function toastReducer(state: ToastItem[], event: ToastEvent): ToastItem[] {
  if (event.type === "dismiss") {
    return state.some((toast) => toast.id === event.id) ? state.filter((toast) => toast.id !== event.id) : state;
  }
  if (event.type === "leave") {
    return state.some((toast) => toast.id === event.id && !toast.leaving)
      ? state.map((toast) => (toast.id === event.id ? { ...toast, leaving: true } : toast))
      : state;
  }
  const next = [...state.filter((toast) => !sameNotice(toast, event.toast)), event.toast];
  let overflow = next.filter((toast) => !toast.leaving).length - MAX_VISIBLE_TOASTS;
  return next.map((toast) => (overflow > 0 && !toast.leaving && overflow-- > 0 ? { ...toast, leaving: true } : toast));
}

/** Gap between cards in an expanded stack, and how far each card behind peeks out when collapsed. */
const STACK_GAP = 8;
const STACK_PEEK = 14; // visible peek is 14px minus 5% of a card height (about 10px on a 68px card)

/**
 * Where a card sits in the stack (index 0 is the oldest, count - 1 the front). Collapsed: the cards behind peek out
 * 14px each, smaller, and only the next one shows. Expanded (pointer or focus on the stack): they spread out by real heights.
 */
export function stackLayout(input: { index: number; count: number; expanded: boolean; heights: number[]; gap?: number }) {
  const depth = input.count - 1 - input.index;
  // `|| 0` keeps the front card at 0, not -0.
  if (!input.expanded) return { y: -STACK_PEEK * depth || 0, scale: 1 - 0.05 * depth, opacity: depth >= 2 ? 0 : 1 };
  const gap = input.gap ?? STACK_GAP;
  const inFront = input.heights.slice(input.index + 1, input.count).reduce((sum, height) => sum + height, 0);
  return { y: -(inFront + gap * depth) || 0, scale: 1, opacity: 1 };
}

export const SWIPE_DISMISS_PX = 45;
export const SWIPE_DISMISS_VELOCITY = 0.11; // px per ms: a quick flick dismisses even when it is short

/** A drag toward the screen edge dismisses past 45px, or sooner when it is a quick flick. */
export function shouldSwipeDismiss(distance: number, elapsedMs: number): boolean {
  return distance > 0 && (distance >= SWIPE_DISMISS_PX || distance / Math.max(elapsedMs, 1) > SWIPE_DISMISS_VELOCITY);
}

/** Milliseconds before a toast leaves on its own. Timers pause while the toast is hovered or focused. */
export function toastDuration(toast: Pick<ToastItem, "variant" | "action">): number {
  if (toast.action) return 7000;
  return toast.variant === "error" ? 6200 : 4200;
}

/** Phones: how long a still press must last to open the deck (a home-screen widget's hold), and how far it may drift. */
export const LONG_PRESS_MS = 500;
export const PRESS_SLOP_PX = 8;
/** Phones: how far a swipe away from the screen edge must travel to open the deck (or be a quick flick). */
export const OPEN_SWIPE_PX = 30;

/**
 * What a finger did on the toast deck. `distance` is signed toward the screen edge (positive: toward it, the bottom on
 * the usual deck); `held` means the press lasted LONG_PRESS_MS without drifting past PRESS_SLOP_PX. A deck needs two
 * or more cards.
 */
export function deckGesture(input: { distance: number; elapsedMs: number; held: boolean; open: boolean; count: number }): "open" | "close" | "dismiss" | "none" {
  const deck = input.count >= 2;
  if (input.held && !input.open && deck) return "open";
  if (input.distance > 0 && shouldSwipeDismiss(input.distance, input.elapsedMs)) return input.open ? "close" : "dismiss";
  const away = -input.distance;
  if (!input.open && deck && (away >= OPEN_SWIPE_PX || away / Math.max(input.elapsedMs, 1) > SWIPE_DISMISS_VELOCITY)) return "open";
  return "none";
}
