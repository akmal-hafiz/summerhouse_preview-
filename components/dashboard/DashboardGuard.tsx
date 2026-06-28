"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

type DashboardGuardProps = {
  children: ReactNode;
};

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, router]);

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
    return (
      <div className="dash-loading-shell">
        <p>Mengalihkan ke halaman masuk...</p>
      </div>
    );
  }

  return <>{children}</>;
}
