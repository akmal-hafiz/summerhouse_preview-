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
};

export type ToastEvent =
  | { type: "push"; toast: ToastItem }
  | { type: "dismiss"; id: number };

/** Three is the most a guest can read at a glance above a phone's bottom edge. */
export const MAX_VISIBLE_TOASTS = 3;

const sameNotice = (a: ToastItem, b: ToastItem) =>
  a.variant === b.variant && a.title === b.title && (a.message ?? "") === (b.message ?? "");

/** Newest last (closest to the screen edge); a repeated notice replaces its older copy; the oldest leave first. */
export function toastReducer(state: ToastItem[], event: ToastEvent): ToastItem[] {
  if (event.type === "dismiss") {
    return state.some((toast) => toast.id === event.id) ? state.filter((toast) => toast.id !== event.id) : state;
  }
  const next = [...state.filter((toast) => !sameNotice(toast, event.toast)), event.toast];
  return next.slice(Math.max(0, next.length - MAX_VISIBLE_TOASTS));
}

/** Milliseconds before a toast leaves on its own. Timers pause while the toast is hovered or focused. */
export function toastDuration(toast: Pick<ToastItem, "variant" | "action">): number {
  if (toast.action) return 7000;
  return toast.variant === "error" ? 6200 : 4200;
}
