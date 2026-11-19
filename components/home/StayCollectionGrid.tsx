"use client";

import PremiumVillaCard from "@/components/villas/PremiumVillaCard";
import type { HomepageStayVilla, VillaSearchResult } from "@/lib/lodgify/types";
import styles from "./StayCollectionGrid.module.css";

type StayCollectionGridProps = {
  villas: HomepageStayVilla[];
};

// The homepage selection carries no live availability, so the card shows no availability note.
function toCardVilla(villa: HomepageStayVilla): VillaSearchResult {
  return {
    id: villa.id,
    name: villa.name.split("|")[0]?.trim() || villa.name,
    location: villa.location,
    description: villa.description,
    imageUrl: villa.imageUrl,
    priceLabel: villa.priceLabel,
    originalPriceLabel: null,
    priceValue: villa.priceValue,
    currencyCode: "",
    isFeatured: false,
    guests: villa.guests,
    bedrooms: villa.bedrooms,
    bathrooms: villa.bathrooms,
    capacity: villa.guests || 0,
    amenitiesPreview: villa.amenitiesPreview,
    rating: 0,
    isAvailableForSearch: true,
    availabilityStatus: "unknown",
    availabilityReason: "not_checked",
  };
}

// Below the homepage hero, so no card takes image priority from the hero poster.
const CARD_SIZES = "(min-width: 961px) 30vw, (min-width: 721px) 44vw, 80vw";

export default function StayCollectionGrid({ villas }: StayCollectionGridProps) {
  const displayVillas = villas.slice(0, 6);
  const rows = [displayVillas.slice(0, 3), displayVillas.slice(3, 6)].filter((row) => row.length > 0);

  return (
    <div className={styles.gridContainer}>
      {rows.map((row, index) => (
        <div key={index} className={styles.scrollRow}>
          {row.map((villa) => (
            <div key={String(villa.id)} className={styles.item}>
              <PremiumVillaCard villa={toCardVilla(villa)} sizes={CARD_SIZES} headingLevel="h3" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
