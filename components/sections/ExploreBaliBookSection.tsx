"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
        <motion.div 
          className="bali-collection-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>

        {isDesktop && !staticFallback ? (
          <motion.div 
            className="bali-book-desktop" 
            aria-label="Interactive Bali destination flip book"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <BaliFlipBook collections={collections} />
            <p className="bali-book-instruction">Turn the pages and explore Bali.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ExploreBaliMobileCarousel collections={collections} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
