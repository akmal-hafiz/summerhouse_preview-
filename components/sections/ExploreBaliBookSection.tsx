"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ExploreBaliMobileCarousel from "@/components/sections/ExploreBaliMobileCarousel";

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

export default function ExploreBaliBookSection({ staticFallback = false }: { staticFallback?: boolean }) {
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
            <BaliFlipBook />
            <p className="bali-book-instruction">Turn the pages and explore Bali.</p>
          </div>
        ) : (
          <ExploreBaliMobileCarousel />
        )}
      </div>
    </section>
  );
}
