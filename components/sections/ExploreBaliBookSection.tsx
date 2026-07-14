"use client";

import { motion } from "framer-motion";

import DestinationRail from "@/components/sections/DestinationRail";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";

type ExploreBaliBookSectionProps = {
  /** Kept for API compatibility with existing homepage callers; the rail is
      responsive on its own and no longer needs a static variant. */
  staticFallback?: boolean;
  collections?: BaliCollectionItem[];
};

export default function ExploreBaliBookSection({
  collections = fallbackCollections,
}: ExploreBaliBookSectionProps) {
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <DestinationRail collections={collections} />
        </motion.div>
      </div>
    </section>
  );
}
