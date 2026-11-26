"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ModalLayer from "@/components/common/ModalLayer";

type VillaPhoto = {
  url: string;
  caption?: string;
};

type VillaPhotoGalleryProps = {
  villaName: string;
  photos: VillaPhoto[];
};

const getPhotoKey = (photo: VillaPhoto, index: number, scope: string) => {
  const source = `${photo.url || "missing-url"}-${photo.caption || "uncaptioned"}`;
  return `${scope}-${index}-${source}`;
};

export default function VillaPhotoGallery({ villaName, photos }: VillaPhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const heroPhotos = photos.slice(0, 5);
  const mainPhoto = heroPhotos[0];
  const sidePhotos = heroPhotos.slice(1);

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

  const resetTouch = useCallback(() => {
    touchStartX.current = null;
    touchEndX.current = null;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      resetTouch();
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || touchStartX.current === null) {
      resetTouch();
      return;
    }
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
    resetTouch();
  };

  /* Arrow keys step through the lightbox. Esc belongs to each ModalLayer: the top one (the lightbox
     over the photo grid) closes first. */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, goPrev, goNext]);

  return (
    <>
      <div className="villa-detail-photo-grid" data-count={heroPhotos.length}>
        {mainPhoto && (
          <figure className="is-main">
            <Image
              src={mainPhoto.url}
              alt={mainPhoto.caption || `${villaName} main image`}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="villa-detail-image"
            />
            <button
              type="button"
              className="villa-photo-grid__trigger"
              aria-label={`Open photo 1 of ${photos.length}`}
              onClick={() => openLightbox(0)}
            />
            {photos.length > 3 && (
              <button type="button" className="villa-photo-grid__show" onClick={() => setIsOpen(true)}>
                Show all {photos.length} photos
              </button>
            )}
          </figure>
        )}

        {sidePhotos.length > 0 && (
          <div className="villa-detail-photo-grid__side">
            {sidePhotos.map((photo, index) => (
              <figure
                key={getPhotoKey(photo, index + 1, "side-photo")}
                className={index >= 2 ? "is-desktop-extra" : undefined}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || `${villaName} image ${index + 2}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  loading="eager"
                  className="villa-detail-image"
                />
                <button
                  type="button"
                  className="villa-photo-grid__trigger"
                  aria-label={`Open photo ${index + 2} of ${photos.length}`}
                  onClick={() => openLightbox(index + 1)}
                />
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* All Photos Modal (portaled to body) */}
      {isOpen && createPortal(
        <ModalLayer lockScroll onClose={() => setIsOpen(false)} aria-label={`${villaName} photos`}>
          <div className="villa-modal" data-lenis-prevent>
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
                    <figure key={getPhotoKey(photo, index, "modal-photo")}>
                      <button
                        type="button"
                        className="villa-photo-modal__thumb"
                        aria-label={`Open photo ${index + 1} of ${photos.length}`}
                        onClick={() => openLightbox(index)}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption || `${villaName} image ${index + 1}`}
                          fill
                          sizes="(min-width: 900px) 45vw, 100vw"
                          className="villa-detail-image"
                        />
                      </button>
                      {photo.caption && <figcaption>{photo.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalLayer>,
        document.body
      )}

      {/* Lightbox (portaled to body) */}
      {lightboxIndex !== null && createPortal(
        <ModalLayer lockScroll onClose={closeLightbox} aria-label="Photo detail">
          <div
            className="villa-lightbox"
            data-lenis-prevent
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={resetTouch}
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
          </div>
        </ModalLayer>,
        document.body
      )}
    </>
  );
}
