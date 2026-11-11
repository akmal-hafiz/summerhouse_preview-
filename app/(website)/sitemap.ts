import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getVillaSummaries } from "@/lib/lodgify";
import { listArticles } from "@/lib/journal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [villas, articles] = await Promise.all([getVillaSummaries(), listArticles()]);
  const now = new Date();

  return [
    "",
    "/about",
    "/contact",
    "/gallery",
    "/services",
    "/villas",
    "/journal",
    ...articles.map((article) => `/journal/${article.slug}`),
    ...villas.map((villa) => `/villas/${villa.id}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/journal") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/villas" ? 0.9 : 0.7,
  }));
}
