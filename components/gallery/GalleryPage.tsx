"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { CmsGalleryItem } from "@/lib/cms";
import { useGalleryEntries, type GalleryEntry } from "./useGalleryEntries";
import EditorialGrid from "./EditorialGrid";
import GalleryLightbox from "./GalleryLightbox";
import EditorialPageIntro from "@/components/common/EditorialPageIntro";
import styles from "./GalleryPage.module.css";

type GalleryPageProps = {
  items?: CmsGalleryItem[] | null;
  content?: Record<string, unknown> | null;
};

const ALL = "__all__";

export default function GalleryPage({ items: itemsProp, content }: GalleryPageProps = {}) {
  const entries = useGalleryEntries(itemsProp);
  const prefersReduced = usePrefersReducedMotion();

  const [category, setCategory] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<{ list: GalleryEntry[]; index: number } | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Category tabs in the order of the CMS gallery collections (first appearance when no order is known), with counts.
  const { categories, counts } = useMemo(() => {
    const seen = new Map<string, { order: string; count: number }>();
    entries.forEach((entry) => {
      if (!entry.category) return;
      const current = seen.get(entry.category);
      if (current) current.count += 1;
      else seen.set(entry.category, { order: entry.categoryOrder ?? "￿", count: 1 });
    });
    const sorted = [...seen.entries()].sort((a, b) => (a[1].order < b[1].order ? -1 : a[1].order > b[1].order ? 1 : 0));
    return { categories: sorted.map(([name]) => name), counts: new Map(sorted.map(([name, value]) => [name, value.count])) };
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

  const tabs = [{ key: ALL, label: "All", count: entries.length }, ...categories.map((c) => ({ key: c, label: c, count: counts.get(c) ?? 0 }))];
  const heading = typeof content?.heading === "string" && content.heading.trim()
    ? content.heading
    : "A closer look at Summerhouse.";
  const descriptionValue = content?.description ?? content?.subheading;
  const description = typeof descriptionValue === "string" && descriptionValue.trim()
    ? descriptionValue.trim()
    : "Villas, quiet interiors, island light, and the moments that make a stay feel personal.";
  const showFilters = content?.show_filters !== false;

  return (
    <div className={styles.galleryPage}>
      {content?.is_visible !== false ? <EditorialPageIntro
        id="gallery-intro"
        title={heading}
        summary={description}
        titleLines={heading === "A closer look at Summerhouse." ? ["A closer", "look at", "Summerhouse."] : undefined}
      /> : null}

      {showFilters && tabs.length > 1 && (
        <div className={styles.tabStrip}>
          <div className={styles.tabRow} role="group" aria-label="Filter gallery by collection">
            {tabs.map((tab) => {
              const isActive = tab.key === activeCategory;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${tab.label}, ${tab.count} ${tab.count === 1 ? "item" : "items"}`}
                  className={styles.tab}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => setCategory(tab.key)}
                >
                  {tab.label}
                  <span className={styles.tabCount}>{tab.count}</span>
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
          <p>Nothing here yet. Try another category.</p>
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
            {". "}
            {entry.story} ({entry.alt})
          </li>
        ))}
      </ul>
    </div>
  );
}
