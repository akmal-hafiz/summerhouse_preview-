"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ExploreBaliMobileCarousel from "@/components/sections/ExploreBaliMobileCarousel";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";

const BaliFlipBook = dynamic(() => import("@/components/three/BaliFlipBook"), {
  ssr: false,
  loading: () => (
    <div className="bali-book-canvas-skeleton" aria-hidden="true">
      <div className="bali-book-loading-container">
        <div className="bali-book-loading-spinner" />
        <span className="bali-book-loading-text">Loading Destination Guide...</span>
        <span className="bali-book-loading-subtext">Please wait</span>
      </div>
    </div>
  ),
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

function useWebGLAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
        (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

      if (!gl) {
        setAvailable(false);
        return;
      }

      const loseExt = gl.getExtension("WEBGL_lose_context");
      loseExt?.loseContext();
      setAvailable(true);
    } catch {
      setAvailable(false);
    }
  }, []);

  return available;
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
  const webglOk = useWebGLAvailable();
  const useFlipBook = isDesktop && !staticFallback && webglOk !== false;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Keyboard navigation for turning book pages
  useEffect(() => {
    if (!useFlipBook) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPage((p) => Math.max(0, p - 1));
      } else if (e.key === "ArrowRight") {
        setPage((p) => Math.min(totalPages || collections.length + 1, p + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [useFlipBook, totalPages, collections.length]);

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

        {useFlipBook ? (
          <motion.div 
            className="bali-book-desktop" 
            aria-label="Interactive Bali destination flip book"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <BaliFlipBook 
              collections={collections}
              page={page}
              setPage={setPage}
              onTotalPagesDetected={setTotalPages}
            />

            {/* FLOATING CONTROL DECK */}
            <div className="bali-book-control-deck">
              <div className="bali-book-nav-group">
                <button 
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="bali-book-nav-btn prev"
                  aria-label="Previous page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                
                <div className="bali-book-page-indicator">
                  <span className="current-page">
                    {page === 0 ? "Cover" : page === totalPages ? "End" : String(page).padStart(2, "0")}
                  </span>
                  <span className="page-separator">/</span>
                  <span className="total-pages">
                    {totalPages ? String(totalPages).padStart(2, "0") : "--"}
                  </span>
                </div>

                <button 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="bali-book-nav-btn next"
                  aria-label="Next page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              <div className="bali-book-deck-divider"></div>

              {/* QUICK JUMP DROPDOWN */}
              <div className="bali-book-toc-wrapper">
                <select
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="bali-book-toc-select"
                  aria-label="Jump to destination"
                >
                  <option value={0}>Journal Cover</option>
                  {collections.map((item, index) => (
                    <option key={item.id} value={index + 1}>
                      {index + 1}. {item.location}
                    </option>
                  ))}
                  {totalPages > 0 && <option value={totalPages}>Back Cover</option>}
                </select>
                <div className="bali-book-toc-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <div className="bali-book-deck-divider"></div>

              {/* EXPLORE CTA */}
              <Link 
                className="bali-book-deck-cta" 
                href={
                  page === 0 || page === totalPages
                    ? "/villas"
                    : (collections[page - 1]?.href || "/villas")
                }
              >
                <span>
                  {page === 0 || page === totalPages
                    ? "Explore All Villas"
                    : `Explore ${collections[page - 1]?.location || "Villas"}`}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>

            <p className="bali-book-instruction">Turn pages using clicks, arrows, or control deck.</p>
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
