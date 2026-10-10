"use client";

import { motion } from "framer-motion";

import DestinationRail from "@/components/sections/DestinationRail";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";

type ExploreBaliSectionProps = {
  collections?: BaliCollectionItem[];
  content?: {
    kicker?: string;
    title?: string;
    description?: string;
    is_visible?: boolean;
  };
};

export default function ExploreBaliSection({
  collections = fallbackCollections,
  content,
}: ExploreBaliSectionProps) {
  if (content?.is_visible === false) return null;

  const sectionTitle = content?.title || "Bali, by Neighbourhood";
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
            <h2 className="bali-collection-stacked-title">{sectionTitle}</h2>
            <span className="bali-collection-title-rule" aria-hidden="true" />
          </div>
          <div className="bali-collection-intro-group">
            <p className="bali-collection-desc">
              {content?.description ||
                "A closer look at the neighbourhoods, landscapes, and local rhythms around our homes."}
            </p>
            <span className="bali-collection-intro-rule" aria-hidden="true" />
            <span className="bali-collection-monogram" aria-hidden="true">O</span>
          </div>
        </motion.div>

        <div>
          <DestinationRail collections={collections} />
        </div>
      </div>
    </section>
  );
}
