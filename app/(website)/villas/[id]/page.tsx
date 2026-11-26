import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import { VillaBookingProvider } from "@/components/booking/VillaBookingContext";
import VillaBookingSidebar from "@/components/booking/VillaBookingSidebar";
import VillaAmenities from "@/components/booking/VillaAmenities";
import VillaPhotoGallery from "@/components/booking/VillaPhotoGallery";
import NearbyVillasGrid from "@/components/villas/NearbyVillasGrid";
import VillaReviews from "@/components/villas/VillaReviews";
import VillaSaveButton from "@/components/villas/VillaSaveButton";
import VillaDescriptionBody from "@/components/villas/VillaDescriptionBody";
import { getVillaDetail, getVillaSummaries } from "@/lib/lodgify";
import { getCmsVillaReviews } from "@/lib/cms";
import {
  buildGoogleMapsExternalUrl,
  formatBedroomLabel,
  formatVillaDescriptionHtml,
  clampGuestCount,
  selectNearbyVillas,
} from "@/lib/villa-detail-format";
import { isShowcasePreview } from "@/lib/showcase-preview";
import { promoCodeFromParam, stayFromParams } from "@/lib/promo-param";

interface VillaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const villa = await getVillaDetail(id);

  return {
    title: villa?.name || "Villa",
    description: villa?.descriptionText || "Explore this Summerhouses Bali villa.",
    alternates: { canonical: `/villas/${id}` },
  };
}

export default async function VillaDetailPage({ params, searchParams }: VillaDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const promo = promoCodeFromParam(query.promo);
  // The stay searched on the list (or on the villa before this one) fills the calendar; the nearby links read the URL.
  const stay = stayFromParams(query);
  const [villa, summaries, reviewData] = await Promise.all([
    getVillaDetail(id),
    getVillaSummaries(),
    getCmsVillaReviews(id),
  ]);

  if (!villa) {
    return (
      <div className="villa-detail-route-shell">
        <Navbar alwaysSolid={true} />
        <main className="villa-detail-page">
          <section className="villa-detail-missing">
            <h1>Villa not found</h1>
            <Link href="/villas">Back to villa collection</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const related = selectNearbyVillas(summaries, villa.id, villa.city || villa.address || "", 3);
  const amenitiesPreview = Array.isArray(villa.amenitiesPreview) ? villa.amenitiesPreview.filter(Boolean).slice(0, 6) : [];
  const photos = Array.isArray(villa.imageGallery) && villa.imageGallery.length > 0
    ? villa.imageGallery
    : [{ url: villa.imageUrl, caption: villa.name }];
  const mapQuery = villa.latitude && villa.longitude
    ? `${villa.latitude},${villa.longitude}`
    : `${villa.address || villa.city}, Indonesia`;

  return (
    <div className="villa-detail-route-shell">
      <Navbar alwaysSolid={true} />
      <main className="villa-detail-page villa-detail-page--preview">
        <section className="villa-detail-stage">
          <div className="villa-detail-frame">

          <div className="villa-detail-hero-copy">
            <div className="villa-detail-top-bar">
              <nav aria-label="Breadcrumb">
                <Link href="/villas" className="villa-detail-back">
                  <FiArrowLeft aria-hidden="true" />
                  <span>Villa collection</span>
                </Link>
              </nav>
              <VillaSaveButton
                villaId={villa.id}
                villaName={villa.name}
                image={photos[0]?.url}
              />
            </div>
            <h1>{villa.name}</h1>
            <p className="villa-detail-location-line">{villa.address || `${villa.city}, ${villa.country}`}</p>
            <div className="villa-detail-facts" aria-label="Villa quick facts">
              <span>{villa.city || "Bali"}</span>
              <span>Private villa</span>
              <span>Max {villa.guests} guests</span>
              <span>{formatBedroomLabel(villa.bedrooms)}</span>
            </div>
          </div>

          <VillaPhotoGallery
            villaName={villa.name}
            photos={photos}
          />

          <VillaBookingProvider>
            <div className="villa-detail-main-grid">
              <article className="villa-detail-content">
                <section className="villa-detail-section villa-detail-intro">
                  <div className="villa-detail-section-heading">
                    <p className="villa-detail-section-label">Description</p>
                    <h2>Entire villa in {villa.city || "Bali"}</h2>
                  </div>
                  <VillaDescriptionBody html={formatVillaDescriptionHtml(villa.descriptionHtml)} />
                </section>

                <section className="villa-detail-section">
                  <div className="villa-detail-section-heading">
                    <p className="villa-detail-section-label">What this place offers</p>
                    <h2>Considered comforts for your stay.</h2>
                  </div>
                  <VillaAmenities groups={villa.amenityGroups || []} preview={amenitiesPreview} />
                </section>

                <section className="villa-detail-section">
                  <div className="villa-detail-section-heading">
                    <p className="villa-detail-section-label">Location</p>
                    <h2>Where you'll be</h2>
                    <div className="villa-detail-location-row">
                      <span>{villa.address || `${villa.city}, ${villa.country}`}</span>
                      <a
                        href={buildGoogleMapsExternalUrl(mapQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="villa-detail-maps-link"
                      >
                        Open in Maps
                      </a>
                    </div>
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

                {isShowcasePreview ? (
                  <section className="villa-calendar-section" id="availability" aria-label="Availability preview notice">
                    <div className="villa-calendar-section__header">
                      <div>
                        <p className="villa-detail-section-label">Availability</p>
                        <h2>Live dates and rates are not available in this visual preview.</h2>
                        <p>Contact our team for current availability and a confirmed quote.</p>
                      </div>
                    </div>
                  </section>
                ) : (
                  <AvailabilityCalendar
                    propertyId={villa.id}
                    roomTypeId={villa.roomTypeId}
                    villaName={villa.name}
                    location={villa.address || `${villa.city}, ${villa.country}`}
                    priceLabel={villa.originalPriceLabel || villa.priceLabel}
                    maxGuests={villa.guests}
                    initialPromotionCode={promo}
                    initialStay={stay}
                  />
                )}
              </article>

              <div className="villa-detail-sidebar">
                <VillaBookingSidebar
                  priceLabel={villa.priceLabel}
                  originalPriceLabel={villa.originalPriceLabel}
                  initialGuests={clampGuestCount(stay?.guests, villa.guests)}
                  isShowcasePreview={isShowcasePreview}
                />
              </div>
            </div>
          </VillaBookingProvider>

            {related.length > 0 && (
              <section className="villa-detail-section">
                <div className="villa-detail-section-heading">
                  <p className="villa-detail-section-label">More stays</p>
                  <h2>Other Summerhouses nearby.</h2>
                </div>
                <NearbyVillasGrid villas={related} promo={promo} />
              </section>
            )}

            <VillaReviews
              lodgifyId={String(villa.id)}
              villaName={villa.name}
              summary={reviewData?.summary ?? null}
              reviews={reviewData?.reviews ?? []}
            />
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
