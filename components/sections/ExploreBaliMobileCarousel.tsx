"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { baliCollections, type BaliCollectionItem } from "@/data/baliCollections";

type CollectionImageSet = {
  id: string;
  images: string[];
};

function mergeCollectionImages(collections: BaliCollectionItem[], remoteCollections: CollectionImageSet[]) {
  const remoteMap = new Map(remoteCollections.map((item) => [item.id, item.images.filter(Boolean)]));

  return collections.map((item) => {
    const remoteImages = remoteMap.get(item.id) || [];
    if (remoteImages.length === 0) return item;

    return {
      ...item,
      image: remoteImages[0] || item.image,
      galleryImages: Array.from(new Set([...remoteImages, ...item.galleryImages])).slice(0, 7),
    };
  });
}

function CollectionCard({ item }: { item: BaliCollectionItem }) {
  return (
    <article className="bali-collection-card">
      <Link className="bali-collection-card__image" href={item.href} draggable={false}>
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(max-width: 520px) 82vw, (max-width: 1023px) 44vw, 360px"
          className="bali-collection-card__photo"
          draggable={false}
        />
        <div className="bali-collection-card__thumbs" aria-hidden="true">
          {item.galleryImages.slice(1, 4).map((image) => (
            <span className="bali-collection-card__thumb" key={image}>
              <Image src={image} alt="" fill sizes="72px" className="bali-collection-card__thumb-photo" />
            </span>
          ))}
        </div>
      </Link>
      <div className="bali-collection-card__body">
        <span className="bali-collection-card__eyebrow">{item.tag}</span>
        <h3>{item.location}</h3>
        <p>{item.description}</p>
        <div className="bali-collection-card__chips" aria-label={`${item.location} moods`}>
          {item.moods.slice(0, 3).map((mood) => (
            <span key={mood}>{mood}</span>
          ))}
        </div>
        <div className="bali-collection-card__highlights">
          {item.highlights.slice(0, 3).map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
        <div className="bali-collection-card__best">
          <small>Best for</small>
          <strong>{item.bestFor.join(" / ")}</strong>
        </div>
        <div className="bali-collection-card__meta">
          <span>{item.villaCount}</span>
          <span>{item.price}</span>
        </div>
        <Link className="bali-collection-card__link" href={item.href} draggable={false}>
          {item.cta}
        </Link>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
   Wheel carousel: cards behave as if pinned to the rim of a large invisible
   wheel behind the stage. For each card, rel = index - progress drives a
   curved trajectory: horizontal spread, parabolic vertical drop, rim rotation
   (transform-origin sits far below the card), scale falloff and depth order.
   `progress` is a float index — dragging scrubs it directly, release springs
   it to the nearest whole card.
---------------------------------------------------------------------------- */

const WHEEL = {
  spreadPct: 74, // horizontal offset per card, in % of card width
  arcDrop: 26, // px of parabolic vertical drop per rel^2
  arcDropMax: 130,
  rotateStep: 6, // degrees per card away from center
  scaleStep: 0.08,
  scaleMin: 0.72,
  opacityStep: 0.16,
  opacityMin: 0.3,
  cull: 2.6, // rel beyond this renders invisible
};

function WheelItem({
  index,
  progress,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const x = useTransform(progress, (p) => `${(index - p) * WHEEL.spreadPct}%`);
  const y = useTransform(progress, (p) =>
    Math.min((index - p) ** 2 * WHEEL.arcDrop, WHEEL.arcDropMax),
  );
  const rotate = useTransform(progress, (p) => (index - p) * WHEEL.rotateStep);
  const scale = useTransform(progress, (p) =>
    Math.max(1 - Math.abs(index - p) * WHEEL.scaleStep, WHEEL.scaleMin),
  );
  const opacity = useTransform(progress, (p) => {
    const d = Math.abs(index - p);
    if (d > WHEEL.cull) return 0;
    return Math.max(1 - d * WHEEL.opacityStep, WHEEL.opacityMin);
  });
  const zIndex = useTransform(progress, (p) => 100 - Math.round(Math.abs(index - p) * 10));
  const visibility = useTransform(opacity, (o) => (o === 0 ? "hidden" : "visible"));

  return (
    <motion.div
      className="bali-collection-wheel__item"
      style={{ x, y, rotate, scale, opacity, zIndex, visibility }}
    >
      {children}
    </motion.div>
  );
}

function WheelCarousel({ collections }: { collections: BaliCollectionItem[] }) {
  const count = collections.length;
  const [active, setActive] = useState(0);
  const progress = useMotionValue(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const settle = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(count - 1, Math.round(target)));
      animRef.current?.stop();
      animRef.current = animate(progress, clamped, {
        type: "spring",
        stiffness: 250,
        damping: 32,
        restDelta: 0.001,
      });
      setActive(clamped);
    },
    [count, progress],
  );

  const bind = useDrag(
    ({ first, down, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      const width = stageRef.current?.querySelector(".bali-collection-wheel__item")?.clientWidth || 320;
      if (first) {
        animRef.current?.stop();
        dragStart.current = progress.get();
      }
      const raw = dragStart.current - mx / width;
      if (down) {
        // Rubber-band resistance beyond the first/last card.
        let resisted = raw;
        if (raw < 0) resisted = raw * 0.32;
        else if (raw > count - 1) resisted = count - 1 + (raw - (count - 1)) * 0.32;
        progress.set(resisted);
      }
      if (last) {
        const fling = Math.abs(vx) > 0.4 ? -dx * 0.6 : 0;
        settle(raw + fling);
      }
    },
    { axis: "x", filterTaps: true, pointer: { touch: true }, eventOptions: { passive: false } },
  );

  const activeItem = collections[active];

  return (
    <div
      className="bali-collection-wheel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Bali destination collections"
    >
      <div className="bali-collection-wheel__stage" ref={stageRef} {...bind()}>
        {collections.map((item, index) => (
          <WheelItem key={item.id} index={index} progress={progress}>
            <CollectionCard item={item} />
          </WheelItem>
        ))}
      </div>
      <div className="bali-collection-wheel__controls">
        <button
          type="button"
          className="bali-collection-wheel__nav"
          onClick={() => settle(active - 1)}
          disabled={active === 0}
          aria-label="Previous destination"
        >
          <FiChevronLeft size={18} aria-hidden />
        </button>
        <div className="bali-collection-wheel__dots" aria-hidden="true">
          {collections.map((item, index) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              className={`bali-collection-wheel__dot${index === active ? " is-active" : ""}`}
              onClick={() => settle(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="bali-collection-wheel__nav"
          onClick={() => settle(active + 1)}
          disabled={active === count - 1}
          aria-label="Next destination"
        >
          <FiChevronRight size={18} aria-hidden />
        </button>
      </div>
      <p className="bali-collection-wheel__status" aria-live="polite">
        {`Destination ${active + 1} of ${count}: ${activeItem?.location ?? ""}`}
      </p>
    </div>
  );
}

type ExploreBaliMobileCarouselProps = {
  collections?: BaliCollectionItem[];
};

export default function ExploreBaliMobileCarousel({
  collections: providedCollections = baliCollections,
}: ExploreBaliMobileCarouselProps) {
  const [remoteImages, setRemoteImages] = useState<CollectionImageSet[]>([]);
  const collections = useMemo(() => mergeCollectionImages(providedCollections, remoteImages), [providedCollections, remoteImages]);
  const reduceMotion = useReducedMotion();
  // Wheel motion is a mobile/tablet experience only. Starts false so the SSR
  // markup is the plain snap carousel; upgrades after mount.
  const [isWheelViewport, setIsWheelViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsWheelViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/lodgify/collection-images", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { collections?: CollectionImageSet[] } | null) => {
        if (Array.isArray(data?.collections)) {
          setRemoteImages(data.collections);
        }
      })
      .catch(() => {
        // Local fallback images keep the carousel usable when Lodgify is temporarily unavailable.
      });

    return () => controller.abort();
  }, []);

  if (isWheelViewport && !reduceMotion) {
    return <WheelCarousel collections={collections} />;
  }

  // Reduced motion / desktop fallback: plain scroll-snap track.
  return (
    <div className="bali-collection-carousel" aria-label="Bali destination collections">
      {collections.map((item) => (
        <CollectionCard item={item} key={item.id} />
      ))}
    </div>
  );
}
