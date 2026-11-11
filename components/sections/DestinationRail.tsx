"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import type { BaliCollectionItem } from "@/data/baliCollections";
import { nextCarouselIndex, safeDestinationHref } from "@/lib/destination-carousel";
import styles from "./DestinationRail.module.css";

export default function DestinationRail({ collections }: { collections: BaliCollectionItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [animateImage, setAnimateImage] = useState(false);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const index = Math.min(activeIndex, Math.max(0, collections.length - 1));
  const active = collections[index];

  const select = (next: number, keyboard = false) => {
    if (next < 0 || next >= collections.length) return;
    setActiveIndex(next);
    setImageFailed(false);
    setAnimateImage(!keyboard);
    const tab = tabs.current[next];
    if (keyboard) tab?.focus({ preventScroll: true });
    // Scroll only the tab rail. scrollIntoView would move the document during a swipe.
    const rail = tab?.parentElement;
    if (tab && rail && rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({ left: tab.offsetLeft - rail.offsetLeft - (rail.clientWidth - tab.clientWidth) / 2, behavior: "instant" });
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = nextCarouselIndex(index, 1, collections.length);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = nextCarouselIndex(index, -1, collections.length);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = collections.length - 1;
    if (next === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    select(next, true);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || pointer.current) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) select(nextCarouselIndex(index, dx < 0 ? 1 : -1, collections.length));
  };

  if (!active) return null;
  const image = imageFailed ? "/homepage_villa/curated-1-main.webp" : active.image || active.videoPoster || active.mobilePoster || "/homepage_villa/curated-1-main.webp";

  return (
    <div className={styles.story}>
      <nav className={styles.index} role="tablist" aria-label="Choose a Bali neighbourhood" onKeyDown={onKeyDown}>
        {collections.map((collection, itemIndex) => (
          <button
            key={collection.id}
            ref={node => { tabs.current[itemIndex] = node; }}
            id={`destination-tab-${collection.id}`}
            type="button"
            role="tab"
            tabIndex={index === itemIndex ? 0 : -1}
            aria-selected={index === itemIndex}
            aria-controls="destination-panel"
            className={styles.indexItem}
            onClick={event => select(itemIndex, event.detail === 0)}
          >
            <span>{collection.location}</span>
            <FiArrowUpRight aria-hidden="true" />
          </button>
        ))}
      </nav>
      <div id="destination-panel" className={styles.stage} role="tabpanel" aria-labelledby={`destination-tab-${active.id}`} tabIndex={0}>
        <div className={styles.imageFrame} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointer.current = null; }}>
          <Image
            key={`${active.id}-${imageFailed}`}
            src={image}
            alt={active.imageAlt || `A villa in ${active.location}`}
            fill
            sizes="(min-width: 1600px) 1000px, (min-width: 701px) 62vw, 100vw"
            quality={75}
            className={styles.image}
            data-animate={animateImage}
            onError={() => setImageFailed(true)}
          />
        </div>
        <div className={styles.details}>
          <div className={styles.copy} aria-live="polite" aria-atomic="true">
            <h3>{active.category}</h3>
            <p>{active.description}</p>
          </div>
          <Link href={safeDestinationHref(active.href, active.location)} className={styles.explore} aria-label={`Explore villas in ${active.location}`}>
            Explore villas<FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
