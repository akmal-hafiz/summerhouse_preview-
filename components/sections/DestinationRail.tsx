"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import type { BaliCollectionItem } from "@/data/baliCollections";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { nextCarouselIndex, safeDestinationHref } from "@/lib/destination-carousel";
import styles from "./DestinationRail.module.css";

const SWIPE_THRESHOLD = 48;

export default function DestinationRail({ collections }: { collections: BaliCollectionItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const index = Math.min(activeIndex, Math.max(0, collections.length - 1));
  const active = collections[index];

  const move = useCallback((step: 1 | -1) => {
    if (collections.length < 2) return;
    setDirection(step);
    setActiveIndex((current) => nextCarouselIndex(current, step, collections.length));
  }, [collections.length]);

  const select = useCallback((nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setActiveIndex(nextIndex);
  }, [index]);

  if (!active) return null;

  const image = active.image || active.videoPoster || active.mobilePoster || "/homepage_villa/curated-1-main.webp";
  const duration = reducedMotion ? 0 : 0.48;
  const activeTabId = `destination-tab-${active.id}`;

  return (
    <div
      className={styles.story}
      role="region"
      aria-roledescription="carousel"
      aria-label="Bali neighbourhood destinations"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(event) => {
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const deltaX = event.changedTouches[0].clientX - start.x;
        const deltaY = event.changedTouches[0].clientY - start.y;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          move(deltaX < 0 ? 1 : -1);
        }
      }}
    >
      <nav className={styles.index} role="tablist" aria-label="Choose a Bali neighbourhood">
        {collections.map((collection, collectionIndex) => {
          const selected = collectionIndex === index;
          return (
            <button
              key={collection.id}
              id={`destination-tab-${collection.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="destination-panel"
              className={styles.indexItem}
              data-active={selected ? "true" : "false"}
              onClick={() => select(collectionIndex)}
            >
              <span className={styles.indexNumber}>
                {String(collectionIndex + 1).padStart(2, "0")}
              </span>
              <span className={styles.indexCopy}>
                <strong>{collection.location}</strong>
                <small>{collection.category}</small>
              </span>
            </button>
          );
        })}
      </nav>

      <div
        id="destination-panel"
        className={styles.stage}
        role="tabpanel"
        aria-labelledby={activeTabId}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.imageFrame}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={active.id}
              className={styles.imageLayer}
              custom={direction}
              initial={reducedMotion ? false : { opacity: 0, x: direction * 24, scale: 1.018 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -18, scale: 1.008 }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={image}
                alt={active.imageAlt || `A villa in ${active.location}`}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                quality={78}
                priority={index === 0}
                className={styles.image}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.details}>
          <div className={styles.progress} aria-label={`Destination ${index + 1} of ${collections.length}`}>
            <span>{String(index + 1).padStart(2, "0")} / {String(collections.length).padStart(2, "0")}</span>
            <span className={styles.progressTrack} aria-hidden="true">
              <span style={{ width: `${((index + 1) / collections.length) * 100}%` }} />
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${active.id}-copy`}
              className={styles.copy}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <h3>{active.location}</h3>
              <p>{active.description}</p>
            </motion.div>
          </AnimatePresence>

          <Link href={safeDestinationHref(active.href, active.location)} className={styles.explore}>
            Explore villas <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
