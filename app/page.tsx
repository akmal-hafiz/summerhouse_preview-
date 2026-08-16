import type { ComponentProps } from "react";
import Navbar from "@/components/common/Navbar";
import Hero from "@/components/home/Hero";

type HeroProps = NonNullable<ComponentProps<typeof Hero>>;
import Footer from "@/components/common/Footer";
import ExploreBaliBookSection from "@/components/sections/ExploreBaliBookSection";
import SignatureVillaSpotlight from "@/components/home/SignatureVillaSpotlight";
import StayStylesShowcase from "@/components/home/StayStylesShowcase";
import WhyStaySection, { type WhyStayContent } from "@/components/home/WhyStaySection";
import GuestStoriesSection from "@/components/testimonials/GuestStoriesSection";
import {
  CMS_LODGIFY_REVALIDATE,
  getCmsSection,
  getCmsTestimonials,
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
    testimonialCms,
    exploreBaliCms,
    testimonials,
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
      eyebrow?: string;
      title?: string;
      title_emphasis?: string;
      trust_label?: string;
      supporting_copy?: string;
      is_visible?: boolean;
    }>("home", "testimonials"),
    getCmsSection<{
      kicker?: string;
      title?: string;
      description?: string;
      is_visible?: boolean;
    }>("home", "explore_bali"),
    getCmsTestimonials("home"),
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
        <GuestStoriesSection
          testimonials={testimonials}
          placement="homepage"
          content={testimonialCms || undefined}
        />
        <ExploreBaliBookSection
          collections={baliCollections}
          content={exploreBaliCms || undefined}
        />
      </main>
      <Footer />
    </div>
  );
}
