"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type SiteLanguage = "en" | "id";

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
};

// Same cookie the middleware sets — single source of truth for language.
const LANGUAGE_COOKIE = "summerhouse_language";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
const LEGACY_STORAGE_KEY = "summerhouse:language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

function readLanguageCookie(): SiteLanguage | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=(en|id)(?:;|$)`));
  return match ? (match[1] as SiteLanguage) : null;
}

function writeLanguageCookie(language: SiteLanguage) {
  document.cookie = `${LANGUAGE_COOKIE}=${language}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; samesite=lax`;
}

function detectLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "en";

  // 1. Cookie — set by middleware (server-side detection) or by a manual toggle.
  const fromCookie = readLanguageCookie();
  if (fromCookie) return fromCookie;

  // 2. Migrate a choice saved by the old localStorage-based implementation.
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === "id" || legacy === "en") return legacy;

  // 3. Fallback when middleware didn't run (should be rare).
  return window.navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("en");

  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    writeLanguageCookie(language);
  }, [language]);

  const setLanguage = useCallback((next: SiteLanguage) => {
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => (current === "en" ? "id" : "en"));
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage,
  }), [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
