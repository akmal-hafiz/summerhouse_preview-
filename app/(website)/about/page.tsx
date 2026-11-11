import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import About from "@/components/about/About";
import editorialStyles from "@/components/about/AboutEditorialSections.module.css";
import { getProperties, getPortfolioStats } from "@/lib/lodgify";
import { getCmsFaqs, getCmsGalleryItems, getCmsPageSections } from "@/lib/cms";
import { listArticles } from "@/lib/journal";
import { logServerError } from "@/lib/security/logger";
import { summarizeLodgifyDestinations, type LodgifyDestinationSummary } from "@/lib/lodgify/destinations";

export const metadata = {
  title: "About Summerhouses",
  description: "Discover the story, values, and curated Bali hospitality behind Summerhouses private villa stays.",
};

async function getDestinationSummaries(): Promise<LodgifyDestinationSummary[]> {
  let properties: Awaited<ReturnType<typeof getProperties>>;

  try {
    properties = await getProperties();
  } catch (error) {
    logServerError("[about:destinations]", error);
    return [];
  }

  return summarizeLodgifyDestinations(properties);
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
