"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

type DashboardGuardProps = {
  children: ReactNode;
};

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const { openAuth } = useAuthModal();

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
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authError) {
      return (
        <div className="dash-loading-shell" role="alert">
          <p>Kami belum bisa memeriksa sesi akun Anda. Coba lagi sebentar.</p>
          <button type="button" onClick={() => window.location.reload()}>Coba lagi</button>
        </div>
      );
    }
    return (
      <div className="dash-loading-shell" role="status" aria-live="polite">
        <p>Masuk untuk membuka dashboard.</p>
        <div className="dash-loading-actions">
          <button type="button" onClick={() => openAuth("login")}>
            Masuk ke akun
          </button>
          <Link href="/">Kembali ke beranda</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
