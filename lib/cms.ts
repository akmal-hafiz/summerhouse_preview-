import { logServerWarning } from "@/lib/security/logger";
import type { BaliCollectionItem } from "@/data/baliCollections";

const CMS_BASE_URL = process.env.CMS_API_URL || "http://localhost:8000/api";
const DEFAULT_REVALIDATE = 300;
const SUPPRESS_CMS_LOGS = process.env.CMS_SUPPRESS_LOGS === "1" || process.env.NODE_ENV === "production";

type FetchOptions = {
  revalidate?: number;
};

let cmsOfflineWarned = false;

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("fetch failed") ||
    msg.includes("econnrefused") ||
    msg.includes("network") ||
    msg.includes("aborted")
  );
}

async function cmsFetch<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const url = `${CMS_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isNetworkError(error)) {
      if (!cmsOfflineWarned && !SUPPRESS_CMS_LOGS) {
        cmsOfflineWarned = true;
        logServerWarning("[cms] backend offline — falling back to hardcoded defaults", {
          baseUrl: CMS_BASE_URL,
          firstFailedPath: path,
        });
      }
      return null;
    }
    if (!SUPPRESS_CMS_LOGS) {
      const message = error instanceof Error ? error.message : "unknown";
      logServerWarning(`[cms:${path}]`, { message });
    }
    return null;
  }
}

export type CmsHomepageSlots = {
  featured_collection?: Array<{ lodgify_property_id: string; override_title?: string | null; override_description?: string | null }>;
  short_stays?: Array<{ lodgify_property_id: string; override_title?: string | null; override_description?: string | null }>;
  extended_stays?: Array<{ lodgify_property_id: string; override_title?: string | null; override_description?: string | null }>;
  featured_homes?: Array<{ lodgify_property_id: string; override_title?: string | null; override_description?: string | null }>;
  signature?: Array<{ lodgify_property_id: string; override_title?: string | null; override_description?: string | null }>;
};

export type CmsPageContent = Record<string, Record<string, unknown> | null>;

export type CmsArticleSummary = {
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  category?: string | null;
  date?: string | null;
  readTime?: string | null;
  heroImage?: string | null;
  heroAlt?: string | null;
  tags: string[];
  author: { name: string; role?: string | null; bio?: string | null; avatar?: string | null };
};

export type CmsArticle = CmsArticleSummary & {
  content: Array<Record<string, unknown>>;
};

export type CmsTestimonial = {
  author: string;
  location?: string | null;
  stars: number;
  text: string;
  avatar?: string | null;
};

export type CmsFaq = {
  question: string;
  answer: string;
};

export type CmsServiceCard = {
  title: string;
  text: string;
};

export type CmsGalleryItem = {
  type: "image" | "text" | "video";
  src?: string | null;
  alt?: string | null;
  label?: string | null;
  title?: string | null;
  text?: string | null;
  video_url?: string | null;
  video_poster?: string | null;
};

export async function getCmsPageSections(page: string): Promise<CmsPageContent | null> {
  const data = await cmsFetch<{ success: boolean; sections: CmsPageContent }>(`/v1/cms/page/${page}`);
  return data?.success ? data.sections : null;
}

export async function getCmsSection<T = Record<string, unknown>>(page: string, section: string): Promise<T | null> {
  const data = await cmsFetch<{ success: boolean; content: T }>(`/v1/cms/page/${page}/section/${section}`);
  return data?.success ? data.content : null;
}

export async function getHomepageVillaSelections(): Promise<CmsHomepageSlots | null> {
  const data = await cmsFetch<{ success: boolean; slots: CmsHomepageSlots }>("/v1/cms/homepage/villa-selections");
  return data?.success ? data.slots : null;
}

export async function getCmsBaliCollections(): Promise<BaliCollectionItem[] | null> {
  const data = await cmsFetch<{ success: boolean; collections: BaliCollectionItem[] }>("/v1/cms/bali-collections");
  return data?.success ? data.collections : null;
}

export async function getCmsArticles(): Promise<CmsArticleSummary[] | null> {
  const data = await cmsFetch<{ success: boolean; articles: CmsArticleSummary[] }>("/v1/cms/articles");
  return data?.success ? data.articles : null;
}

export async function getCmsArticleBySlug(slug: string): Promise<CmsArticle | null> {
  const safe = encodeURIComponent(slug);
  const data = await cmsFetch<{ success: boolean; article: CmsArticle }>(`/v1/cms/articles/${safe}`);
  return data?.success ? data.article : null;
}

export async function getCmsTestimonials(page: string): Promise<CmsTestimonial[] | null> {
  const data = await cmsFetch<{ success: boolean; testimonials: CmsTestimonial[] }>(`/v1/cms/testimonials/${page}`);
  return data?.success ? data.testimonials : null;
}

export async function getCmsFaqs(page: string): Promise<CmsFaq[] | null> {
  const data = await cmsFetch<{ success: boolean; faqs: CmsFaq[] }>(`/v1/cms/faqs/${page}`);
  return data?.success ? data.faqs : null;
}

export async function getCmsServiceCards(category: "operational" | "marketing" | "project"): Promise<CmsServiceCard[] | null> {
  const data = await cmsFetch<{ success: boolean; cards: CmsServiceCard[] }>(`/v1/cms/service-cards/${category}`);
  return data?.success ? data.cards : null;
}

export async function getCmsGalleryItems(): Promise<CmsGalleryItem[] | null> {
  const data = await cmsFetch<{ success: boolean; items: CmsGalleryItem[] }>("/v1/cms/gallery");
  return data?.success ? data.items : null;
}

export async function getCmsSetting<T = unknown>(key: string): Promise<T | null> {
  const data = await cmsFetch<{ success: boolean; value: T }>(`/v1/cms/settings/${encodeURIComponent(key)}`);
  return data?.success ? data.value : null;
}

export function getHomepageSlotIds(slots: CmsHomepageSlots | null, slot: keyof CmsHomepageSlots): string[] {
  return slots?.[slot]?.map((row) => row.lodgify_property_id) ?? [];
}
