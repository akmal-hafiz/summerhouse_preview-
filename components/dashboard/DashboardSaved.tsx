"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { removeSavedVillaId } from "@/components/villas/savedVillas";
import DashboardVillaThumb from "./DashboardVillaThumb";
import { useDashboardWishlist } from "./useDashboardWishlist";

type Props = {
  villas: VillaSearchResult[];
  catalogStatus: "ready" | "unavailable";
};

export default function DashboardSaved({ villas, catalogStatus }: Props) {
  const { ids, status, retry } = useDashboardWishlist();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState(false);
  const byId = new Map(villas.map((villa) => [String(villa.id), villa]));

  const remove = async (id: string) => {
    setRemoveError(false);
    setRemovingId(id);
    const success = await removeSavedVillaId(id).catch(() => false);
    setRemovingId(null);
    if (!success) setRemoveError(true);
  };

  return (
    <>
      <header className="dash-page-intro dash-page-intro--inner">
        <Link href="/dashboard" className="dash-back-link">Account overview</Link>
        <h1>Saved villas</h1>
        <p>A quiet place for the homes you would like to revisit.</p>
      </header>

      {status === "loading" ? (
        <div className="dash-inline-state" role="status">Loading your saved villas...</div>
      ) : status === "error" ? (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>We could not load your saved villas. Your shortlist has not been changed.</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      ) : catalogStatus === "unavailable" ? (
        <div className="dash-inline-state dash-inline-state--alert" role="status">
          <p>Villa details are temporarily unavailable. Your saved choices are still in your account.</p>
          <button type="button" onClick={() => window.location.reload()}>Refresh page</button>
        </div>
      ) : ids.length === 0 ? (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">No villas saved yet.</p>
          <p>Explore the collection and save the places you would like to return to.</p>
          <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <section aria-label="Your saved villas">
          <div className="dash-section-head dash-section-head--list">
            <h2>{ids.length} {ids.length === 1 ? "villa" : "villas"} in your shortlist</h2>
            <Link href="/villas">Explore more <FiArrowRight aria-hidden="true" /></Link>
          </div>
          {removeError && <p className="dash-action-error" role="alert">The villa could not be removed. Please try again.</p>}
          <div className="dash-villa-grid dash-villa-grid--all">
            {ids.map((id) => {
              const villa = byId.get(id);
              return (
                <article className={`dash-villa-card${villa ? "" : " dash-villa-card--unavailable"}`} key={id}>
                  {villa ? (
                    <Link href={`/villas/${villa.id}`} className="dash-villa-card-link">
                      <span className="dash-villa-image"><DashboardVillaThumb src={villa.imageUrl} alt={villa.name} /></span>
                      <span className="dash-villa-name">{villa.name}</span>
                      <span className="dash-villa-location">{villa.location || "Bali"}</span>
                    </Link>
                  ) : (
                    <div className="dash-villa-card-link">
                      <span className="dash-villa-image dash-villa-image--unavailable" aria-hidden="true" />
                      <span className="dash-villa-name">No longer in our current collection</span>
                      <span className="dash-villa-location">Saved villa reference #{id}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="dash-villa-remove"
                    aria-label={`Remove ${villa?.name || `villa ${id}`} from saved villas`}
                    onClick={() => void remove(id)}
                    disabled={removingId !== null}
                  >
                    <FiX aria-hidden="true" />
                    <span>{removingId === id ? "Removing..." : "Remove"}</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
