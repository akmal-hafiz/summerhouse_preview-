import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiMenu, FiSearch, FiUser } from "react-icons/fi";
import Footer from "@/components/common/Footer";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import VillaAmenities from "@/components/booking/VillaAmenities";
import VillaPhotoGallery from "@/components/booking/VillaPhotoGallery";
import VillaReviews from "@/components/villas/VillaReviews";
import { getVillaDetail, getVillaSummaries } from "@/lib/lodgify";
import { getCmsVillaReviews } from "@/lib/cms";
import { sanitizeHtml } from "@/lib/sanitize";

interface VillaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const villaDetailNavItems = [
  { label: "Villas", href: "/villas" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export async function generateMetadata({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const villa = await getVillaDetail(id);

  return {
    title: villa?.name || "Villa",
    description: villa?.descriptionText || "Explore this Summerhouses Bali villa.",
  };
}

export default async function VillaDetailPage({ params }: VillaDetailPageProps) {
  const { id } = await params;
  const [villa, summaries, reviewData] = await Promise.all([
    getVillaDetail(id),
    getVillaSummaries(),
    getCmsVillaReviews(id),
  ]);

  if (!villa) {
    return (
      <main className="villa-detail-page">
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
    <main className="villa-detail-page villa-detail-page--preview">
      <section className="villa-detail-stage">
        <div className="villa-detail-frame">
          <header className="villa-detail-mini-header">
            <div className="villa-detail-mini-header__brand">
              <Link href="/" className="villa-detail-mini-logo">SUMMERHOUSE</Link>
              <span>Bali private stays</span>
            </div>

            <nav className="villa-detail-mini-nav" aria-label="Villa detail navigation">
              {villaDetailNavItems.map((item) => (
                <Link href={item.href} key={item.href}>{item.label}</Link>
              ))}
            </nav>

            <div className="villa-detail-mini-actions">
              <Link href="/villas" className="villa-detail-mini-link">Book our Villas</Link>
              <button type="button" className="villa-detail-icon-button" aria-label="Search villas">
                <FiSearch aria-hidden="true" />
              </button>
              <button type="button" className="villa-detail-icon-button" aria-label={`Save ${villa.name}`}>
                <FiHeart aria-hidden="true" />
              </button>
              <button type="button" className="villa-detail-icon-button" aria-label="Open user profile">
                <FiUser aria-hidden="true" />
              </button>
              <details className="villa-detail-mobile-menu">
                <summary aria-label="Open navigation">
                  <FiMenu aria-hidden="true" />
                </summary>
                <div className="villa-detail-mobile-menu__panel">
                  {villaDetailNavItems.map((item) => (
                    <Link href={item.href} key={`mobile-${item.href}`}>{item.label}</Link>
                  ))}
                  <Link href="/villas">Book our Villas</Link>
                </div>
              </details>
            </div>
          </header>

          <div className="villa-detail-hero-copy">
            <Link href="/villas" className="villa-detail-back">Villa collection</Link>
            <h1>Enjoy life in {villa.name}</h1>
            <p className="villa-detail-location-line">{villa.address || `${villa.city}, ${villa.country}`}</p>
            <div className="villa-detail-facts" aria-label="Villa quick facts">
              <span>{villa.city || "Bali"}</span>
              <span>Private villa</span>
              <span>Max {villa.guests} guests</span>
              <span>{villa.bedrooms} beds</span>
            </div>
          </div>

          <VillaPhotoGallery
            villaName={villa.name}
            photos={photos}
            sideContent={(
              <aside className="villa-detail-reserve-card">
                <div className="villa-detail-reserve-price">
                  {villa.maxPriceLabel && <del>{villa.maxPriceLabel}</del>}
                  <strong>{villa.priceLabel || "Rate on request"}</strong>
                  <span>/ night</span>
                </div>
                <div className="villa-detail-reserve-fields">
                  <a href="#availability">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <small>Check in</small>
                    <strong>Add date</strong>
                  </a>
                  <a href="#availability">
                    <span className="material-symbols-outlined">event_available</span>
                    <small>Check out</small>
                    <strong>Add date</strong>
                  </a>
                  <a href="#availability" className="is-wide">
                    <span className="material-symbols-outlined">group</span>
                    <small>Guests</small>
                    <strong>Up to {villa.guests} guests</strong>
                  </a>
                </div>
                <a href="#availability" className="villa-detail-reserve-cta">Check availability</a>
                <p>Final rates, taxes, minimum stay, and payment are confirmed at booking.</p>
              </aside>
            )}
          />

          <div className="villa-detail-main-grid">
            <article className="villa-detail-content">
              <section className="villa-detail-section villa-detail-intro">
                <div className="villa-detail-section-heading">
                  <p className="villa-detail-section-label">Description</p>
                  <h2>Entire villa in {villa.city || "Bali"}</h2>
                </div>
                <div
                  className="villa-detail-description"
                  dangerouslySetInnerHTML={{ __html: formatDescriptionHtml(villa.descriptionHtml) }}
                />
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
                  <span>{villa.address || `${villa.city}, ${villa.country}`}</span>
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
          </div>

            <AvailabilityCalendar
              propertyId={villa.id}
              roomTypeId={villa.roomTypeId}
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
                        />
                      </figure>
                      <span>{item.location}</span>
                      <strong>{item.name}</strong>
                    </Link>
                  ))}
                </div>
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

      <Footer />
    </main>
  );
}

function formatDescriptionHtml(html: string): string {
  if (!html) return "";

  let cleaned = sanitizeHtml(html)
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n");

  const rawLines = cleaned.split("\n");
  let result = "";
  let inList = false;

  for (let line of rawLines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    const plainText = trimmed
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!plainText) continue;

    const cleanTextForCheck = plainText
      .replace(/^[-*•·—\s]+/, "")
      .replace(/[-*•·—\s]+$/, "")
      .trim();

    const isHeading = 
      (cleanTextForCheck.length > 3 && cleanTextForCheck === cleanTextForCheck.toUpperCase() && !/^\d+$/.test(cleanTextForCheck)) ||
      /^(?:The Space|Layout|Neighborhood|Details To Note|Entire Place Use|Rules|Amenities|Getting around|For coffee & slow mornings|For dining|For movement & wellness|For the Beach|Shops & essentials|Guest access|Other things to note|About the property):?$/i.test(cleanTextForCheck) ||
      /^\d+\.\s+[A-Za-z]/i.test(cleanTextForCheck) ||
      /^(?:<strong>|<b>)(.*?)(?:<\/strong>|<\/b>):?$/i.test(trimmed);

    const isListItem = !isHeading && (
      trimmed.startsWith("-") || 
      trimmed.startsWith("*") || 
      trimmed.startsWith("•") || 
      trimmed.startsWith("·") ||
      trimmed.startsWith("—")
    );

    if (isHeading) {
      if (inList) {
        result += "</ul>\n";
        inList = false;
      }
      result += `<h3 class="description-heading">${escapeHtml(cleanTextForCheck)}</h3>\n`;
    } else if (isListItem) {
      if (!inList) {
        result += `<ul class="description-list">\n`;
        inList = true;
      }
      const content = trimmed.replace(/^[-*•·—\s]+/, "").trim();
      if (content.endsWith(":")) {
        result += `  <li class="description-list-heading"><strong>${escapeHtml(content.replace(/<[^>]*>/g, "").trim())}</strong></li>\n`;
      } else {
        result += `  <li>${escapeHtml(content.replace(/<[^>]*>/g, "").trim())}</li>\n`;
      }
    } else {
      if (inList) {
        result += "</ul>\n";
        inList = false;
      }
      result += `<p>${escapeHtml(plainText)}</p>\n`;
    }
  }

  if (inList) {
    result += "</ul>\n";
  }

  return result;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
