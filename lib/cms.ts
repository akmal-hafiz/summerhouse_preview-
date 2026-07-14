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

export type ReviewSource =
  | "manual"
  | "guest_submission"
  | "lodgify"
  | "airbnb"
  | "booking_com"
  | "vrbo"
  | "google"
  | "other";

export type CmsTestimonial = {
  author: string;
  location?: string | null;
  stars: number;
  text: string;
  avatar?: string | null;
  source?: ReviewSource | null;
  sourceLabel?: string | null;
  isVerified?: boolean;
  reviewDate?: string | null;
  villaName?: string | null;
  villaLocation?: string | null;
};

export type CmsVillaReview = {
  id: string;
  villaLodgifyId?: string | null;
  villaName?: string | null;
  villaLocation?: string | null;
  reviewerName: string;
  reviewerLocation?: string | null;
  reviewerAvatarUrl?: string | null;
  title?: string | null;
  comment: string;
  rating?: number | null;
  source: ReviewSource;
  sourceLabel?: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  reviewDate?: string | null;
  stayDate?: string | null;
  publishedAt?: string | null;
};

export type CmsOwnerTestimonial = {
  owner: string;
  role?: string | null;
  villaName?: string | null;
  quote: string;
  metrics: Array<{ label: string; value: string }>;
  avatar?: string | null;
  villaImage?: string | null;
  isVerified: boolean;
};

export type CmsVillaReviewSummary = {
  average_rating: number | null;
  rated_count: number;
  total_count: number;
  verified_count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
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
  /** Editorial filter tab this item belongs to (admin-defined, optional). */
  category?: string | null;
  title?: string | null;
  text?: string | null;
  video_url?: string | null;
  video_poster?: string | null;
  /** Lodgify property this post is tagged to (optional). */
  lodgify_property_id?: string | null;
  property_name?: string | null;
  property_location?: string | null;
  created_at?: string | null;
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

export async function getCmsOwnerTestimonials(): Promise<CmsOwnerTestimonial[] | null> {
  const data = await cmsFetch<{ success: boolean; testimonials: CmsOwnerTestimonial[] }>(
    "/v1/cms/testimonials/services",
  );
  return data?.success ? data.testimonials : null;
}

export type OwnerTestimonialSubmission = {
  author: string;
  reviewer_email?: string;
  owner_role?: string;
  villa_name?: string;
  lodgify_property_id?: string;
  text: string;
};

export async function submitOwnerTestimonial(payload: OwnerTestimonialSubmission): Promise<ReviewSubmissionResult> {
  const url = `${CMS_BASE_URL}/v1/owner-testimonials`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      return { success: true, message: data.message ?? "Testimonial received." };
    }

    if (response.status === 422 && data?.errors) {
      return { success: false, error: "Some fields need adjusting.", fieldErrors: data.errors };
    }

    return {
      success: false,
      error: (data?.error as string) ?? "Something went wrong. Please try again shortly.",
    };
  } catch {
    return { success: false, error: "Network error. Please try again shortly." };
  }
}

export type CmsVillaReviewPayload = {
  summary: CmsVillaReviewSummary;
  reviews: CmsVillaReview[];
};

export async function getCmsVillaReviews(lodgifyId: string): Promise<CmsVillaReviewPayload | null> {
  const safe = encodeURIComponent(lodgifyId);
  const data = await cmsFetch<{ success: boolean; summary: CmsVillaReviewSummary; reviews: CmsVillaReview[] }>(
    `/v1/cms/villas/${safe}/reviews`,
    { revalidate: 120 },
  );
  return data?.success ? { summary: data.summary, reviews: data.reviews } : null;
}

export type PublicReviewSubmission = {
  lodgify_property_id: string;
  author: string;
  reviewer_email?: string;
  location?: string;
  title?: string;
  text: string;
  stars: number;
  stay_date?: string;
};

export type ReviewSubmissionResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitVillaReview(payload: PublicReviewSubmission): Promise<ReviewSubmissionResult> {
  const url = `${CMS_BASE_URL}/v1/reviews`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      return { success: true, message: data.message ?? "Review received." };
    }

    if (response.status === 422 && data?.errors) {
      return { success: false, error: "Some fields need adjusting.", fieldErrors: data.errors };
    }

    return {
      success: false,
      error: (data?.error as string) ?? "Something went wrong. Please try again shortly.",
    };
  } catch {
    return { success: false, error: "Network error. Please try again shortly." };
  }
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
