import { baliCollections } from "@/data/baliCollections";
import {
  getCmsDestinationBySlug,
  type CmsDestination,
  type CmsDestinationChapter,
} from "@/lib/cms";

function fallbackChapters(destination: (typeof baliCollections)[number]): CmsDestinationChapter[] {
  const pillars = destination.lifestylePillars?.length
    ? destination.lifestylePillars
    : destination.highlights.slice(0, 3).map((title) => ({
        title,
        description: `${title} is part of the everyday character that makes ${destination.location} worth exploring slowly.`,
      }));

  return pillars.map((pillar, index) => ({
    eyebrow: `${String(index + 1).padStart(2, "0")} / Field note`,
    title: pillar.title,
    description: pillar.description,
    image: destination.galleryImages[index % destination.galleryImages.length] || destination.image,
    image_alt: `${pillar.title} in ${destination.location}`,
  }));
}

function toFallbackDestination(
  destination: (typeof baliCollections)[number],
): CmsDestination {
  return {
    ...destination,
    mediaType: destination.mediaType || "image",
    href: `/destinations/${destination.id}`,
    eyebrow: "Bali Destination Guide",
    heroTitle: destination.location,
    introduction: destination.description,
    heroMediaType: "image",
    heroImage: destination.image,
    heroVideoPoster: destination.image,
    editorialGallery: destination.galleryImages.map((image, index) => ({
      image,
      alt: `${destination.location} field note ${index + 1}`,
    })),
    editorialChapters: fallbackChapters(destination),
    relatedJournalTags: destination.moods,
    lodgifyLocation: destination.location,
    showRelatedVillas: true,
    relatedVillasHeading: `Stay in ${destination.location}`,
    seoTitle: `${destination.location} Guide`,
    seoDescription: destination.description,
    socialImage: destination.image,
  };
}

export async function getDestinationBySlug(slug: string): Promise<CmsDestination | null> {
  const fromCms = await getCmsDestinationBySlug(slug);
  if (fromCms) return fromCms;

  const fallback = baliCollections.find((destination) => destination.id === slug);
  return fallback ? toFallbackDestination(fallback) : null;
}

export function getFallbackDestinationSlugs(): string[] {
  return baliCollections.map((destination) => destination.id);
}
