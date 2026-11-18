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
  /** Gallery collection (filter tab) this entry belongs to, and that collection's sort key. */
  category: string | null;
  categoryOrder?: string | null;
  /** Width / height of the media when known; otherwise the tile measures the image once it loads. */
  ratio?: number | null;
  /** House this post is tagged to (from the linked Lodgify property). */
  houseName: string | null;
  houseLocation: string | null;
  propertyId: string | null;
  /** Four-digit year derived from created_at, when available. */
  year: string | null;
  /** e.g. "Film · June 2026" */
  meta: string;
};

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
  // Owner decision 2026-11-18: no built-in fallback photos; an empty CMS gallery shows the empty state.
  if (!items?.length) return [];

  const seenSrc = new Set<string>();
  const result: GalleryEntry[] = [];

  items.forEach((item, index) => {
    if (item.type === "text") return; // no visual tile

    const label = item.label?.trim() || `Summerhouse ${index + 1}`;
    const title = item.title?.trim() || label;
    const story =
      item.text?.trim() || `A quieter frame from the Summerhouse Bali collection: ${label}.`;
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
      id: `cms-gallery-${item.id ?? index}`,
      mediaSrc,
      videoUrl,
      isVideo,
      title,
      story,
      alt: item.alt?.trim() || `${label} ${isVideo ? "video" : "image"} from Summerhouse Bali`,
      category,
      categoryOrder: item.category_order ?? null,
      ratio: item.width && item.height ? item.width / item.height : null,
      houseName,
      houseLocation,
      propertyId,
      year: extractYear(item.created_at),
      meta: formatMeta(isVideo, item.created_at),
    });
  });

  return result;
}

/**
 * Memoized by a stable source key so the returned array only changes when the
 * underlying CMS media actually changes.
 */
export function useGalleryEntries(items: CmsGalleryItem[] | null | undefined): GalleryEntry[] {
  const srcKey = useMemo(() => {
    if (!items?.length) return "__empty__";
    return items
      .map((item) => `${item.id ?? ""}:${item.type}:${item.src ?? ""}:${item.video_poster ?? ""}:${item.video_url ?? ""}:${item.lodgify_property_id ?? ""}:${item.category ?? ""}:${item.category_order ?? ""}:${item.width ?? ""}x${item.height ?? ""}:${item.title ?? ""}:${item.text ?? ""}:${item.alt ?? ""}`)
      .join("|");
  }, [items]);

  return useMemo(() => normalize(items), [srcKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
