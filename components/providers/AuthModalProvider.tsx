"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

type Mode = "login" | "register";

type AuthModalContextValue = {
  isOpen: boolean;
  mode: Mode;
  openAuth: (mode?: Mode) => void;
  closeAuth: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const openAuth = useCallback((next: Mode = "login") => {
    setMode(next);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsOpen(false);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("auth")) return;

    url.searchParams.delete("auth");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  const value = useMemo<AuthModalContextValue>(
    () => ({ isOpen, mode, openAuth, closeAuth }),
    [isOpen, mode, openAuth, closeAuth]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AuthModalQueryBridge openAuth={openAuth} />
      </Suspense>
      <AuthModal
        open={isOpen}
        mode={mode}
        onClose={closeAuth}
        onSwitchMode={setMode}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}

function AuthModalQueryBridge({ openAuth }: { openAuth: (mode?: Mode) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authMode = searchParams.get("auth");
    if (authMode === "login" || authMode === "register") {
      openAuth(authMode);
    }
  }, [openAuth, searchParams]);

  return null;
}
