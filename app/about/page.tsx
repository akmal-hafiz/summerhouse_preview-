import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import About from "@/components/about/About";
import editorialStyles from "@/components/about/AboutEditorialSections.module.css";
import { getProperties, getPortfolioStats } from "@/lib/lodgify";
import { getCmsFaqs, getCmsGalleryItems, getCmsTestimonials } from "@/lib/cms";
import { listArticles } from "@/lib/journal";
import { logServerError } from "@/lib/security/logger";

export const metadata = {
  title: "About Summerhouses",
  description: "Discover the story, values, and curated Bali hospitality behind Summerhouses private villa stays.",
};

type DestinationSummary = {
  name: string;
  villas: number;
  latitude?: number;
  longitude?: number;
};

async function getDestinationSummaries(): Promise<DestinationSummary[]> {
  let properties: Awaited<ReturnType<typeof getProperties>>;

  try {
    properties = await getProperties();
  } catch (error) {
    logServerError("[about:destinations]", error);
    return [];
  }

  const grouped = new Map<string, { villas: number; latitudeTotal: number; longitudeTotal: number; coordinateCount: number }>();

  properties
    .filter((property) => property.is_active !== false)
    .forEach((property) => {
      const name = property.city || property.state || property.country || "Bali";
      const current = grouped.get(name) || {
        villas: 0,
        latitudeTotal: 0,
        longitudeTotal: 0,
        coordinateCount: 0,
      };

      current.villas += 1;

      if (typeof property.latitude === "number" && typeof property.longitude === "number") {
        current.latitudeTotal += property.latitude;
        current.longitudeTotal += property.longitude;
        current.coordinateCount += 1;
      }

      grouped.set(name, current);
    });

  const priority = ["Canggu", "Canggu - Berawa", "Canggu - Padonan", "Pererenan", "Ubud", "Umalas", "Kerobokan", "Legian"];

  return Array.from(grouped.entries())
    .map(([name, value]) => ({
      name,
      villas: value.villas,
      latitude: value.coordinateCount ? value.latitudeTotal / value.coordinateCount : undefined,
      longitude: value.coordinateCount ? value.longitudeTotal / value.coordinateCount : undefined,
    }))
    .sort((a, b) => {
      const aIndex = priority.indexOf(a.name);
      const bIndex = priority.indexOf(b.name);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      return b.villas - a.villas;
    })
    .slice(0, 8);
}

async function getGallerySectionData() {
  const [portfolioStatsResult, cmsGalleryResult] = await Promise.allSettled([
    getPortfolioStats(),
    getCmsGalleryItems(),
  ]);

  const portfolioStats =
    portfolioStatsResult.status === "fulfilled"
      ? portfolioStatsResult.value
      : (logServerError("[about:portfolio-stats]", portfolioStatsResult.reason), { homesCount: null as number | null });

  const cmsGalleryItems =
    cmsGalleryResult.status === "fulfilled"
      ? cmsGalleryResult.value ?? []
      : (logServerError("[about:cms-gallery]", cmsGalleryResult.reason), []);

  return { portfolioStats, cmsGalleryItems };
}

export default async function AboutPage() {
  const [destinations, testimonials, faqs, journalArticles, gallerySection] = await Promise.all([
    getDestinationSummaries(),
    getCmsTestimonials("about"),
    getCmsFaqs("about"),
    listArticles(),
    getGallerySectionData(),
  ]);

  return (
    <div className={editorialStyles.aboutPageShell}>
      <Navbar alwaysSolid={true} />
      <main className={editorialStyles.aboutPageMain}>
        <About
          destinations={destinations}
          testimonials={testimonials}
          faqs={faqs}
          journalArticles={journalArticles}
          portfolioStats={gallerySection.portfolioStats}
          cmsGalleryItems={gallerySection.cmsGalleryItems}
        />
      </main>
      <Footer />
    </div>
  );
}
