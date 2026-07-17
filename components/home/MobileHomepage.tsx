"use client";

import ExploreBaliBookSection from "@/components/sections/ExploreBaliBookSection";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import SignatureVillaSpotlight from "@/components/home/SignatureVillaSpotlight";
import StayStylesShowcase from "@/components/home/StayStylesShowcase";
import type { BaliCollectionItem } from "@/data/baliCollections";
import type { FeaturedCollectionVilla, HomepageStayGroup, SignatureVilla } from "@/lib/lodgify/types";

type MobileHomepageProps = {
  featuredVillas: FeaturedCollectionVilla[];
  stayGroups: HomepageStayGroup[];
  signatureVilla: SignatureVilla | null;
  baliCollections: BaliCollectionItem[];
};

export default function MobileHomepage({
  featuredVillas,
  stayGroups,
  signatureVilla,
  baliCollections,
}: MobileHomepageProps) {
  return (
    <div className="mobile-homepage-container">
      <StayStylesShowcase groups={stayGroups} variant="mobile" />
      <SignatureVillaSpotlight villa={signatureVilla} variant="mobile" />
      <FeaturedCollection villas={featuredVillas} variant="mobile" />
      <ExploreBaliBookSection staticFallback collections={baliCollections} />
    </div>
  );
}
