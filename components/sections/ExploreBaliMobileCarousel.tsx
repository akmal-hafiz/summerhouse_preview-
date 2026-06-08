"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function ExploreBaliMobileCarousel() {
  const [remoteImages, setRemoteImages] = useState<CollectionImageSet[]>([]);
  const collections = useMemo(() => mergeCollectionImages(baliCollections, remoteImages), [remoteImages]);

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

  return (
    <div className="bali-collection-carousel" aria-label="Bali destination collections">
      {collections.map((item) => (
        <article className="bali-collection-card" key={item.id}>
          <Link className="bali-collection-card__image" href={item.href}>
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 520px) 82vw, (max-width: 1023px) 44vw, 360px"
              className="bali-collection-card__photo"
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
            <Link className="bali-collection-card__link" href={item.href}>
              {item.cta}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
