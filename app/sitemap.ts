import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/data/articles";
import { getSiteUrl } from "@/lib/site";
import { getVillaSummaries } from "@/lib/lodgify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const villas = await getVillaSummaries();
  const now = new Date();

  return [
    "",
    "/about",
    "/contact",
    "/gallery",
    "/services",
    "/villas",
    ...getAllSlugs().map((slug) => `/journal/${slug}`),
    ...villas.map((villa) => `/villas/${villa.id}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/journal") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/villas" ? 0.9 : 0.7,
  }));
}
