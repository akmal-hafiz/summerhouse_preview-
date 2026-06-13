"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ExploreBaliMobileCarousel from "@/components/sections/ExploreBaliMobileCarousel";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";

const BaliFlipBook = dynamic(() => import("@/components/three/BaliFlipBook"), {
  ssr: false,
  loading: () => <div className="bali-book-canvas-skeleton" aria-hidden="true" />,
});

function useDesktopCanvas() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateMatch = () => setIsDesktop(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return isDesktop;
}

type ExploreBaliBookSectionProps = {
  staticFallback?: boolean;
  collections?: BaliCollectionItem[];
};

export default function ExploreBaliBookSection({
  staticFallback = false,
  collections = fallbackCollections,
}: ExploreBaliBookSectionProps) {
  const isDesktop = useDesktopCanvas();

  return (
    <section className="bali-collection-section">
      <div className="bali-collection-shell">
        <div className="bali-collection-header">
          <div className="bali-collection-title-group">
            <span className="bali-collection-kicker">Summerhouses Journal</span>
            <h2 className="bali-collection-stacked-title">
              <span>Bali</span>
              <span>Destination</span>
              <span>Guide</span>
            </h2>
          </div>
          <p className="bali-collection-desc">
            Discover the character of Bali through its most iconic destinations, then find the perfect villa for your stay.
          </p>
        </div>

        {isDesktop && !staticFallback ? (
          <div className="bali-book-desktop" aria-label="Interactive Bali destination flip book">
            <BaliFlipBook collections={collections} />
            <p className="bali-book-instruction">Turn the pages and explore Bali.</p>
          </div>
        ) : (
          <ExploreBaliMobileCarousel collections={collections} />
        )}
      </div>
    </section>
  );
}
