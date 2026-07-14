"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { GalleryEntry } from "./useGalleryEntries";
import styles from "./GalleryPage.module.css";

type EditorialGridProps = {
  entries: GalleryEntry[];
  onOpen: (entry: GalleryEntry, trigger: HTMLElement | null) => void;
  reducedMotion: boolean;
};

const easeEditorial = [0.22, 1, 0.36, 1] as const;

/**
 * Meta line under each tile — mirrors the reference's "YEAR · LOCATION" caption
 * but sourced entirely from our own fields: the linked property's location (or
 * name), the capture year, and the editorial category as the final fallback.
 */
function tileMeta(entry: GalleryEntry): string {
  const place = entry.houseLocation || entry.houseName || entry.category;
  const parts = [entry.year, place].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return "Summerhouse Bali";
}

/**
 * Cinematic film tile: autoplays muted + looped while it is on screen, pauses
 * once scrolled away. No play button — the film is the tile. Falls back to the
 * poster frame until it can play, and if reduced motion is requested we keep it
 * paused on the poster.
 */
function TileVideo({ entry, reducedMotion }: { entry: GalleryEntry; reducedMotion: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion) return;

    const observer = new IntersectionObserver(
      (records) => {
        const record = records[0];
        if (!record) return;
        if (record.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <video
      ref={ref}
      className={styles.tileVideo}
      src={entry.videoUrl ?? undefined}
      poster={entry.mediaSrc}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={entry.alt}
    />
  );
}

function GalleryTile({
  entry,
  order,
  onOpen,
  reducedMotion,
}: {
  entry: GalleryEntry;
  order: number;
  onOpen: EditorialGridProps["onOpen"];
  reducedMotion: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.figure
      className={styles.tile}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: easeEditorial, delay: (order % 3) * 0.08 }}
    >
      <button
        type="button"
        className={styles.tileButton}
        onClick={(event) => onOpen(entry, event.currentTarget)}
        aria-label={entry.isVideo ? `Play — ${entry.title}` : `View — ${entry.title}`}
      >
        <span className={styles.tileMedia}>
          {entry.isVideo && entry.videoUrl ? (
            <TileVideo entry={entry} reducedMotion={reducedMotion} />
          ) : imageFailed ? (
            <span className={styles.tileFallback} role="status">
              <span>Image unavailable</span>
              <strong>{entry.title}</strong>
            </span>
          ) : (
            <Image
              src={entry.mediaSrc}
              alt={entry.alt}
              fill
              sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
              className={styles.tileImage}
              onError={() => setImageFailed(true)}
            />
          )}
          <span className={styles.tileHover} aria-hidden="true">
            <span className={`${styles.tileCorner} ${styles.tileCornerTr}`} />
            <span className={`${styles.tileCorner} ${styles.tileCornerBl}`} />
            <span className={styles.tileHoverLabel}>
              {entry.isVideo ? "Watch film" : "View more"}
            </span>
          </span>
        </span>
      </button>
      <figcaption className={styles.tileCaption}>
        <h3 className={styles.tileTitle}>{entry.title}</h3>
        <p className={styles.tileMeta}>{tileMeta(entry)}</p>
      </figcaption>
    </motion.figure>
  );
}

export default function EditorialGrid({ entries, onOpen, reducedMotion }: EditorialGridProps) {
  if (!entries.length) return null;

  return (
    <div className={styles.grid}>
      {entries.map((entry, index) => (
        <GalleryTile
          key={entry.id}
          entry={entry}
          order={index % 12}
          onOpen={onOpen}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
