"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VillaSearchResult } from "@/lib/lodgify";
import PremiumVillaCard from "./PremiumVillaCard";
import { readSavedVillaIds, subscribeSavedVillas } from "./savedVillas";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

type SavedVillasClientProps = {
  villas: VillaSearchResult[];
};

export default function SavedVillasClient({ villas }: SavedVillasClientProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, wishlistStatus, refreshWishlist } = useAuth();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    setSavedIds(readSavedVillaIds());
    setIsReady(true);
    return subscribeSavedVillas(({ ids }) => setSavedIds(ids));
  }, []);

  const savedVillas = useMemo(() => {
    const savedSet = new Set(savedIds);
    return villas.filter((villa) => savedSet.has(String(villa.id)));
  }, [savedIds, villas]);

  if (!isReady || isLoading) {
    return (
      <div className="villa-saved-empty">
        <p>Loading your saved villas...</p>
      </div>
    );
  }

  if (!isAuthenticated && savedVillas.length === 0) {
    return (
      <div className="villa-saved-empty">
        <p>Sign in to see the villas you have saved for later.</p>
        <button type="button" onClick={() => openAuth("login")}>Sign in</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    // A guest's saves from this tab: show them, and say plainly where they live until sign-in.
    return (
      <>
        <div className="villa-saved-guest-note">
          <p>These villas are saved in this browser for now. Sign in to keep them on every device.</p>
          <button type="button" onClick={() => openAuth("login")}>Sign in</button>
        </div>
        <div className="villa-collection-grid villa-saved-grid">
          {savedVillas.map((villa, index) => (
            <PremiumVillaCard key={villa.id} villa={villa} priority={index < 2} initialSaved />
          ))}
        </div>
      </>
    );
  }

  if (wishlistStatus === "loading") {
    return <div className="villa-saved-empty" role="status"><p>Loading your saved villas...</p></div>;
  }

  if (wishlistStatus === "error") {
    return (
      <div className="villa-saved-empty" role="alert">
        <p>We could not load your saved villas. Your choices have not been changed.</p>
        <button type="button" onClick={() => void refreshWishlist()}>Try again</button>
      </div>
    );
  }

  if (savedVillas.length === 0) {
    return (
      <div className="villa-saved-empty">
        <p>You have not saved any villas yet. Explore the collection and tap the heart on villas you want to review later.</p>
        <Link href="/villas">Explore villas</Link>
      </div>
    );
  }

  return (
    <div className="villa-collection-grid villa-saved-grid">
      {savedVillas.map((villa, index) => (
        <PremiumVillaCard
          key={villa.id}
          villa={villa}
          priority={index < 2}
          initialSaved
          onSavedChange={(villaId, saved) => {
            if (!saved) setSavedIds((current) => current.filter((id) => id !== villaId));
          }}
        />
      ))}
    </div>
  );
}
