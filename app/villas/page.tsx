import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import VillaGridLoading from "@/components/villas/VillaGridLoading";
import VillaSearchForm from "@/components/booking/VillaSearchForm";
import { getVillaSearchOptions, searchAvailableVillas } from "@/lib/lodgify";

export const metadata = {
  title: "Villa Collection | Summerhouse Bali",
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
  const villas = await searchAvailableVillas(filters);

  if (villas.length === 0) {
    return (
      <div className="villa-collection-empty">
        <p>No villas match those dates yet. Try another stay window or location.</p>
      </div>
    );
  }

  return (
    <div className="villa-collection-grid">
      {villas.map((villa, index) => (
        <VillaCard key={villa.id} villa={villa} index={index} />
      ))}
    </div>
  );
}

function VillaCard({ villa, index }: { villa: any; index: number }) {
  const facts = [
    villa.guests ? `${villa.guests} guests` : null,
    villa.bedrooms ? `${villa.bedrooms} beds` : null,
    villa.bathrooms ? `${villa.bathrooms} bath` : null,
  ].filter(Boolean);
  const amenities = Array.isArray(villa.amenitiesPreview) ? villa.amenitiesPreview.filter(Boolean).slice(0, 4) : [];

  return (
    <article className={`villa-collection-card villa-collection-card--airbnb ${index === 0 ? "villa-collection-card-featured" : ""}`}>
      <Link href={`/villas/${villa.id}`} className="villa-collection-card-link">
        <figure className="villa-collection-card-media">
          <Image
            src={villa.imageUrl}
            alt={villa.name}
            fill
            priority={index < 3}
            sizes={index === 0 ? "(min-width: 1024px) 62vw, 100vw" : "(min-width: 1024px) 31vw, 100vw"}
            className="villa-collection-card-image"
            unoptimized
          />
          <span className="villa-collection-card-action">View villa</span>
        </figure>

        <div className="villa-collection-card-body">
          <div className="villa-collection-card-title-row">
            <h2>{villa.name}</h2>
            {villa.rating > 0 && (
              <span className="villa-collection-card-rating">
                <span aria-hidden="true">★</span> {villa.rating}
              </span>
            )}
          </div>
          <div className="villa-collection-card-meta">
            <span>Villa</span>
            {facts.length > 0 ? facts.map((fact) => <span key={fact}>{fact}</span>) : <span>Details inside</span>}
          </div>
          {amenities.length > 0 && (
            <p className="villa-collection-card-amenities">{amenities.join(" · ")}</p>
          )}
          <p className="villa-collection-card-price">
            {villa.priceLabel ? (
              <>
                from <strong>{villa.priceLabel}</strong> per night
              </>
            ) : (
              "Rate on request"
            )}
          </p>
        </div>
      </Link>
    </article>
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
  const [filters, options] = await Promise.all([
    getFilters(searchParams),
    getVillaSearchOptions(),
  ]);
  const hasActiveSearch = Boolean(filters.location || filters.checkIn || filters.checkOut || filters.children || filters.minPrice || filters.maxPrice);

  return (
    <div className="villa-collection-page">
      <Navbar />

      <main>
        <header className="villa-collection-hero">
          <div className="villa-collection-shell">
            <div className="villa-collection-hero-copy">
              <p className="villa-collection-eyebrow">Summerhouses Bali</p>
              <h1>Private villas, selected for a slower island rhythm.</h1>
              <p>
                Browse homes connected to live Lodgify inventory, then open each villa
                for details, amenities, location, and the direct booking path.
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
          </div>
        </section>

        <section className="villa-collection-search">
          <div className="villa-collection-shell">
            <VillaSearchForm
              variant="listing"
              initialValues={filters}
              locations={options.locations}
            />
          </div>
        </section>

        <section className="villa-collection-list">
          <div className="villa-collection-shell">
            <Suspense fallback={<VillaGridLoading />}>
              <VillaList filters={filters} />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
