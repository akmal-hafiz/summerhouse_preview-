import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import VillaAmenities from "@/components/booking/VillaAmenities";
import VillaPhotoGallery from "@/components/booking/VillaPhotoGallery";
import { getVillaDetail, getVillaSummaries } from "@/lib/lodgify";

interface VillaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const villa = await getVillaDetail(id);

  return {
    title: `${villa?.name || "Villa"} | Summerhouse Bali`,
    description: villa?.descriptionText || "Explore this Summerhouses Bali villa.",
  };
}

export default async function VillaDetailPage({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const [villa, summaries] = await Promise.all([
    getVillaDetail(id),
    getVillaSummaries(),
  ]);

  if (!villa) {
    return (
      <main className="villa-detail-page">
        <Navbar />
        <section className="villa-detail-missing">
          <h1>Villa not found</h1>
          <Link href="/villas">Back to villa collection</Link>
        </section>
        <Footer />
      </main>
    );
  }

  const related = summaries.filter((item) => item.id !== villa.id).slice(0, 3);
  const amenitiesPreview = Array.isArray(villa.amenitiesPreview) ? villa.amenitiesPreview.filter(Boolean).slice(0, 6) : [];
  const photos = Array.isArray(villa.imageGallery) && villa.imageGallery.length > 0
    ? villa.imageGallery
    : [{ url: villa.imageUrl, caption: villa.name }];
  const mapQuery = villa.latitude && villa.longitude
    ? `${villa.latitude},${villa.longitude}`
    : `${villa.address || villa.city}, Indonesia`;

  return (
    <main className="villa-detail-page">
      <Navbar />

      <section className="villa-detail-hero">
        <div className="villa-detail-shell">
          <div className="villa-detail-hero-copy">
            <Link href="/villas" className="villa-detail-back">Villa collection</Link>
            <h1>{villa.name}</h1>
            <p className="villa-detail-location-line">{villa.address || `${villa.city}, ${villa.country}`}</p>
            <div className="villa-detail-facts" aria-label="Villa quick facts">
              <span>{villa.guests} guests</span>
              <span>{villa.bedrooms} beds</span>
              <span>{villa.bathrooms} bath</span>
              {villa.priceLabel && <span>from {villa.priceLabel} / night</span>}
            </div>
          </div>

          <VillaPhotoGallery villaName={villa.name} photos={photos} />
        </div>
      </section>

      <section className="villa-detail-body">
        <div className="villa-detail-shell villa-detail-airbnb-layout">
          <article className="villa-detail-content">
            <section className="villa-detail-section villa-detail-intro">
              <div className="villa-detail-host-line">
                <div>
                  <h2>Entire villa in {villa.city || "Bali"}</h2>
                  <p>{villa.guests} guests - {villa.bedrooms} beds - {villa.bathrooms} bath</p>
                </div>
              </div>
              <div
                className="villa-detail-description"
                dangerouslySetInnerHTML={{ __html: villa.descriptionHtml }}
              />
            </section>

            <section className="villa-detail-section">
              <div className="villa-detail-section-heading">
                <h2>What this place offers</h2>
              </div>
              <VillaAmenities groups={villa.amenityGroups || []} preview={amenitiesPreview} />
            </section>

            <section className="villa-detail-section">
              <div className="villa-detail-section-heading">
                <h2>Where you'll be</h2>
                <p>{villa.address || `${villa.city}, ${villa.country}`}</p>
              </div>
              <div className="villa-detail-map">
                <iframe
                  title={`${villa.name} map`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                />
              </div>
            </section>
          </article>

          <aside className="villa-detail-reserve-card">
            <div>
              <span>Starting from</span>
              <strong>{villa.priceLabel || "Rate on request"}</strong>
              <p>per night before final Lodgify fees and taxes</p>
            </div>
            <a href="#availability">Check availability</a>
            <small>Dates, minimum stay, and payment are confirmed by Lodgify.</small>
          </aside>
        </div>

        <div className="villa-detail-shell">
          <article className="villa-detail-content">
            <AvailabilityCalendar
              propertyId={villa.id}
              villaName={villa.name}
              location={villa.address || `${villa.city}, ${villa.country}`}
              priceLabel={villa.originalPriceLabel || villa.priceLabel}
              maxGuests={villa.guests}
            />

            {related.length > 0 && (
              <section className="villa-detail-section">
                <div className="villa-detail-section-heading">
                  <p className="villa-detail-section-label">More stays</p>
                  <h2>Other Summerhouses nearby.</h2>
                </div>
                <div className="villa-detail-related">
                  {related.map((item) => (
                    <Link href={`/villas/${item.id}`} key={item.id}>
                      <figure>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 20vw, 100vw"
                          className="villa-detail-image"
                          unoptimized
                        />
                      </figure>
                      <span>{item.location}</span>
                      <strong>{item.name}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
