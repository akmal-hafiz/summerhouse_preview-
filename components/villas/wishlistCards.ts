/** Pure helpers for the wishlist cards and the wishlist detail view (no React, so they are tested directly). */

const MAX_COVER_PHOTOS = 3;

/** A wishlist card's cover: the photos of its newest villas that are still in the collection, at most three. */
export function coverPhotos(coverIds: string[], villas: { id: number | string; imageUrl?: string | null }[]): string[] {
  const photos = new Map(villas.map((villa) => [String(villa.id), villa.imageUrl]));
  // Villas without their own photo share one fallback image: show it once.
  return [...new Set(coverIds.map((id) => photos.get(id)).filter((url): url is string => Boolean(url)))].slice(0, MAX_COVER_PHOTOS);
}

/** The villas in one wishlist, newest added to it first; an older cached state without `villaIds` has none yet. */
export function listVillaIds(list: { villaIds?: string[] }): string[] {
  return list.villaIds ?? [];
}
