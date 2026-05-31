import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";
import Footer from "@/components/common/Footer";
import MobileHomepage from "@/components/home/MobileHomepage";
import DesktopHomepage from "@/components/home/DesktopHomepage";

export default function Home() {
  return (
    <div className="summerhouses-main-layout">
      <Navbar />
      <main className="summerhouses-main-content">
        <Hero />
        {/* Desktop Layout Showcase */}
        <div className="desktop-only">
          <DesktopHomepage />
        </div>
        {/* Premium 1:1 Stitch Mobile Homepage Canvas */}
        <div className="mobile-only">
          <MobileHomepage />
        </div>
      </main>
      <Footer />
    </div>
  );
}
