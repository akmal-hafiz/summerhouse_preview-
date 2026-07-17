"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiHeart, FiUser, FiShield, FiCalendar, FiArrowRight } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { useAuth } from "@/components/providers/AuthProvider";
import { readSavedVillaIds, subscribeSavedVillas } from "@/components/villas/savedVillas";
import DashboardVillaThumb from "./DashboardVillaThumb";
import { safeHttpHref } from "@/lib/safe-url";

type DashboardOverviewProps = {
  villas: VillaSearchResult[];
};

function formatDateID(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function DashboardOverview({ villas }: DashboardOverviewProps) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSavedIds(readSavedVillaIds());
    setIsReady(true);
    return subscribeSavedVillas(({ ids }) => setSavedIds(ids));
  }, []);

  const savedVillas = useMemo(() => {
    const set = new Set(savedIds);
    return villas.filter((v) => set.has(String(v.id)));
  }, [savedIds, villas]);

  const firstName = (user?.name ?? "Guest").split(" ")[0];
  const today = formatDateID(new Date());
  const previewVillas = savedVillas.slice(0, 5);
  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin", "/dashboard");

  return (
    <>
      {/* Hero greeting + date pill */}
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <h1 className="dash-hero-title">Halo, {firstName}</h1>
          <p>Villa yang kamu simpan, profil akun, dan kontak concierge.</p>
        </div>
        <span className="dash-date-pill">
          {today}
          <span className="dash-date-pill-icon"><FiCalendar aria-hidden="true" /></span>
        </span>
      </section>

      {/* Stat row */}
      <section className="dash-stats" aria-label="Account snapshot">
        <article className="dash-stat-card">
          <span className="dash-stat-icon-wrap"><FiHeart aria-hidden="true" /></span>
          <div className="dash-stat-body">
            <p className="dash-stat-label">Disimpan</p>
            <p className="dash-stat-value">{isReady ? savedVillas.length : "—"}</p>
            {isReady && savedVillas.length > 0 && (
              <p className="dash-stat-meta">villa di shortlist</p>
            )}
          </div>
        </article>

        <article className="dash-stat-card">
          <span className="dash-stat-icon-wrap"><FiUser aria-hidden="true" /></span>
          <div className="dash-stat-body">
            <p className="dash-stat-label">Akun</p>
            <p className="dash-stat-value" style={{ fontSize: "1rem" }}>{user?.email ?? "—"}</p>
          </div>
        </article>

        <article className="dash-stat-card">
          <span className="dash-stat-icon-wrap"><FiShield aria-hidden="true" /></span>
          <div className="dash-stat-body">
            <p className="dash-stat-label">Status</p>
            <p className="dash-stat-value">{user?.isAdmin ? "Admin" : "Member"}</p>
            <p className="dash-stat-meta">{user?.isAdmin ? "akses CMS aktif" : "akses standar"}</p>
            {user?.isAdmin && (
              <a className="dash-stat-link" href={adminUrl}>
                Buka CMS <FiArrowRight aria-hidden="true" />
              </a>
            )}
          </div>
        </article>
      </section>

      {/* Saved villas list block */}
      <section className="dash-block" aria-labelledby="saved-list-heading">
        <header className="dash-block-head">
          <div>
            <h2 id="saved-list-heading">Villa di shortlist</h2>
          </div>
          {savedVillas.length > 0 && (
            <Link href="/dashboard/saved" className="dash-block-head-link">
              Lihat semua <FiArrowRight aria-hidden="true" />
            </Link>
          )}
        </header>

        {!isReady ? (
          <div className="dash-empty"><p>Memuat shortlist...</p></div>
        ) : previewVillas.length === 0 ? (
          <div className="dash-empty">
            <p>Belum ada villa tersimpan. Klik ikon hati di halaman villa untuk menambahkan.</p>
            <Link href="/villas">Jelajah villa</Link>
          </div>
        ) : (
          <div className="dash-saved-list">
            {previewVillas.map((villa) => (
              <Link key={villa.id} href={`/villas/${villa.id}`} className="dash-saved-row">
                <div className="dash-saved-thumb">
                  <DashboardVillaThumb src={villa.imageUrl} alt={villa.name ?? ""} />
                </div>
                <div>
                  <p className="dash-saved-name">{villa.name ?? "Untitled"}</p>
                  {villa.location && <p className="dash-saved-name-sub">{villa.location}</p>}
                </div>
                {villa.bedrooms != null && (
                  <span className="dash-saved-pill">
                    <span className="dash-saved-pill-dot" />
                    {villa.bedrooms} kamar
                  </span>
                )}
                {villa.priceLabel && (
                  <span className="dash-saved-duration">{villa.priceLabel}</span>
                )}
                <span className="dash-saved-action" aria-hidden="true">
                  <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
