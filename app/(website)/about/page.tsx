import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import About from "@/components/about/About";
import editorialStyles from "@/components/about/AboutEditorialSections.module.css";
import { getProperties, getPortfolioStats } from "@/lib/lodgify";
import { getCmsBaliCollections, getCmsFaqs, getCmsGalleryItems, getCmsPageSections } from "@/lib/cms";
import { listArticles } from "@/lib/journal";
import { logServerError } from "@/lib/security/logger";
import { summarizeLodgifyDestinations } from "@/lib/lodgify/destinations";
import { baliCollections } from "@/data/baliCollections";
import type { AboutDestination } from "@/components/about/About";

export const metadata = {
  title: "About Summerhouses",
  description: "Discover the story, values, and curated Bali hospitality behind Summerhouses private villa stays.",
};

/** Area character ("Quiet Coast") from the same neighbourhood collections the homepage uses, keyed by location name. */
async function getAreaCharacters(): Promise<Map<string, string>> {
  let collections = baliCollections;
  try {
    const cms = await getCmsBaliCollections();
    if (cms?.length) collections = cms;
  } catch (error) {
    logServerError("[about:area-characters]", error);
  }
  return new Map(collections
    .filter((collection) => collection.location && (collection.category || collection.tag))
    .map((collection) => [collection.location.trim().toLowerCase(), String(collection.category || collection.tag).trim()]));
}

async function getDestinationSummaries(): Promise<AboutDestination[]> {
  let properties: Awaited<ReturnType<typeof getProperties>>;
  const characters = getAreaCharacters();

  try {
    properties = await getProperties();
  } catch (error) {
    logServerError("[about:destinations]", error);
    return [];
  }

  const byName = await characters;
  return summarizeLodgifyDestinations(properties).map((destination) => ({
    ...destination,
    character: byName.get(destination.name.trim().toLowerCase()),
  }));
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
  const [destinations, faqs, journalArticles, gallerySection, cmsContent] = await Promise.all([
    getDestinationSummaries(),
    getCmsFaqs("about"),
    listArticles(),
    getGallerySectionData(),
    getCmsPageSections("about"),
  ]);

  return (
    <div className={editorialStyles.aboutPageShell}>
      <Navbar alwaysSolid={true} />
      <main className={editorialStyles.aboutPageMain}>
        <About
          destinations={destinations}
          faqs={faqs}
          journalArticles={journalArticles}
          portfolioStats={gallerySection.portfolioStats}
          cmsGalleryItems={gallerySection.cmsGalleryItems}
          cmsContent={cmsContent}
        />
      </main>
      <Footer />
    </div>
  );
}
