"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
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

  // Only signed-in members save villas (owner decision 2026-11-19).
  if (!isAuthenticated) {
    return (
      <div className="villa-saved-empty">
        <p>Sign in to see the villas you have saved for later.</p>
        <button type="button" onClick={() => openAuth("login")}>Sign in</button>
      </div>
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
    <SavedGrid villas={savedVillas} onRemoved={(villaId) => setSavedIds((current) => current.filter((id) => id !== villaId))} />
  );
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * The saved cards. Removing a heart lets that card fade and settle away (fast, it is the system answering) while the
 * cards after it slide into its place, so the grid never jumps. Reduced motion keeps only the fade.
 */
function SavedGrid({ villas, onRemoved }: { villas: VillaSearchResult[]; onRemoved: (villaId: string) => void }) {
  const reduce = usePrefersReducedMotion();
  return (
    <div className="villa-collection-grid villa-saved-grid">
      <AnimatePresence initial={false} mode="popLayout">
        {villas.map((villa, index) => (
          <motion.div
            key={villa.id}
            className="villa-saved-item"
            layout={!reduce}
            exit={reduce ? { opacity: 0, transition: { duration: 0.15 } }
              : { opacity: 0, transform: "scale(0.96)", filter: "blur(4px)", transition: { duration: 0.2, ease: EASE_OUT } }}
            transition={{ layout: { duration: 0.32, ease: EASE_IN_OUT } }}
          >
            <PremiumVillaCard
              villa={villa}
              priority={index < 2}
              initialSaved
              onSavedChange={(villaId, saved) => { if (!saved) onRemoved(villaId); }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
