"use client";

import { useMemo } from "react";
import type { CmsGalleryItem } from "@/lib/cms";

export type GalleryEntry = {
  /** Stable id for React keys. */
  id: string;
  /** Image source, or the poster frame for films. */
  mediaSrc: string;
  videoUrl: string | null;
  isVideo: boolean;
  title: string;
  /** Longer caption shown in the lightbox. */
  story: string;
  alt: string;
  /** Editorial filter tab this entry belongs to (admin-defined, optional). */
  category: string | null;
  /** House this post is tagged to (from the linked Lodgify property). */
  houseName: string | null;
  houseLocation: string | null;
  propertyId: string | null;
  /** Four-digit year derived from created_at, when available. */
  year: string | null;
  /** e.g. "Film · June 2026" */
  meta: string;
};

/**
 * Local fallback media shown when the CMS gallery is empty or unreachable.
 * Mirrors the seeded cinematic/lifestyle set (never Lodgify listing photos)
 * so the feed is never blank.
 */
const FALLBACK_ENTRIES: GalleryEntry[] = [
  {
    id: "fallback-editorial-large",
    mediaSrc: "/bellevoire/editorial_large.png",
    videoUrl: null,
    isVideo: false,
    title: "The Long Afternoon",
    story: "Editorial photography of slow island living at Summerhouse Bali.",
    alt: "Editorial photograph of slow island living at Summerhouse",
    category: "Editorial",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-editorial-small",
    mediaSrc: "/bellevoire/editorial_small.png",
    videoUrl: null,
    isVideo: false,
    title: "Still Morning",
    story: "A quiet editorial still from a Summerhouse morning.",
    alt: "Quiet editorial still from a Summerhouse morning",
    category: "Editorial",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-beach",
    mediaSrc: "/bellevoire/beach_stay.png",
    videoUrl: null,
    isVideo: false,
    title: "Beach Stay",
    story: "A beachside stay moment near a Summerhouse villa.",
    alt: "Beachside stay moment near a Summerhouse villa",
    category: "Escapes",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-landscape",
    mediaSrc: "/bellevoire/landscape.png",
    videoUrl: null,
    isVideo: false,
    title: "Across the Ridge",
    story: "Bali landscape stretching beyond the villa grounds.",
    alt: "Bali landscape stretching beyond the villa grounds",
    category: "Escapes",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-golden",
    mediaSrc: "/herosection1.jpg",
    videoUrl: null,
    isVideo: false,
    title: "Golden Hour",
    story: "Golden hour light across a Summerhouse stay.",
    alt: "Golden hour light across a Summerhouse stay",
    category: "Lifestyle",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-canggu",
    mediaSrc: "/images_canggu.jpg",
    videoUrl: null,
    isVideo: false,
    title: "Canggu, Slow",
    story: "A slow afternoon scene in Canggu.",
    alt: "Slow afternoon scene in Canggu",
    category: "Lifestyle",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-found",
    mediaSrc: "/Found_myself..jpg",
    videoUrl: null,
    isVideo: false,
    title: "Found Myself Here",
    story: "A quiet found moment during a Summerhouse stay.",
    alt: "A quiet found moment during a Summerhouse stay",
    category: "Lifestyle",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Stills",
  },
  {
    id: "fallback-film",
    mediaSrc: "/Hero_Section.png",
    videoUrl: "/video/herosection_summerhouse.mp4",
    isVideo: true,
    title: "Summerhouse, In Motion",
    story: "A cinematic film of Summerhouse Bali island living.",
    alt: "Cinematic film of Summerhouse Bali island living",
    category: "Films",
    houseName: null,
    houseLocation: null,
    propertyId: null,
    year: null,
    meta: "Film",
  },
];

const SAFE_MEDIA_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_PROPERTY_ID = /^[A-Za-z0-9_-]+$/;

function normalizeMediaSrc(value: string | null | undefined): string | null {
  const mediaSrc = value?.trim();
  if (!mediaSrc) return null;
  if (mediaSrc.startsWith("/") && !mediaSrc.startsWith("//")) return mediaSrc;

  try {
    const parsed = new URL(mediaSrc);
    if (!SAFE_MEDIA_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function normalizePropertyId(value: string | null | undefined): string | null {
  const propertyId = value?.trim();
  if (!propertyId) return null;
  return SAFE_PROPERTY_ID.test(propertyId) ? propertyId : null;
}

function formatMeta(isVideo: boolean, createdAt: string | null | undefined): string {
  const kind = isVideo ? "Film" : "Stills";
  if (!createdAt) return kind;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return kind;
  const month = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  return `${kind} · ${month}`;
}

function extractYear(createdAt: string | null | undefined): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return String(date.getFullYear());
}

function normalize(items: CmsGalleryItem[] | null | undefined): GalleryEntry[] {
  if (!items?.length) return FALLBACK_ENTRIES;

  const seenSrc = new Set<string>();
  const result: GalleryEntry[] = [];

  items.forEach((item, index) => {
    if (item.type === "text") return; // no visual tile

    const label = item.label?.trim() || `Summerhouse ${index + 1}`;
    const title = item.title?.trim() || label;
    const story =
      item.text?.trim() || `A quieter frame from the Summerhouse Bali collection — ${label}.`;
    const category = item.category?.trim() || null;
    const houseName = item.property_name?.trim() || null;
    const houseLocation = item.property_location?.trim() || null;
    const propertyId = normalizePropertyId(item.lodgify_property_id);
    const isVideo = item.type === "video";

    const mediaSrc = normalizeMediaSrc(isVideo ? item.video_poster : item.src);
    if (!mediaSrc || seenSrc.has(mediaSrc)) return;
    const videoUrl = isVideo ? normalizeMediaSrc(item.video_url) : null;
    if (isVideo && !videoUrl) return;
    seenSrc.add(mediaSrc);

    result.push({
      id: `cms-gallery-${index}`,
      mediaSrc,
      videoUrl,
      isVideo,
      title,
      story,
      alt: item.alt?.trim() || `${label} ${isVideo ? "video" : "image"} from Summerhouse Bali`,
      category,
      houseName,
      houseLocation,
      propertyId,
      year: extractYear(item.created_at),
      meta: formatMeta(isVideo, item.created_at),
    });
  });

  return result.length ? result : FALLBACK_ENTRIES;
}

/**
 * Memoized by a stable source key so the returned array only changes when the
 * underlying CMS media actually changes.
 */
export function useGalleryEntries(items: CmsGalleryItem[] | null | undefined): GalleryEntry[] {
  const srcKey = useMemo(() => {
    if (!items?.length) return "__fallback__";
    return items
      .map((item) => `${item.type}:${item.src ?? ""}:${item.video_poster ?? ""}:${item.video_url ?? ""}:${item.lodgify_property_id ?? ""}:${item.category ?? ""}`)
      .join("|");
  }, [items]);

  return useMemo(() => normalize(items), [srcKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
