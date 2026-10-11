"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import type { BaliCollectionItem } from "@/data/baliCollections";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { nextCarouselIndex, safeDestinationHref } from "@/lib/destination-carousel";
import styles from "./DestinationRail.module.css";

const SWIPE_THRESHOLD = 48;
const AUTO_ADVANCE_MS = 6000;
const formatLocation = (value: string) => value.replace(/\s+-\s+/g, " – ");

export default function DestinationRail({ collections }: { collections: BaliCollectionItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [touchPaused, setTouchPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [sectionVisible, setSectionVisible] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const indexRail = useRef<HTMLElement>(null);
  const indexItems = useRef<Array<HTMLButtonElement | null>>([]);
  const remainingTime = useRef(AUTO_ADVANCE_MS);
  const timerStartedAt = useRef<number | null>(null);
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

  useEffect(() => {
    const rail = indexRail.current;
    const item = indexItems.current[index];
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth + 1) return;

    const target = item.offsetLeft - Math.max(0, (rail.clientWidth - item.clientWidth) / 2);
    rail.scrollTo({
      left: target,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [index, reducedMotion]);

  useEffect(() => {
    const handleVisibilityChange = () => setPageVisible(document.visibilityState === "visible");
    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story || typeof IntersectionObserver === "undefined") {
      setSectionVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting && entry.intersectionRatio >= 0.18),
      { threshold: [0, 0.18, 0.5] },
    );
    observer.observe(story);
    return () => observer.disconnect();
  }, []);

  const autoNextPaused = touchPaused || !pageVisible || !sectionVisible;

  useEffect(() => {
    remainingTime.current = AUTO_ADVANCE_MS;
    timerStartedAt.current = null;
  }, [index]);

  useEffect(() => {
    if (autoNextPaused || collections.length < 2) return;

    timerStartedAt.current = performance.now();
    const timer = window.setTimeout(() => {
      remainingTime.current = AUTO_ADVANCE_MS;
      timerStartedAt.current = null;
      move(1);
    }, remainingTime.current);

    return () => {
      window.clearTimeout(timer);
      if (timerStartedAt.current !== null) {
        remainingTime.current = Math.max(
          120,
          remainingTime.current - (performance.now() - timerStartedAt.current),
        );
        timerStartedAt.current = null;
      }
    };
  }, [autoNextPaused, collections.length, index, move]);

  if (!active) return null;

  const image = active.image || active.videoPoster || active.mobilePoster || "/homepage_villa/curated-1-main.webp";
  const duration = reducedMotion ? 0 : 0.48;
  const activeTabId = `destination-tab-${active.id}`;

  return (
    <div
      ref={storyRef}
      className={styles.story}
      data-autoplay-paused={autoNextPaused ? "true" : "false"}
      style={{ "--destination-autoplay-duration": `${AUTO_ADVANCE_MS}ms` } as CSSProperties}
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
        setTouchPaused(true);
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        setTouchPaused(false);
        if (!start) return;
        const deltaX = event.changedTouches[0].clientX - start.x;
        const deltaY = event.changedTouches[0].clientY - start.y;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          move(deltaX < 0 ? 1 : -1);
        }
      }}
      onTouchCancel={() => {
        touchStart.current = null;
        setTouchPaused(false);
      }}
    >
      <nav
        ref={indexRail}
        className={styles.index}
        role="tablist"
        aria-label="Choose a Bali neighbourhood"
      >
        {collections.map((collection, collectionIndex) => {
          const selected = collectionIndex === index;
          const thumbnail = collection.galleryImages[0] || collection.image;
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
              ref={(node) => {
                indexItems.current[collectionIndex] = node;
              }}
              onClick={() => select(collectionIndex)}
            >
              <span className={styles.indexNumber}>
                {String(collectionIndex + 1).padStart(2, "0")}
              </span>
              <span className={styles.indexThumb} aria-hidden="true">
                <Image src={thumbnail} alt="" fill sizes="80px" className={styles.indexThumbImage} />
              </span>
              <span className={styles.indexCopy}>
                <strong>{formatLocation(collection.location)}</strong>
                <small>{collection.category}</small>
              </span>
              <span className={styles.indexArrow} aria-hidden="true">
                <FiArrowRight />
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
        aria-live="off"
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
                quality={75}
                priority={index === 0}
                className={styles.image}
              />
            </motion.div>
          </AnimatePresence>

          {collections.length > 1 && (
            <div className={styles.imageNavigation} aria-label="Destination image navigation">
              <button type="button" onClick={() => move(-1)} aria-label="Previous destination">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Next destination">
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.details}>
          <div className={styles.detailsMeta}>
            <div className={styles.progress} aria-label={`Destination ${index + 1} of ${collections.length}`}>
              <span>{String(index + 1).padStart(2, "0")} / {String(collections.length).padStart(2, "0")}</span>
              <span className={styles.progressTrack} aria-hidden="true">
                <span key={active.id} />
              </span>
            </div>

            {collections.length > 1 && (
              <div className={styles.detailNavigation} aria-label="Destination navigation">
                <button type="button" onClick={() => move(-1)} aria-label="Previous destination">
                  <FiArrowLeft aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Next destination">
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
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
              <div className={styles.locationBlock}>
                <h3>{formatLocation(active.location)}</h3>
                <span>{active.category}</span>
              </div>
              <p>{active.description}</p>
            </motion.div>
          </AnimatePresence>

          <Link href={safeDestinationHref(active.href, active.location)} className={styles.explore}>
            Explore villas <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
