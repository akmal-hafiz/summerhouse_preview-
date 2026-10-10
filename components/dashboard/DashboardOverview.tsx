"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardVillaThumb from "./DashboardVillaThumb";
import { useDashboardWishlist } from "./useDashboardWishlist";

type Props = {
  villas: VillaSearchResult[];
  catalogStatus: "ready" | "unavailable";
};

export default function DashboardOverview({ villas, catalogStatus }: Props) {
  const { user } = useAuth();
  const { ids, status, mutationError, retry } = useDashboardWishlist();
  const byId = new Map(villas.map((villa) => [String(villa.id), villa]));
  const saved = ids.map((id) => byId.get(id)).filter((villa): villa is VillaSearchResult => Boolean(villa));
  const hiddenCount = ids.length - saved.length;
  const firstName = user?.name.trim().split(/\s+/)[0] || "Guest";

  return (
    <>
      <header className="dash-page-intro">
        <h1>Welcome back, {firstName}</h1>
        <p>Your saved villas, ready whenever you are.</p>
      </header>

      <section className="dash-discovery" aria-label="Discover Summerhouses villas">
        <img src="/homepage_villa/curated-1-main.webp" alt="A quiet villa lounge beside a pool" />
        <div className="dash-discovery-content">
          <p>YOUR NEXT STAY</p>
          <h2>Find a place<br />to call your own.</h2>
          <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="dash-saved-section" aria-labelledby="dash-saved-title">
        <div className="dash-section-head">
          <div>
            <h2 id="dash-saved-title">Saved villas</h2>
            <p>Homes you would like to return to.</p>
          </div>
          {status === "ready" && ids.length > 0 && (
            <Link href="/dashboard/saved">View all <FiArrowRight aria-hidden="true" /></Link>
          )}
        </div>

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
          <div className="dash-empty-state">
            <p className="dash-empty-state-title">Your shortlist starts here.</p>
            <p>Save the villas that feel right for your Bali stay. They will appear here when you return.</p>
            <Link href="/villas">Browse villas <FiArrowRight aria-hidden="true" /></Link>
          </div>
        ) : (
          <>
            {saved.length > 0 && (
              <div className="dash-villa-grid">
                {saved.slice(0, 3).map((villa) => (
                  <Link href={`/villas/${villa.id}`} className="dash-villa-card" key={villa.id}>
                    <span className="dash-villa-image"><DashboardVillaThumb src={villa.imageUrl} alt={villa.name} /></span>
                    <span className="dash-villa-name">{villa.name}</span>
                    <span className="dash-villa-location">{villa.location || "Bali"}</span>
                  </Link>
                ))}
              </div>
            )}
            {hiddenCount > 0 && (
              <p className="dash-collection-note">
                {hiddenCount} saved {hiddenCount === 1 ? "villa is" : "villas are"} not in the current collection.
                <Link href="/dashboard/saved"> Review your shortlist</Link>
              </p>
            )}
          </>
        )}

        {mutationError && status === "ready" && (
          <p className="dash-action-error" role="alert">A shortlist change could not be saved. Please try again.</p>
        )}
      </section>
    </>
  );
}
