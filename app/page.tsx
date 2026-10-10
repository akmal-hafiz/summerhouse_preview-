import type { ComponentProps } from "react";
import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";

type HeroProps = NonNullable<ComponentProps<typeof Hero>>;
import Footer from "@/components/common/Footer";
import ExploreBaliSection from "@/components/sections/ExploreBaliSection";
import SignatureVillaSpotlight from "@/components/home/SignatureVillaSpotlight";
import StayStylesShowcase from "@/components/home/StayStylesShowcase";
import WhyStaySection, { type WhyStayContent } from "@/components/home/WhyStaySection";
import GuestStoriesSection from "@/components/testimonials/GuestStoriesSection";
import {
  CMS_LODGIFY_REVALIDATE,
  getCmsSection,
} from "@/lib/cms";
import {
  getHomepageBaliCollections,
  getHomepageSignatureVilla,
  getHomepageStayGroups,
} from "@/lib/lodgify";

export default async function Home() {
  const [
    stayGroups,
    signatureVilla,
    baliCollections,
    heroCms,
    stayStylesCms,
    whyStayCms,
    exploreBaliCms,
  ] = await Promise.all([
    getHomepageStayGroups(),
    getHomepageSignatureVilla(),
    getHomepageBaliCollections(),
    getCmsSection<Record<string, unknown>>("home", "hero"),
    getCmsSection<{
      heading?: string;
      is_visible?: boolean;
    }>("home", "stay_styles", { revalidate: CMS_LODGIFY_REVALIDATE }),
    getCmsSection<WhyStayContent>("home", "why_stay"),
    getCmsSection<{
      kicker?: string;
      title?: string;
      description?: string;
      is_visible?: boolean;
    }>("home", "explore_bali"),
  ]);

  return (
    <div className="summerhouses-main-layout">
      <Navbar />
      <main className="summerhouses-main-content">
        <Hero cms={(heroCms || undefined) as HeroProps["cms"]} />
        <StayStylesShowcase groups={stayGroups} content={stayStylesCms || undefined} />
        <div className="desktop-only">
          <SignatureVillaSpotlight villa={signatureVilla} variant="desktop" />
        </div>
        <div className="mobile-only">
          <SignatureVillaSpotlight villa={signatureVilla} variant="mobile" />
        </div>
        <WhyStaySection content={whyStayCms || undefined} />
        <GuestStoriesSection placement="homepage" />
        <ExploreBaliSection
          collections={baliCollections}
          content={exploreBaliCms || undefined}
        />
      </main>
      <Footer />
    </div>
  );
}
