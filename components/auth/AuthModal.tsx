"use client";

import "./auth-modal.css";
import { Suspense, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ModalLayer from "@/components/common/ModalLayer";
import AuthForm from "./AuthForm";

type Mode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSwitchMode: (next: Mode) => void;
};

export default function AuthModal({ open, mode, onClose, onSwitchMode }: AuthModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalLayer onClose={onClose} aria-label="Sign in or create an account">
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal-shell" onClick={(e) => e.stopPropagation()}>
          <div className="auth-modal-panel">
            <button
              type="button"
              className="auth-modal-close"
              aria-label="Close"
              onClick={onClose}
            >
              <FiX aria-hidden="true" />
            </button>

            <Suspense fallback={null}>
              <AuthForm
                mode={mode}
                onSuccess={onClose}
                onSwitchMode={onSwitchMode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </ModalLayer>
  );
}
