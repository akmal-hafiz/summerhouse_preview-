"use client";

import { useSearchParams } from "next/navigation";
import PremiumVillaCard from "./PremiumVillaCard";
import type { VillaSearchResult } from "@/lib/lodgify/types";
import { stayFromParams } from "@/lib/promo-param";

type NearbyVillasGridProps = {
  villas: VillaSearchResult[];
  promo: string;
};

export default function NearbyVillasGrid({ villas, promo }: NearbyVillasGridProps) {
  const params = useSearchParams();
  const stay = stayFromParams(Object.fromEntries(params));

  return (
    <div className="villa-detail-related">
      {villas.map((villa) => (
        <PremiumVillaCard
          key={String(villa.id)}
          villa={villa}
          promo={promo}
          stay={stay}
          headingLevel="h3"
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 48vw, 50vw"
        />
      ))}
    </div>
  );
}
