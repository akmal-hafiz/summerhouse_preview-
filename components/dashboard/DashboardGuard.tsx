"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { safeHttpHref } from "@/lib/safe-url";

type DashboardGuardProps = {
  children: ReactNode;
};

// The guard speaks the site's chosen language (the dashboard pages themselves are English).
const COPY = {
  en: {
    loading: "Loading your dashboard...",
    authError: "We could not check your account session yet. Please try again in a moment.",
    retry: "Try again",
    signInPrompt: "Sign in to open your dashboard.",
    signIn: "Sign in",
    home: "Back to the homepage",
    adminNotice: "This dashboard is for members. You are signed in as a CMS admin, and your CMS session stays signed in.",
    openAdmin: "Open the CMS",
  },
  id: {
    loading: "Memuat dashboard...",
    authError: "Kami belum bisa memeriksa sesi akun Anda. Coba lagi sebentar.",
    retry: "Coba lagi",
    signInPrompt: "Masuk untuk membuka dashboard.",
    signIn: "Masuk ke akun",
    home: "Kembali ke beranda",
    adminNotice: "Dashboard ini untuk member. Anda masuk sebagai admin CMS, dan sesi CMS Anda tetap aktif.",
    openAdmin: "Buka dashboard admin",
  },
} as const;

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { isAuthenticated, isAdmin, isLoading, authError } = useAuth();
  const { openAuth } = useAuthModal();
  const { language } = useLanguage();
  const copy = COPY[language] ?? COPY.en;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !authError) {
      openAuth("login");
    }
  }, [isAuthenticated, isLoading, authError, openAuth]);

  if (isLoading) {
    return (
      <div className="dash-loading-shell" role="status" aria-live="polite">
        <div className="dash-loading-pulse" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
        <p>{copy.loading}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authError) {
      return (
        <div className="dash-loading-shell" role="alert">
          <p>{copy.authError}</p>
          <button type="button" onClick={() => window.location.reload()}>{copy.retry}</button>
        </div>
      );
    }
    return (
      <div className="dash-loading-shell" role="status" aria-live="polite">
        <p>{copy.signInPrompt}</p>
        <div className="dash-loading-actions">
          <button type="button" onClick={() => openAuth("login")}>
            {copy.signIn}
          </button>
          <Link href="/">{copy.home}</Link>
        </div>
      </div>
    );
  }

  // The member dashboard reads member-only data (stays, coupons, searches). A CMS admin has no member session, so the
  // pages are not rendered and never call those endpoints.
  if (isAdmin) {
    const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "/admin", "/admin");
    return (
      <div className="dash-loading-shell" role="status">
        <p>{copy.adminNotice}</p>
        <div className="dash-loading-actions">
          <a href={adminUrl} className="dash-loading-primary">{copy.openAdmin}</a>
          <Link href="/">{copy.home}</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
