import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";
import Footer from "@/components/common/Footer";
import MobileHomepage from "@/components/home/MobileHomepage";
import DesktopHomepage from "@/components/home/DesktopHomepage";
import {
  getHomepageBaliCollections,
  getHomepageFeaturedVillas,
  getHomepageSignatureVilla,
  getHomepageStayGroups,
} from "@/lib/lodgify";

export default async function Home() {
  const [featuredVillas, stayGroups, signatureVilla, baliCollections] = await Promise.all([
    getHomepageFeaturedVillas(),
    getHomepageStayGroups(),
    getHomepageSignatureVilla(),
    getHomepageBaliCollections(),
  ]);

  return (
    <div className="summerhouses-main-layout">
      <Navbar />
      <main className="summerhouses-main-content">
        <Hero />
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
