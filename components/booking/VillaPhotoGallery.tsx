"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 3);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
              unoptimized
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
                unoptimized
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

      {isOpen && (
        <div className="villa-modal" role="dialog" aria-modal="true" aria-label={`${villaName} photos`}>
          <div className="villa-modal__panel villa-modal__panel--photos">
            <div className="villa-modal__header">
              <h2>{villaName}</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close photos">Close</button>
            </div>
            <div className="villa-photo-modal__grid">
              {photos.map((photo, index) => (
                <figure key={getPhotoKey(photo, index, "modal-photo")}>
                  <Image
                    src={photo.url}
                    alt={photo.caption || `${villaName} image ${index + 1}`}
                    fill
                    sizes="(min-width: 900px) 45vw, 100vw"
                    className="villa-detail-image"
                    unoptimized
                  />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
