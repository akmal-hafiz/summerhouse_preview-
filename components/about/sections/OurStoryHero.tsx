"use client";

import EditorialPageIntro from "@/components/common/EditorialPageIntro";

const DEFAULT_HEADING = "A quiet expression to modern hospitality";
const LEGACY_LEAD = "Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief: a great stay should feel personal before it looks impressive.";
const DEFAULT_SUMMARY = "Rooted in Bali, Summerhouses brings together considered homes and personal hospitality for stays that feel entirely your own.";

type OurStoryHeroProps = {
  content?: {
    heading?: string;
    summary?: string;
    lead?: string;
  };
};

export default function OurStoryHero({ content }: OurStoryHeroProps) {
  const savedHeading = content?.heading?.trim();
  const heading = savedHeading && savedHeading !== "Our Story." ? savedHeading : DEFAULT_HEADING;
  const savedSummary = content?.summary?.trim();
  const legacyLead = content?.lead?.trim();
  const summary = savedSummary || (legacyLead && legacyLead !== LEGACY_LEAD ? legacyLead : DEFAULT_SUMMARY);
  const useReferenceLines = heading === DEFAULT_HEADING;

  return (
    <EditorialPageIntro
      id="our-story"
      motionRule
      title={heading}
      summary={summary}
      titleLines={useReferenceLines ? ["A quiet", "expression", "to modern", "hospitality"] : undefined}
    />
  );
}
