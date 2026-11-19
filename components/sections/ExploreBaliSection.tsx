"use client";

import { motion } from "framer-motion";
import DestinationMosaic from "@/components/sections/DestinationMosaic";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./ExploreBaliSection.module.css";

type ExploreBaliSectionProps = {
  collections?: BaliCollectionItem[];
  content?: { title?: string; description?: string; is_visible?: boolean };
};

export default function ExploreBaliSection({ collections = fallbackCollections, content }: ExploreBaliSectionProps) {
  const reduceMotion = usePrefersReducedMotion();
  if (content?.is_visible === false) return null;
  return (
    <section className={styles.section} aria-labelledby="bali-neighbourhood-title" data-neighbourhoods>
      <div className={styles.shell}>
        {/* Same opener and one-time reveal as Guest Stories above. */}
        <motion.header
          className={styles.header}
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(12px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 id="bali-neighbourhood-title">{content?.title || "Bali, by Neighbourhood"}</h2>
          <p>{content?.description || "A closer look at the neighbourhoods, landscapes, and local rhythms around our homes."}</p>
        </motion.header>
        <DestinationMosaic collections={collections} />
      </div>
    </section>
  );
}
