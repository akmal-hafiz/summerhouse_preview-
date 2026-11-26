"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { WISHLIST_COPY } from "@/lib/notifications/guest-messages";
import WishlistCard from "@/components/villas/WishlistCard";
import { coverPhotos, listVillaIds } from "@/components/villas/wishlistCards";
import { useDashboardWishlist } from "./useDashboardWishlist";

type Props = {
  villas: VillaSearchResult[];
  catalogStatus: "ready" | "unavailable";
};

/** The member's wishlists as small cards; each opens that wishlist on Saved villas, where villas are managed. */
export default function DashboardSaved({ villas, catalogStatus }: Props) {
  const { lists, status, retry } = useDashboardWishlist();

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
      ) : lists.length === 0 ? (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">No wishlists yet.</p>
          <p>Tap the heart on a villa to save it. Your wishlists will appear here.</p>
          <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <section aria-label="Your wishlists">
          <div className="dash-section-head dash-section-head--list">
            <h2>{WISHLIST_COPY.wishlistCount(lists.length)}</h2>
            <Link href="/saved-villas">Open Saved villas <FiArrowRight aria-hidden="true" /></Link>
          </div>
          {catalogStatus === "unavailable" ? (
            <p className="dash-collection-note dash-collection-note--above" role="status">Villa photos are temporarily unavailable. Your wishlists are safe.</p>
          ) : null}
          <div className="dash-villa-grid dash-villa-grid--all dash-wishlist-grid">
            {lists.map((list) => (
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
        </section>
      )}
    </>
  );
}
