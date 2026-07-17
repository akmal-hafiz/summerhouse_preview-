"use client";

import "./toast.css";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  title: string;
  message?: string;
};

type ToastInput = {
  title: string;
  message?: string;
};

type ToastContextValue = {
  success: (toast: ToastInput) => void;
  error: (toast: ToastInput) => void;
  info: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((variant: ToastVariant, toast: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const item: ToastItem = { id, variant, ...toast };
    setItems((current) => [item, ...current].slice(0, 4));
    window.setTimeout(() => dismiss(id), variant === "error" ? 6200 : 4200);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (toast) => show("success", toast),
    error: (toast) => show("error", toast),
    info: (toast) => show("info", toast),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="sh-toast-region" aria-live="polite" aria-atomic="false">
        {items.map((item) => {
          const Icon = icons[item.variant];
          return (
            <div className={`sh-toast sh-toast--${item.variant}`} key={item.id} role={item.variant === "error" ? "alert" : "status"}>
              <Icon className="sh-toast__icon" aria-hidden="true" />
              <div className="sh-toast__copy">
                <strong>{item.title}</strong>
                {item.message ? <span>{item.message}</span> : null}
              </div>
              <button type="button" className="sh-toast__close" aria-label="Close notification" onClick={() => dismiss(item.id)}>
                <FiX aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
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
