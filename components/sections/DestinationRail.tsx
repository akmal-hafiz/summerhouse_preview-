"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { BaliCollectionItem } from "@/data/baliCollections";
import styles from "./DestinationRail.module.css";

type DestinationRailProps = {
  collections: BaliCollectionItem[];
};

type PointerState = {
  index: number;
  pointerType: string;
  startX: number;
  startY: number;
  moved: boolean;
};

const MOVE_THRESHOLD = 9;

export default function DestinationRail({ collections }: DestinationRailProps) {
  const count = collections.length;
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, Math.floor(count / 2)));
  const [railVisible, setRailVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const pointerState = useRef<PointerState | null>(null);
  const blockNextClick = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);

  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), Math.max(count - 1, 0));

  const centerCard = useCallback(
    (index: number, behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth") => {
      const card = linkRefs.current[index];
      const rail = railRef.current;
      if (!card || !rail || rail.scrollWidth <= rail.clientWidth + 4) return;

      const left = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
      rail.scrollTo({ left: Math.max(0, left), behavior });
    },
    [prefersReducedMotion],
  );

  const activate = useCallback(
    (index: number, shouldCenter = false) => {
      setActiveIndex(index);
      if (shouldCenter) {
        requestAnimationFrame(() => centerCard(index));
      }
    },
    [centerCard],
  );

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(count - 1, 0)));
  }, [count]);

  useEffect(() => {
    if (count === 0) return;
    const initialIndex = Math.floor(count / 2);
    const frame = requestAnimationFrame(() => centerCard(initialIndex, "auto"));
    return () => cancelAnimationFrame(frame);
  }, [centerCard, count]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRailVisible(entry.isIntersecting && entry.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.6] },
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const shouldPlay =
        railVisible &&
        !prefersReducedMotion &&
        index === safeActiveIndex &&
        collections[index]?.mediaType === "video";

      if (shouldPlay) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [collections, prefersReducedMotion, railVisible, safeActiveIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(Math.max(index + direction, 0), count - 1);
    activate(nextIndex, true);
    linkRefs.current[nextIndex]?.focus();
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>, index: number) => {
    pointerState.current = {
      index,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const pointer = pointerState.current;
    if (!pointer) return;
    const moved =
      Math.abs(event.clientX - pointer.startX) > MOVE_THRESHOLD ||
      Math.abs(event.clientY - pointer.startY) > MOVE_THRESHOLD;
    if (moved) pointer.moved = true;
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>, index: number) => {
    const pointer = pointerState.current;
    pointerState.current = null;
    if (!pointer || pointer.index !== index) return;

    if (pointer.moved) {
      blockNextClick.current = index;
      return;
    }

    if (pointer.pointerType !== "mouse" && index !== safeActiveIndex) {
      blockNextClick.current = index;
      activate(index, true);
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (blockNextClick.current === index) {
      event.preventDefault();
      blockNextClick.current = null;
      return;
    }

    if (index !== safeActiveIndex) {
      event.preventDefault();
      activate(index, true);
    }
  };

  const handleRailScroll = () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail || rail.scrollWidth <= rail.clientWidth + 4) return;
      const railCenter = rail.scrollLeft + rail.clientWidth / 2;
      let closest = safeActiveIndex;
      let distance = Number.POSITIVE_INFINITY;

      linkRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const nextDistance = Math.abs(cardCenter - railCenter);
        if (nextDistance < distance) {
          closest = index;
          distance = nextDistance;
        }
      });

      if (closest !== safeActiveIndex) setActiveIndex(closest);
    });
  };

  useEffect(
    () => () => {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    },
    [],
  );

  if (count === 0) return null;

  return (
    <nav className={styles.stage} aria-label="Bali destination guides">
      <div ref={railRef} className={styles.rail} onScroll={handleRailScroll}>
        {collections.map((item, index) => {
          const isActive = index === safeActiveIndex;
          const poster = item.videoPoster || item.mobilePoster || item.image;
          const label =
            item.mediaAccessibilityLabel || `Open the Summerhouse guide to ${item.location}`;

          return (
            <Link
              key={item.id}
              ref={(node) => {
                linkRefs.current[index] = node;
              }}
              href={
                item.href ||
                `/villas?location=${encodeURIComponent(item.location)}&match=exact`
              }
              className={styles.card}
              data-active={isActive ? "true" : "false"}
              aria-label={label}
              onMouseEnter={() => activate(index)}
              onFocus={() => activate(index, true)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPointerDown={(event) => handlePointerDown(event, index)}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => handlePointerUp(event, index)}
              onPointerCancel={() => {
                pointerState.current = null;
              }}
              onClick={(event) => handleClick(event, index)}
              draggable={false}
            >
              <span className={styles.media}>
                {item.mediaType === "video" && item.video && !prefersReducedMotion ? (
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    className={styles.photo}
                    poster={poster || undefined}
                    muted
                    loop
                    playsInline
                    preload={isActive ? "metadata" : "none"}
                    aria-hidden="true"
                  >
                    <source src={item.video} />
                  </video>
                ) : (
                  <Image
                    src={poster || item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1200px) 28vw, (min-width: 720px) 42vw, 76vw"
                    loading={isActive && railVisible ? "eager" : "lazy"}
                    fetchPriority={isActive && railVisible ? "high" : "auto"}
                    className={styles.photo}
                    draggable={false}
                  />
                )}
              </span>

              <span className={styles.caption}>
                <span className={styles.category}>{item.category}</span>
                <strong>{item.location}</strong>
                <span className={styles.description}>{item.description}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className={styles.mobileHint}>Swipe to explore</p>
    </nav>
  );
}
