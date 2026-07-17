"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { CmsGalleryItem } from "@/lib/cms";
import { useGalleryEntries, type GalleryEntry } from "./useGalleryEntries";
import EditorialGrid from "./EditorialGrid";
import GalleryLightbox from "./GalleryLightbox";
import styles from "./GalleryPage.module.css";

type GalleryPageProps = {
  items?: CmsGalleryItem[] | null;
};

const ALL = "__all__";

export default function GalleryPage({ items: itemsProp }: GalleryPageProps = {}) {
  const entries = useGalleryEntries(itemsProp);
  const prefersReduced = usePrefersReducedMotion();

  const [category, setCategory] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<{ list: GalleryEntry[]; index: number } | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Category tabs, in first-appearance order so the CMS sort_order drives the row.
  const categories = useMemo(() => {
    const seen: string[] = [];
    entries.forEach((entry) => {
      if (entry.category && !seen.includes(entry.category)) seen.push(entry.category);
    });
    return seen;
  }, [entries]);

  const activeCategory = category !== ALL && categories.includes(category) ? category : ALL;

  const filtered = useMemo(
    () => entries.filter((entry) => activeCategory === ALL || entry.category === activeCategory),
    [entries, activeCategory],
  );

  const openFrom = useCallback(
    (entry: GalleryEntry, trigger: HTMLElement | null) => {
      returnFocusRef.current = trigger;
      const index = filtered.findIndex((candidate) => candidate.id === entry.id);
      if (index >= 0) setLightbox({ list: filtered, index });
    },
    [filtered],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const navigateLightbox = useCallback(
    (index: number) => setLightbox((prev) => (prev ? { ...prev, index } : prev)),
    [],
  );

  const tabs = [{ key: ALL, label: "All" }, ...categories.map((c) => ({ key: c, label: c }))];

  return (
    <div className={styles.galleryPage}>
      <header className={styles.pageHeader}>
        <h1 className={styles.headline}>Selected Projects.</h1>
        <p className={styles.lede}>
          A curated look at the spaces Summerhouse Bali has designed, renovated, and
          transformed.
        </p>
      </header>

      {tabs.length > 1 && (
        <div className={styles.tabStrip}>
          <div className={styles.tabRow} role="tablist" aria-label="Filter gallery by category">
            {tabs.map((tab) => {
              const isActive = tab.key === activeCategory;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={styles.tab}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => setCategory(tab.key)}
                >
                  {tab.label}
                  {isActive &&
                    (prefersReduced ? (
                      <span className={styles.tabUnderline} aria-hidden="true" />
                    ) : (
                      <motion.span
                        layoutId="gallery-tab-underline"
                        className={styles.tabUnderline}
                        aria-hidden="true"
                        transition={{ type: "spring", stiffness: 520, damping: 40 }}
                      />
                    ))}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <section className={styles.gridSection} aria-label="Gallery">
          <EditorialGrid
            key={activeCategory}
            entries={filtered}
            onOpen={openFrom}
            reducedMotion={prefersReduced}
          />
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p>Nothing here yet — try another category.</p>
          <button type="button" onClick={() => setCategory(ALL)}>
            Show everything
          </button>
        </div>
      )}

      <GalleryLightbox
        entries={lightbox?.list ?? []}
        index={lightbox?.index ?? null}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
        returnFocusRef={returnFocusRef}
      />

      {/* Crawler/screen-reader friendly list of every entry, unaffected by filters. */}
      <ul className={styles.srOnlyList}>
        {entries.map((entry) => (
          <li key={`sr-${entry.id}`}>
            <strong>{entry.title}</strong>
            {" — "}
            {entry.story} ({entry.alt})
          </li>
        ))}
      </ul>
    </div>
  );
}
