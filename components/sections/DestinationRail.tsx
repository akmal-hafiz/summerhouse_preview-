"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { BaliCollectionItem } from "@/data/baliCollections";
import styles from "./DestinationRail.module.css";

type DestinationRailProps = {
  collections: BaliCollectionItem[];
};

const easeReveal = [0.22, 1, 0.36, 1] as const;

/**
 * Korda-style persistent-active media rail.
 *
 * A single centred flex row of fixed-height cards with sharp corners. Hover /
 * focus / tap promotes a card to active: it scales ~2x symmetrically about the
 * strip's centreline, its neighbours are pushed outward (the row simply reflows
 * and re-centres), and its title + description reveal just underneath. There is
 * always exactly one active card; leaving the rail keeps the last one.
 */
export default function DestinationRail({ collections }: DestinationRailProps) {
  const items = collections;
  const count = items.length;
  const defaultIndex = Math.floor(count / 2);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const prefersReduced = usePrefersReducedMotion();

  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const safeActive = Math.min(activeIndex, count - 1);

  const activate = useCallback((index: number) => setActiveIndex(index), []);

  // Keep the active card in view when the rail overflows (mobile / tablet).
  // block: "nearest" prevents the page from scrolling vertically.
  useEffect(() => {
    const el = cardRefs.current[safeActive];
    const rail = railRef.current;
    if (!el || !rail) return;
    if (rail.scrollWidth <= rail.clientWidth + 4) return;
    el.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [safeActive, prefersReduced]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(count - 1, i + 1));
      }
    },
    [count],
  );

  const active = items[safeActive];

  if (count === 0) return null;

  return (
    <div className={styles.stage}>
      <div
        ref={railRef}
        className={styles.rail}
        role="tablist"
        aria-label="Bali destinations"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => {
          const isActive = index === safeActive;
          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.card}
              data-active={isActive ? "true" : "false"}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${item.location} — ${item.tag}`}
                className={styles.cardButton}
                onMouseEnter={() => activate(index)}
                onFocus={() => activate(index)}
                onClick={() => activate(index)}
              >
                <span className={styles.media}>
                  <Image
                    src={item.image}
                    alt={isActive ? item.imageAlt : ""}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 60vw"
                    className={styles.photo}
                    draggable={false}
                  />
                </span>

                {/* Two diagonal viewfinder ticks, outside the active card */}
                <span className={styles.tickTR} aria-hidden="true" />
                <span className={styles.tickBL} aria-hidden="true" />
              </button>

              {/* Title + description, anchored beneath the active card only */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    key={item.id}
                    className={styles.caption}
                    initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={
                      prefersReduced
                        ? { duration: 0 }
                        : { duration: 0.28, ease: easeReveal, delay: 0.1 }
                    }
                  >
                    <Link href={item.href} className={styles.captionLink} draggable={false}>
                      <p className={styles.captionTitle}>{item.location}</p>
                      <p className={styles.captionDesc}>{item.description}</p>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Caption for scrollable breakpoints (tablet / mobile), where the rail
          clips vertically. Sits below the strip and follows the active item. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          className={styles.captionOuter}
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.28, ease: easeReveal }}
        >
          <Link href={active.href} className={styles.captionLink} draggable={false}>
            <p className={styles.captionTitle}>{active.location}</p>
            <p className={styles.captionDesc}>{active.description}</p>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Crawler / screen-reader list, unaffected by the active state. */}
      <ul className={styles.srList}>
        {items.map((item) => (
          <li key={`sr-${item.id}`}>
            <Link href={item.href}>
              <strong>{item.location}</strong> — {item.description}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
