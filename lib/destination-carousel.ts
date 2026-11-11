import type { BaliCollectionItem } from "@/data/baliCollections";

export function nextCarouselIndex(current: number, direction: -1 | 1, total: number): number {
  if (total <= 0) return -1;
  const safeCurrent = current >= 0 && current < total ? current : 0;
  return (safeCurrent + direction + total) % total;
}

export function safeDestinationHref(href: string, location: string): string {
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;
  return `/villas?location=${encodeURIComponent(location)}&match=exact`;
}
/** Fill the mosaic from this destination only, repeating its photos when necessary. */
export function destinationMosaicImages(collection: Pick<BaliCollectionItem, "image" | "galleryImages" | "videoPoster" | "mobilePoster">): string[] {
  const images = [...new Set([collection.image, ...(collection.galleryImages ?? []), collection.videoPoster, collection.mobilePoster]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0))];
  if (!images.length) images.push("/homepage_villa/curated-1-main.webp");
  return Array.from({ length: 4 }, (_, index) => images[index % images.length]);
}
