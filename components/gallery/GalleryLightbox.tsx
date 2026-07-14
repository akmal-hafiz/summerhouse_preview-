"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { GalleryEntry } from "./useGalleryEntries";
import styles from "./GalleryPage.module.css";

type GalleryLightboxProps = {
  /** The list the open entry belongs to — enables prev/next inside the viewer. */
  entries: GalleryEntry[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  /** Element to restore focus to when the viewer closes. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
};

export default function GalleryLightbox({
  entries,
  index,
  onClose,
  onNavigate,
  returnFocusRef,
}: GalleryLightboxProps) {
  const open = index !== null && entries[index] !== undefined;
  const entry = open ? entries[index] : null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failedMediaId, setFailedMediaId] = useState<string | null>(null);

  useScrollLock(open);

  const handleClose = useCallback(() => {
    onClose();
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    setFailedMediaId(null);
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
        return;
      }
      if (event.key === "ArrowLeft" && index! > 0) onNavigate(index! - 1);
      if (event.key === "ArrowRight" && index! < entries.length - 1) onNavigate(index! + 1);

      if (event.key === "Tab") {
        // Keep focus inside the dialog.
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], video, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, entries.length, handleClose, onNavigate]);

  if (!open || !entry || typeof document === "undefined") return null;

  const houseTag = entry.houseName
    ? [entry.houseName, entry.houseLocation].filter(Boolean).join(" · ")
    : "Summerhouse Bali";

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.lightboxRoot}
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      onClick={handleClose}
    >
      <button ref={closeRef} type="button" className={styles.lightboxClose} aria-label="Close" onClick={handleClose}>
        &#10005;
      </button>

      {index > 0 && (
        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
        >
          ←
        </button>
      )}
      {index < entries.length - 1 && (
        <button
          type="button"
          className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
        >
          →
        </button>
      )}

      <div className={styles.lightboxStage} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.lightboxMedia}
          data-video={entry.isVideo ? "true" : "false"}
          data-fallback={failedMediaId === entry.id ? "true" : "false"}
        >
          {failedMediaId === entry.id ? (
            <div className={styles.lightboxFallback} role="status">
              <span>Image unavailable</span>
              <strong>{entry.title}</strong>
              <p>The gallery details are still available below.</p>
            </div>
          ) : entry.isVideo && entry.videoUrl ? (
            <video
              key={entry.id}
              className={styles.lightboxVideo}
              src={entry.videoUrl}
              poster={entry.mediaSrc}
              onError={() => setFailedMediaId(entry.id)}
              controls
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              key={entry.id}
              src={entry.mediaSrc}
              alt={entry.alt}
              className={styles.lightboxImage}
              onError={() => setFailedMediaId(entry.id)}
            />
          )}
        </div>
        <div className={styles.lightboxInfo}>
          <p className={styles.lightboxTag}>{houseTag}</p>
          <h2 className={styles.lightboxTitle}>{entry.title}</h2>
          <p className={styles.lightboxStory}>{entry.story}</p>
          <p className={styles.lightboxMeta}>
            {entry.meta} · {index + 1} of {entries.length}
          </p>
          <div className={styles.lightboxActions}>
            {entry.propertyId ? (
              <Link href={`/villas/${entry.propertyId}`} className={styles.lightboxCta}>
                Stay at {entry.houseName ?? "this house"}
              </Link>
            ) : (
              <Link href="/villas" className={styles.lightboxCta}>
                Explore our houses
              </Link>
            )}
            {entry.propertyId && (
              <Link href="/villas" className={styles.lightboxCtaGhost}>
                All houses
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
