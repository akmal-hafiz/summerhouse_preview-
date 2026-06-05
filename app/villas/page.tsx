import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import VillaGridLoading from "@/components/villas/VillaGridLoading";
import VillaSearchForm from "@/components/booking/VillaSearchForm";
import PremiumVillaCard from "@/components/villas/PremiumVillaCard";
import { getVillaSearchOptions, searchAvailableVillas } from "@/lib/lodgify";
import { isISODate, isValidDateRange } from "@/lib/date";
import { clampInteger, safeString } from "@/lib/security/validation";
import { logServerError } from "@/lib/security/logger";

export const metadata = {
  title: "Villa Collection",
  description: "Explore private Summerhouses Bali villas by location, dates, guests, photos, amenities, and availability.",
};

type VillasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const numberParam = (value: string | string[] | undefined, min = 0, max = 40) => {
  const numeric = Number(firstParam(value));
  if (!Number.isFinite(numeric)) return undefined;
  return clampInteger(numeric, min, max, min);
};

async function VillaList({ filters }: { filters: Awaited<ReturnType<typeof getFilters>> }) {
  let villas: Awaited<ReturnType<typeof searchAvailableVillas>> = [];

  try {
    villas = await searchAvailableVillas(filters);
  } catch (error) {
    logServerError("[villas:list]", error);

    return (
      <div className="villa-collection-empty villa-collection-empty--error">
        <p>We could not refresh live villa availability right now. Please try again in a moment.</p>
        <Link href="/villas">Reload villa collection</Link>
      </div>
    );
  }

  if (villas.length === 0) {
    return (
      <div className="villa-collection-empty">
        <p>No villas match those dates yet. Try another stay window or location.</p>
        <Link href="/villas">Clear filters</Link>
      </div>
    );
  }

  return (
    <div className="villa-collection-grid">
      {villas.map((villa, index) => (
        <PremiumVillaCard key={villa.id} villa={villa} priority={index < 3} />
      ))}
    </div>
  );
}

async function getFilters(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const params = await searchParams;
  const checkIn = firstParam(params.checkIn) || "";
  const checkOut = firstParam(params.checkOut) || "";
  const hasValidRange = isValidDateRange(checkIn, checkOut);

  return {
    location: safeString(firstParam(params.location), 80),
    checkIn: hasValidRange || isISODate(checkIn) ? checkIn : "",
    checkOut: hasValidRange ? checkOut : "",
    adults: numberParam(params.adults, 1, 40) || 1,
    children: numberParam(params.children, 0, 20) || 0,
    infants: numberParam(params.infants, 0, 10) || 0,
    pets: numberParam(params.pets, 0, 10) || 0,
    minPrice: numberParam(params.minPrice, 0, 1_000_000_000),
    maxPrice: numberParam(params.maxPrice, 0, 1_000_000_000),
  };
}

export default async function VillasPage({ searchParams }: VillasPageProps) {
  const [filters, optionsResult] = await Promise.allSettled([
    getFilters(searchParams),
    getVillaSearchOptions(),
  ]);
  const resolvedFilters = filters.status === "fulfilled" ? filters.value : {
    location: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
    minPrice: undefined,
    maxPrice: undefined,
  };
  const options = optionsResult.status === "fulfilled" ? optionsResult.value : { locations: [], priceRange: { min: null, max: null } };
  const hasActiveSearch = Boolean(resolvedFilters.location || resolvedFilters.checkIn || resolvedFilters.checkOut || resolvedFilters.children || resolvedFilters.minPrice || resolvedFilters.maxPrice);

  return (
    <div className="villa-collection-page">
      <Navbar />

      <main>
        <header className="villa-collection-hero">
          <div className="villa-collection-shell">
            <div className="villa-collection-hero-copy">
              <p className="villa-collection-eyebrow">Summerhouses Bali</p>
              <h1>Find a villa that fits your journey.</h1>
              <p>
                Explore private Bali stays by neighborhood, dates, and guests, then
                open each villa to see photos, amenities, availability, and reserve with ease.
              </p>
            </div>
          </div>
        </header>

        <section className="villa-collection-toolbar">
          <div className="villa-collection-shell villa-collection-toolbar-inner">
            <div>
              <span>{hasActiveSearch ? "Search results" : "Collection"}</span>
              <strong>{hasActiveSearch ? "Stays that match your trip" : "All available stays"}</strong>
            </div>
            <Link href="/saved-villas">Saved villas</Link>
          </div>
        </section>

        <section className="villa-collection-search">
          <div className="villa-collection-shell">
            <VillaSearchForm
              variant="listing"
              initialValues={resolvedFilters}
              locations={options.locations}
            />
          </div>
        </section>

        <section className="villa-collection-list">
          <div className="villa-collection-shell">
            <Suspense fallback={<VillaGridLoading />}>
              <VillaList filters={resolvedFilters} />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
