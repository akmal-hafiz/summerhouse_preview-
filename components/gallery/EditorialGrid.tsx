"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FiPlay } from "react-icons/fi";
import { motion } from "framer-motion";
import type { GalleryEntry } from "./useGalleryEntries";
import styles from "./GalleryPage.module.css";

type EditorialGridProps = {
  entries: GalleryEntry[];
  onOpen: (entry: GalleryEntry, trigger: HTMLElement | null) => void;
  reducedMotion: boolean;
};

const easeEditorial = [0.22, 1, 0.36, 1] as const;

/** Caption meta: collection, the linked villa's area, and the year, e.g. "Escapes · Pererenan · 2026". */
function tileMeta(entry: GalleryEntry): string {
  const parts = [entry.category, entry.houseLocation || entry.houseName, entry.year].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Summerhouse Bali";
}

/* Natural masonry: three columns on desktops, two below 1024px. Items are dealt across the columns in CMS order
   (1, 2, 3 on the first row), and every photo keeps its own shape. */
const WIDE = "(min-width: 1024px)";
function useColumnCount() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(WIDE);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => (window.matchMedia(WIDE).matches ? 3 : 2),
    () => 3,
  );
}

/**
 * Film tile: autoplays muted and looped while on screen and pauses once scrolled away; a small chip shows its
 * length. Falls back to the poster frame until it can play, and stays on the poster under reduced motion.
 */
function TileVideo({ entry, reducedMotion, onShape }: { entry: GalleryEntry; reducedMotion: boolean; onShape: (ratio: number | null, seconds: number) => void }) {
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
      onLoadedMetadata={(event) => {
        const { videoWidth, videoHeight, duration } = event.currentTarget;
        onShape(videoWidth && videoHeight ? videoWidth / videoHeight : null, duration);
      }}
    />
  );
}

const filmLength = (seconds: number | null) => {
  if (!seconds || !Number.isFinite(seconds)) return "Film";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function GalleryTile({
  entry,
  order,
  priority,
  onOpen,
  reducedMotion,
}: {
  entry: GalleryEntry;
  order: number;
  priority: boolean;
  onOpen: EditorialGridProps["onOpen"];
  reducedMotion: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  // The API sends each photo's size; anything without one is measured once loaded (4:5 / 16:9 until then).
  const [measured, setMeasured] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const ratio = entry.ratio ?? measured ?? (entry.isVideo ? 16 / 9 : 4 / 5);

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
        aria-label={entry.isVideo ? `Watch film: ${entry.title}` : `Open photo: ${entry.title}`}
      >
        <span className={styles.tileMedia} style={{ aspectRatio: ratio }}>
          {entry.isVideo && entry.videoUrl ? (
            <TileVideo entry={entry} reducedMotion={reducedMotion} onShape={(shape, length) => { if (!entry.ratio && shape) setMeasured(shape); setSeconds(length); }} />
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
              sizes="(min-width: 1024px) 30vw, 48vw"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className={styles.tileImage}
              onError={() => setImageFailed(true)}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                if (!entry.ratio && naturalWidth && naturalHeight) setMeasured(naturalWidth / naturalHeight);
              }}
            />
          )}
          {entry.isVideo ? <span className={styles.filmChip} aria-hidden="true"><FiPlay /> {filmLength(seconds)}</span> : null}
          <span className={styles.tileHover} aria-hidden="true" />
        </span>
      </button>
      <figcaption className={styles.tileCaption}>
        <p className={styles.tileTitle}>{entry.title}</p>
        <p className={styles.tileMeta}>{tileMeta(entry)}</p>
      </figcaption>
    </motion.figure>
  );
}

export default function EditorialGrid({ entries, onOpen, reducedMotion }: EditorialGridProps) {
  const columnCount = useColumnCount();
  if (!entries.length) return null;

  // shortcut: Tab order runs down each column; move to a flat CMS-ordered list with computed row spans if the
  // gallery passes ~30 items or an accessibility audit flags WCAG 2.4.3.
  const columns = Array.from({ length: columnCount }, () => [] as { entry: GalleryEntry; index: number }[]);
  entries.forEach((entry, index) => columns[index % columnCount].push({ entry, index }));

  return (
    <div className={styles.grid}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className={styles.column}>
          {column.map(({ entry, index }) => (
            <GalleryTile key={entry.id} entry={entry} order={index} priority={index === 0} onOpen={onOpen} reducedMotion={reducedMotion} />
          ))}
        </div>
      ))}
    </div>
  );
}
