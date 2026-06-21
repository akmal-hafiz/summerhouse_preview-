import type { ComponentProps } from "react";
import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";

type HeroProps = NonNullable<ComponentProps<typeof Hero>>;
import Footer from "@/components/common/Footer";
import MobileHomepage from "@/components/home/MobileHomepage";
import DesktopHomepage from "@/components/home/DesktopHomepage";
import { getCmsPageSections } from "@/lib/cms";
import {
  getHomepageBaliCollections,
  getHomepageFeaturedVillas,
  getHomepageSignatureVilla,
  getHomepageStayGroups,
} from "@/lib/lodgify";

export default async function Home() {
  const [featuredVillas, stayGroups, signatureVilla, baliCollections, cmsSections] = await Promise.all([
    getHomepageFeaturedVillas(),
    getHomepageStayGroups(),
    getHomepageSignatureVilla(),
    getHomepageBaliCollections(),
    getCmsPageSections("home"),
  ]);

  const heroCms = cmsSections?.hero as Record<string, unknown> | undefined;

  return (
    <div className="summerhouses-main-layout">
      <Navbar />
      <main className="summerhouses-main-content">
        <Hero cms={heroCms as HeroProps["cms"]} />
        {/* Desktop Layout Showcase */}
        <div className="desktop-only">
          <DesktopHomepage
            featuredVillas={featuredVillas}
            stayGroups={stayGroups}
            signatureVilla={signatureVilla}
            baliCollections={baliCollections}
          />
        </div>
        {/* Premium 1:1 Stitch Mobile Homepage Canvas */}
        <div className="mobile-only">
          <MobileHomepage
            featuredVillas={featuredVillas}
            stayGroups={stayGroups}
            signatureVilla={signatureVilla}
            baliCollections={baliCollections}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
