"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";

type VillaPhoto = {
  url: string;
  caption?: string;
};

type VillaPhotoGalleryProps = {
  villaName: string;
  photos: VillaPhoto[];
  sideContent?: ReactNode;
};

const getPhotoKey = (photo: VillaPhoto, index: number, scope: string) => {
  const source = `${photo.url || "missing-url"}-${photo.caption || "uncaptioned"}`;
  return `${scope}-${index}-${source}`;
};

export default function VillaPhotoGallery({ villaName, photos, sideContent }: VillaPhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  const isLocked = isOpen || lightboxIndex !== null;
  useScrollLock(isLocked);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50; // swipe threshold in px
    if (diffX > threshold) {
      // swiped left -> next
      goNext();
    } else if (diffX < -threshold) {
      // swiped right -> prev
      goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  /* Keyboard navigation for modal & lightbox */
  useEffect(() => {
    if (!isOpen && lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) {
          closeLightbox();
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
      if (lightboxIndex !== null) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, lightboxIndex, closeLightbox, goPrev, goNext]);

  return (
    <>
      <div className="villa-detail-photo-grid">
        {mainPhoto && (
          <figure className="is-main">
            <Image
              src={mainPhoto.url}
              alt={mainPhoto.caption || `${villaName} main image`}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="villa-detail-image"
            />
            {photos.length > 3 && (
              <button type="button" className="villa-photo-grid__show" onClick={() => setIsOpen(true)}>
                Show all photos
              </button>
            )}
          </figure>
        )}

        <div className="villa-detail-photo-grid__side">
          {sidePhotos.map((photo, index) => (
            <figure key={getPhotoKey(photo, index + 1, "side-photo")}>
              <Image
                src={photo.url}
                alt={photo.caption || `${villaName} image ${index + 2}`}
                fill
                sizes="(min-width: 1024px) 28vw, 100vw"
                className="villa-detail-image"
              />
            </figure>
          ))}
          {sideContent && <div className="villa-detail-photo-grid__booking">{sideContent}</div>}
        </div>
        {photos.length > 3 && (
          <button type="button" className="villa-photo-grid__show villa-photo-grid__show--mobile" onClick={() => setIsOpen(true)}>
            Show all photos
          </button>
        )}
      </div>

      {/* ── All Photos Modal (portaled to body) ── */}
      {isOpen && createPortal(
        <div className="villa-modal" data-lenis-prevent role="dialog" aria-modal="true" aria-label={`${villaName} photos`}>
          {/* Backdrop click to close */}
          <div className="villa-modal__backdrop" onClick={() => setIsOpen(false)} />
          {/* Scrollable panel */}
          <div className="villa-modal__scroll" data-lenis-prevent>
            <div className="villa-modal__panel villa-modal__panel--photos">
              <div className="villa-modal__header">
                <h2>{villaName}</h2>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close photos">Close</button>
              </div>
              <div className="villa-photo-modal__grid">
                {photos.map((photo, index) => (
                  <figure
                    key={getPhotoKey(photo, index, "modal-photo")}
                    onClick={() => openLightbox(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") openLightbox(index); }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || `${villaName} image ${index + 1}`}
                      fill
                      sizes="(min-width: 900px) 45vw, 100vw"
                      className="villa-detail-image"
                    />
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Lightbox (portaled to body) ── */}
      {lightboxIndex !== null && createPortal(
        <div 
          className="villa-lightbox" 
          data-lenis-prevent 
          role="dialog" 
          aria-modal="true" 
          aria-label="Photo detail"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="villa-lightbox__backdrop" onClick={closeLightbox} />

          <button type="button" className="villa-lightbox__close" onClick={closeLightbox} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          {photos.length > 1 && (
            <>
              <button type="button" className="villa-lightbox__nav villa-lightbox__nav--prev" onClick={goPrev} aria-label="Previous photo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button type="button" className="villa-lightbox__nav villa-lightbox__nav--next" onClick={goNext} aria-label="Next photo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}

          <div className="villa-lightbox__stage">
            <Image
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption || `${villaName} image ${lightboxIndex + 1}`}
              fill
              sizes="95vw"
              className="villa-lightbox__image"
            />
          </div>

          <div className="villa-lightbox__info">
            {photos[lightboxIndex].caption && <p>{photos[lightboxIndex].caption}</p>}
            <span>{lightboxIndex + 1} / {photos.length}</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
