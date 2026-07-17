"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiX, FiArrowRight, FiCalendar } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { readSavedVillaIds, subscribeSavedVillas, toggleSavedVillaId } from "@/components/villas/savedVillas";
import DashboardVillaThumb from "./DashboardVillaThumb";

type DashboardSavedProps = {
  villas: VillaSearchResult[];
};

function formatDateID(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function DashboardSaved({ villas }: DashboardSavedProps) {
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

  const today = formatDateID(new Date());

  const handleRemove = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSavedVillaId(id);
  };

  return (
    <>
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <h1 className="dash-hero-title">Villa di shortlist</h1>
          <p>Daftar villa yang kamu simpan. Klik untuk lihat detail atau hapus dari daftar.</p>
        </div>
        <span className="dash-date-pill">
          {today}
          <span className="dash-date-pill-icon"><FiCalendar aria-hidden="true" /></span>
        </span>
      </section>

      <section className="dash-block">
        <header className="dash-block-head">
          <div>
            <h2>{isReady ? `${savedVillas.length} villa` : "—"}</h2>
          </div>
          <span className="dash-block-head-meta">terurut dari penambahan terbaru</span>
        </header>

        {!isReady ? (
          <div className="dash-empty"><p>Memuat shortlist...</p></div>
        ) : savedVillas.length === 0 ? (
          <div className="dash-empty">
            <p>Belum ada villa tersimpan. Klik ikon hati di halaman villa untuk menambahkan.</p>
            <Link href="/villas">Jelajah villa</Link>
          </div>
        ) : (
          <div className="dash-saved-list">
            {savedVillas.map((villa) => (
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
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, villa.id)}
                  className="dash-saved-action dash-saved-action--danger"
                  aria-label={`Hapus ${villa.name ?? "villa"} dari shortlist`}
                  title="Hapus dari shortlist"
                >
                  <FiX aria-hidden="true" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
