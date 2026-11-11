"use client";

import DestinationMosaic from "@/components/sections/DestinationMosaic";
import { baliCollections as fallbackCollections, type BaliCollectionItem } from "@/data/baliCollections";
import styles from "./ExploreBaliSection.module.css";

type ExploreBaliSectionProps = {
  collections?: BaliCollectionItem[];
  content?: { title?: string; description?: string; is_visible?: boolean };
};

export default function ExploreBaliSection({ collections = fallbackCollections, content }: ExploreBaliSectionProps) {
  if (content?.is_visible === false) return null;
  return (
    <section className={styles.section} aria-labelledby="bali-neighbourhood-title" data-neighbourhoods>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h2 id="bali-neighbourhood-title">{content?.title || "Bali, by Neighbourhood"}</h2>
          <p>{content?.description || "A closer look at the neighbourhoods, landscapes, and local rhythms around our homes."}</p>
        </header>
        <DestinationMosaic collections={collections} />
      </div>
    </section>
  );
}
