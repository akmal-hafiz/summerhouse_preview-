"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { sessionFetch } from "@/lib/auth-client";
import type { VillaSearchResult } from "@/lib/lodgify";
import { useAuth } from "@/components/providers/AuthProvider";
import WishlistCard from "@/components/villas/WishlistCard";
import { coverPhotos, listVillaIds } from "@/components/villas/wishlistCards";
import { useDashboardWishlist } from "./useDashboardWishlist";
import DashboardRecentSearches from "./DashboardRecentSearches";
import { couponEndLabel, sortCoupons, type MemberCoupon } from "./dashboardFormat";

type Props = {
  villas: VillaSearchResult[];
  catalogStatus: "ready" | "unavailable";
};

type OverviewLine = { href: string; text: string };

/** One compact line for the next offer. A failed or empty source simply shows no line. */
function useOverviewLines() {
  const [offer, setOffer] = useState<OverviewLine | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const read = async <T,>(path: string): Promise<T | null> => {
      try {
        const response = await sessionFetch(path, { signal: controller.signal });
        return response.ok ? await response.json() as T : null;
      } catch { return null; }
    };
    void read<{ coupons?: MemberCoupon[] }>("coupons").then((payload) => {
      if (controller.signal.aborted || !Array.isArray(payload?.coupons) || payload.coupons.length === 0) return;
      const next = sortCoupons(payload.coupons)[0];
      const ends = next.expiresAt ? couponEndLabel(next.expiresAt) : null;
      const count = payload.coupons.length;
      setOffer({ href: "/dashboard/coupons", text: ends ? `Next offer ends ${ends}` : `${count} ${count === 1 ? "offer" : "offers"} for you` });
    });
    return () => controller.abort();
  }, []);

  return offer ? [offer] : [];
}

export default function DashboardOverview({ villas, catalogStatus }: Props) {
  const { user } = useAuth();
  const { lists, status, retry } = useDashboardWishlist();
  const firstName = user?.name.trim().split(/\s+/)[0] || "Guest";
  const lines = useOverviewLines();
  const villaNames = useMemo(() => new Map(villas.map((villa) => [String(villa.id), villa.name])), [villas]);

  return (
    <>
      <header className="dash-page-intro">
        <h1>Welcome back, {firstName}</h1>
        <p>Your saved villas, ready whenever you are.</p>
        {lines.length > 0 && (
          <ul className="dash-overview-lines">
            {lines.map((line) => (
              <li key={line.href}><Link href={line.href}>{line.text}<FiArrowRight aria-hidden="true" /></Link></li>
            ))}
          </ul>
        )}
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
          {status === "ready" && lists.length > 0 && (
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
        ) : lists.length === 0 ? (
          <div className="dash-empty-state">
            <p className="dash-empty-state-title">No wishlists yet.</p>
            <p>Tap the heart on a villa to save it. Your wishlists will appear here.</p>
            <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
          </div>
        ) : (
          <>
            {catalogStatus === "unavailable" ? (
              <p className="dash-collection-note dash-collection-note--above" role="status">Villa photos are temporarily unavailable. Your wishlists are safe.</p>
            ) : null}
            {/* The three most recently used wishlists, the same cards as the Saved page (spec: dashboard Saved section). */}
            <div className="dash-villa-grid dash-wishlist-grid">
              {lists.slice(0, 3).map((list) => (
                <WishlistCard
                  key={list.id}
                  list={list}
                  photos={coverPhotos(listVillaIds(list), villas)}
                  href={`/saved-villas?list=${list.id}`}
                  compact
                  headingLevel="h3"
                />
              ))}
            </div>
          </>
        )}

      </section>

      <DashboardRecentSearches villaNames={villaNames} />
    </>
  );
}
