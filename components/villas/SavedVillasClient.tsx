"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VillaSearchResult } from "@/lib/lodgify";
import PremiumVillaCard from "./PremiumVillaCard";
import { readSavedVillaIds, subscribeSavedVillas } from "./savedVillas";

type SavedVillasClientProps = {
  villas: VillaSearchResult[];
};

export default function SavedVillasClient({ villas }: SavedVillasClientProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSavedIds(readSavedVillaIds());
    setIsReady(true);
    return subscribeSavedVillas(({ ids }) => setSavedIds(ids));
  }, []);

  const savedVillas = useMemo(() => {
    const savedSet = new Set(savedIds);
    return villas.filter((villa) => savedSet.has(String(villa.id)));
  }, [savedIds, villas]);

  if (!isReady) {
    return (
      <div className="villa-saved-empty">
        <p>Loading your saved villas...</p>
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
