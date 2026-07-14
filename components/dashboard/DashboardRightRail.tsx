"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiHeart, FiArrowUpRight } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { useAuth } from "@/components/providers/AuthProvider";
import { readSavedVillaIds, subscribeSavedVillas } from "@/components/villas/savedVillas";
import ConciergeCard from "./ConciergeCard";
import DashboardVillaThumb from "./DashboardVillaThumb";

type DashboardRightRailProps = {
  villas: VillaSearchResult[];
};

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "S";
}

const PROFILE_ACTIONS = [
  { href: "/dashboard/settings", label: "Edit profile", icon: <FiEdit2 aria-hidden="true" /> },
  { href: "/dashboard/saved", label: "Saved villas", icon: <FiHeart aria-hidden="true" /> },
  { href: "/villas", label: "Browse villas", icon: <FiArrowUpRight aria-hidden="true" /> },
] as const;

export default function DashboardRightRail({ villas }: DashboardRightRailProps) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(readSavedVillaIds());
    return subscribeSavedVillas(({ ids }) => setSavedIds(ids));
  }, []);

  const recentSaved = useMemo(() => {
    const set = new Set(savedIds);
    return villas.filter((v) => set.has(String(v.id))).slice(0, 4);
  }, [savedIds, villas]);

  return (
    <aside className="dash-rail" aria-label="Account snapshot">
      {/* Profile card */}
      <div className="dash-profile-card">
        <div className="dash-profile-avatar" aria-hidden="true">
          {user ? initialsFrom(user.name) : "S"}
          <span className="dash-profile-avatar-dot" />
        </div>
        <p className="dash-profile-name">{user?.name ?? "Guest"}</p>
        <p className="dash-profile-email">{user?.email ?? ""}</p>
        <div className="dash-profile-actions" role="group" aria-label="Account quick actions">
          {PROFILE_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="dash-profile-action"
              aria-label={action.label}
              title={action.label}
              data-tooltip={action.label}
            >
              {action.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Signature: concierge card */}
      <ConciergeCard />

      {/* Recently saved compact list */}
      <div className="dash-rail-card">
        <div className="dash-rail-card-head">
          <h3>Baru disimpan</h3>
          {recentSaved.length > 0 && (
            <Link href="/dashboard/saved" className="dash-rail-card-head-link">
              Lihat semua
            </Link>
          )}
        </div>
        {recentSaved.length === 0 ? (
          <p className="dash-rail-empty">Belum ada villa tersimpan.</p>
        ) : (
          <div className="dash-recent-list">
            {recentSaved.map((villa) => (
              <Link key={villa.id} href={`/villas/${villa.id}`} className="dash-recent-item">
                <div className="dash-recent-thumb">
                  <DashboardVillaThumb src={villa.imageUrl} alt={villa.name ?? ""} />
                </div>
                <div className="dash-recent-body">
                  <p className="dash-recent-name">{villa.name ?? "Untitled"}</p>
                  {villa.location && <p className="dash-recent-meta">{villa.location}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
