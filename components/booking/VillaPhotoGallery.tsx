"use client";

import Image from "next/image";
import { useState } from "react";

type VillaPhoto = {
  url: string;
  caption?: string;
};

type VillaPhotoGalleryProps = {
  villaName: string;
  photos: VillaPhoto[];
};

export default function VillaPhotoGallery({ villaName, photos }: VillaPhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const preview = photos.slice(0, 5);

  return (
    <>
      <div className="villa-detail-photo-grid">
        {preview.map((photo, index) => (
          <figure key={`${photo.url}-${index}`} className={index === 0 ? "is-main" : ""}>
            <Image
              src={photo.url}
              alt={photo.caption || `${villaName} image ${index + 1}`}
              fill
              priority={index === 0}
              sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="villa-detail-image"
              unoptimized
            />
          </figure>
        ))}
        {photos.length > 5 && (
          <button type="button" className="villa-photo-grid__show" onClick={() => setIsOpen(true)}>
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
                <figure key={`${photo.url}-modal-${index}`}>
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
