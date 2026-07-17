"use client";

import ExploreBaliBookSection from "@/components/sections/ExploreBaliBookSection";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import SignatureVillaSpotlight from "@/components/home/SignatureVillaSpotlight";
import StayStylesShowcase from "@/components/home/StayStylesShowcase";
import type { BaliCollectionItem } from "@/data/baliCollections";
import type { FeaturedCollectionVilla, HomepageStayGroup, SignatureVilla } from "@/lib/lodgify/types";

type DesktopHomepageProps = {
  featuredVillas: FeaturedCollectionVilla[];
  stayGroups: HomepageStayGroup[];
  signatureVilla: SignatureVilla | null;
  baliCollections: BaliCollectionItem[];
};

export default function DesktopHomepage({
  featuredVillas,
  stayGroups,
  signatureVilla,
  baliCollections,
}: DesktopHomepageProps) {
  return (
    <div className="desktop-homepage-container">
      <StayStylesShowcase groups={stayGroups} variant="desktop" />
      <SignatureVillaSpotlight villa={signatureVilla} variant="desktop" />
      <FeaturedCollection villas={featuredVillas} variant="desktop" />
      <ExploreBaliBookSection collections={baliCollections} />
    </div>
  );
}
