import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { SignatureVilla } from "@/lib/lodgify/types";

type SignatureVillaSpotlightProps = {
  villa: SignatureVilla | null;
  variant: "desktop" | "mobile";
};

function cleanVillaName(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function formatFacts(villa: SignatureVilla) {
  return [
    villa.guests ? `${villa.guests} guests` : null,
    villa.bedrooms ? `${villa.bedrooms} bedrooms` : null,
    villa.bathrooms ? `${villa.bathrooms} bathrooms` : null,
  ].filter(Boolean);
}

function formatPrice(villa: SignatureVilla) {
  return villa.priceLabel ? `Start from ${villa.priceLabel} / night` : "Price confirmed at booking";
}

function getImage(villa: SignatureVilla, index: number) {
  return villa.images[index] || villa.imageUrl || "/homepage_villa/curated-6-exterior.webp";
}

export default function SignatureVillaSpotlight({ villa, variant }: SignatureVillaSpotlightProps) {
  if (!villa) return null;

  const facts = formatFacts(villa);
  const title = cleanVillaName(villa.name).toUpperCase();

  if (variant === "mobile") {
    return (
      <section className="mobile-section mobile-section-border-y">
        <div className="mobile-bawa-header-row">
          <h2 className="mobile-bawa-title">{title}</h2>
          <div className="mobile-bawa-subtitle-col">
            <div className="mobile-bawa-sub-bar-stack">
              <span className="mobile-bawa-sub-bar">// {villa.eyebrow.toUpperCase()}</span>
              <span className="mobile-bawa-sub-bar">EXCLUSIVE PRIVATE ESTATE</span>
            </div>
            <h3 className="mobile-bawa-subtitle">{villa.title.toUpperCase()}</h3>
          </div>
        </div>

        <div className="mobile-bawa-layout">
          <div className="mobile-bawa-title-block">
            <p className="mobile-bawa-villa-name">{cleanVillaName(villa.name)}</p>
            <p className="mobile-bawa-villa-loc">{villa.address || villa.location}</p>
          </div>

          <Link className="mobile-bawa-large-img-wrapper" href={villa.href}>
            <Image src={getImage(villa, 0)} alt={villa.name} fill sizes="320px" priority className="object-cover" />
          </Link>

          <div className="mobile-bawa-mid-img">
            <Image src={getImage(villa, 1)} alt={`${villa.name} detail`} fill sizes="320px" className="object-cover" />
          </div>

          <div className="mobile-bawa-desc-box">
            <strong className="signature-villa-label">Why this home</strong>
            {villa.subtitle} Chosen for tropical architecture, privacy, and full-villa comfort.
          </div>

          <div className="mobile-bawa-details-block">
            <div className="mobile-bawa-price-header">
              <h4 className="mobile-bawa-price-title">{formatPrice(villa)}</h4>
              <Link className="mobile-blue-square-icon-btn" href={villa.href} aria-label={`View ${villa.name}`}>
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            <p className="mobile-bawa-explore-desc">{villa.description}</p>
            <div className="mobile-bawa-pills-row">
              {facts.map((fact) => <span className="mobile-bawa-pill" key={fact}>{fact}</span>)}
            </div>
          </div>

          <div className="mobile-bawa-small-img-wrapper">
            <Image src={getImage(villa, 2)} alt={`${villa.name} lifestyle`} fill sizes="320px" className="object-cover" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="desktop-section desktop-section-border-y">
      <div className="desktop-container-shell">
        <div className="desktop-bawa-header-row">
          <h2 className="desktop-bawa-title">{title}</h2>
          <div className="desktop-bawa-subtitle-col">
            <div className="desktop-bawa-sub-bar-stack">
              <span className="desktop-bawa-sub-bar">// {villa.eyebrow.toUpperCase()}</span>
              <span className="desktop-bawa-sub-bar">EXCLUSIVE PRIVATE ESTATE</span>
            </div>
            <h3 className="desktop-bawa-subtitle">{villa.title.toUpperCase()}</h3>
          </div>
        </div>

        <div className="desktop-bawa-grid">
          <div className="desktop-bawa-left-col">
            <div className="desktop-bawa-title-block">
              <p className="desktop-bawa-villa-name">{cleanVillaName(villa.name)}</p>
              <p className="desktop-bawa-villa-loc">{villa.address || villa.location}</p>
            </div>
            <Link className="desktop-bawa-large-img-wrapper" href={villa.href}>
              <Image src={getImage(villa, 0)} alt={villa.name} fill sizes="540px" priority className="object-cover" />
            </Link>
          </div>

          <div className="desktop-bawa-right-col">
            <div className="desktop-bawa-mid-img">
              <Image src={getImage(villa, 1)} alt={`${villa.name} detail`} fill sizes="320px" className="object-cover" />
            </div>

            <div className="desktop-bawa-desc-box">
              <strong className="signature-villa-label">Why this home</strong>
              {villa.subtitle} Chosen for tropical architecture, privacy, and full-villa comfort.
            </div>

            <div className="desktop-bawa-details-block">
              <div className="desktop-bawa-price-header">
                <h4 className="desktop-bawa-price-title">{formatPrice(villa)}</h4>
                <Link className="desktop-blue-square-icon-btn" href={villa.href} aria-label={`View ${villa.name}`}>
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              <p className="desktop-bawa-explore-desc">{villa.description}</p>
              <div className="desktop-bawa-pills-row">
                {facts.map((fact) => <span className="desktop-bawa-pill" key={fact}>{fact}</span>)}
              </div>
            </div>

            <div className="desktop-bawa-small-img-wrapper">
              <Image src={getImage(villa, 2)} alt={`${villa.name} lifestyle`} fill sizes="320px" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
