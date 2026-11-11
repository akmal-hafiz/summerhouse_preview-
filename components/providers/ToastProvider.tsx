"use client";

import "./toast.css";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { toastDuration, toastReducer, type ToastAction, type ToastItem, type ToastVariant } from "@/lib/notifications/toast-queue";

// When to use a toast, and when not to: docs/design/notifications.md.

export type ToastInput = {
  title: string;
  message?: string;
  action?: ToastAction;
};

type ToastContextValue = {
  success: (toast: ToastInput) => number;
  error: (toast: ToastInput) => number;
  info: (toast: ToastInput) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

/** Alt+N moves keyboard focus to the newest notification; Escape there closes it and returns focus. */
const isToastHotkey = (event: KeyboardEvent) =>
  event.altKey && !event.ctrlKey && !event.metaKey && event.code === "KeyN";

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(toastDuration(item));
  const Icon = icons[item.variant];
  const paused = hovered || focused;

  useEffect(() => {
    if (paused) return undefined;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(item.id), Math.max(remaining.current, 1200));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [item.id, onDismiss, paused]);

  const runAction = () => {
    item.action?.onClick?.();
    onDismiss(item.id);
  };

  return (
    <div
      className={`sh-toast sh-toast--${item.variant}`}
      data-toast-id={item.id}
      role={item.variant === "error" ? "alert" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") onDismiss(item.id);
      }}
    >
      <Icon className="sh-toast__icon" aria-hidden="true" />
      <div className="sh-toast__copy">
        <p className="sh-toast__title">{item.title}</p>
        {item.message ? <p className="sh-toast__message">{item.message}</p> : null}
        {item.action ? (
          item.action.href ? (
            <Link className="sh-toast__action" href={item.action.href} onClick={runAction}>{item.action.label}</Link>
          ) : (
            <button type="button" className="sh-toast__action" onClick={runAction}>{item.action.label}</button>
          )
        ) : null}
      </div>
      <button type="button" className="sh-toast__close" aria-label={`Dismiss: ${item.title}`} onClick={() => onDismiss(item.id)}>
        <FiX aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(toastReducer, []);
  const nextId = useRef(1);
  const regionRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const dismiss = useCallback((id: number) => {
    const node = regionRef.current?.querySelector(`[data-toast-id="${id}"]`);
    if (node && node.contains(document.activeElement)) {
      // A toast never keeps focus once it leaves: go back to where the guest was before Alt+N.
      const target = returnFocus.current;
      returnFocus.current = null;
      if (target?.isConnected) target.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
    }
    dispatch({ type: "dismiss", id });
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
      const toasts = regionRef.current?.querySelectorAll<HTMLElement>("[data-toast-id]");
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

  const value = useMemo<ToastContextValue>(() => ({
    success: (toast) => show("success", toast),
    error: (toast) => show("error", toast),
    info: (toast) => show("info", toast),
    dismiss,
  }), [dismiss, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        ref={regionRef}
        className="sh-toast-region"
        aria-label="Notifications (Alt+N)"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {items.map((item) => <ToastCard key={item.id} item={item} onDismiss={dismiss} />)}
      </section>
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
