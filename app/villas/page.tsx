import React, { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import VillaGridLoading from "@/components/villas/VillaGridLoading";
import VillaSearchForm from "@/components/booking/VillaSearchForm";
import PremiumVillaCard from "@/components/villas/PremiumVillaCard";
import { getVillaSearchOptions, searchAvailableVillas } from "@/lib/lodgify";

export const metadata = {
  title: "Villa Collection",
  description: "Explore Summerhouses Bali villas connected to live Lodgify property data.",
};

type VillasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const numberParam = (value: string | string[] | undefined) => {
  const numeric = Number(firstParam(value));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

async function VillaList({ filters }: { filters: Awaited<ReturnType<typeof getFilters>> }) {
  let villas: Awaited<ReturnType<typeof searchAvailableVillas>> = [];

  try {
    villas = await searchAvailableVillas(filters);
  } catch (error) {
    console.error("[villas:list]", {
      message: error instanceof Error ? error.message : "Unknown villa search error",
    });

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
        <PremiumVillaCard key={villa.id} villa={villa} priority={index < 6} />
      ))}
    </div>
  );
}

async function getFilters(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const params = await searchParams;

  return {
    location: firstParam(params.location) || "",
    checkIn: firstParam(params.checkIn) || "",
    checkOut: firstParam(params.checkOut) || "",
    adults: numberParam(params.adults) || 1,
    children: numberParam(params.children) || 0,
    infants: numberParam(params.infants) || 0,
    pets: numberParam(params.pets) || 0,
    minPrice: numberParam(params.minPrice),
    maxPrice: numberParam(params.maxPrice),
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
                Browse live Lodgify homes by location, dates, and guest count, then
                open each villa for details, availability, and the direct booking path.
              </p>
            </div>
          </div>
        </header>

        <section className="villa-collection-toolbar">
          <div className="villa-collection-shell villa-collection-toolbar-inner">
            <div>
              <span>{hasActiveSearch ? "Search results" : "Collection"}</span>
              <strong>{hasActiveSearch ? "Available homes from Lodgify" : "All available homes"}</strong>
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
