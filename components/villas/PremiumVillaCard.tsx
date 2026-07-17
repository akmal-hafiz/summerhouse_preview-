"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { FiDroplet, FiHeart, FiHome, FiMapPin, FiUsers } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import { readSavedVillaIds, subscribeSavedVillas, toggleSavedVillaId } from "./savedVillas";

type PremiumVillaCardProps = {
  villa: VillaSearchResult;
  priority?: boolean;
  initialSaved?: boolean;
  onSavedChange?: (villaId: string, saved: boolean) => void;
};

function formatCount(value: number | null | undefined, singular: string, plural: string) {
  if (!value) return null;
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function PremiumVillaCard({
  villa,
  priority = false,
  initialSaved = false,
  onSavedChange,
}: PremiumVillaCardProps) {
  const villaId = String(villa.id);
  const [isSaved, setIsSaved] = useState(initialSaved);

  useEffect(() => {
    setIsSaved(readSavedVillaIds().includes(villaId));
    return subscribeSavedVillas(({ ids }) => {
      setIsSaved(ids.includes(villaId));
    });
  }, [villaId]);

  const facts = useMemo(() => ([
    { icon: FiUsers, label: formatCount(villa.guests || villa.capacity, "guest", "guests") },
    { icon: FiHome, label: formatCount(villa.bedrooms, "bedroom", "bedrooms") },
    { icon: FiDroplet, label: formatCount(villa.bathrooms, "bathroom", "bathrooms") },
  ].filter((item): item is { icon: IconType; label: string } => Boolean(item.label))), [
    villa.bathrooms,
    villa.bedrooms,
    villa.capacity,
    villa.guests,
  ]);

  const toggleSaved = () => {
    const result = toggleSavedVillaId(villaId);
    setIsSaved(result.saved);
    onSavedChange?.(villaId, result.saved);
  };

  return (
    <article className="villa-catalog-card">
      <div className="villa-catalog-card__media">
        <Link href={`/villas/${villa.id}`} className="villa-catalog-card__image-link" aria-label={`View ${villa.name}`}>
          <Image
            src={villa.imageUrl}
            alt={villa.name}
            fill
            priority={priority}
            sizes="(max-width: 359px) 100vw, (max-width: 767px) 50vw, (max-width: 1180px) 50vw, 33vw"
            className="villa-catalog-card__image"
          />
        </Link>
        <button
          type="button"
          aria-label={isSaved ? `Remove ${villa.name} from saved villas` : `Save ${villa.name}`}
          aria-pressed={isSaved}
          className={`villa-catalog-card__save ${isSaved ? "is-saved" : ""}`}
          onClick={toggleSaved}
        >
          <FiHeart aria-hidden="true" />
        </button>
      </div>

      <div className="villa-catalog-card__body">
        <Link href={`/villas/${villa.id}`} className="villa-catalog-card__title-link">
          <h2>{villa.name}</h2>
        </Link>

        <p className="villa-catalog-card__location">
          <FiMapPin aria-hidden="true" />
          <span>{villa.location || "Bali, Indonesia"}</span>
        </p>

        {facts.length > 0 ? (
          <div className="villa-catalog-card__facts" aria-label={`${villa.name} quick facts`}>
            {facts.map(({ icon: Icon, label }) => (
              <span key={label}>
                <Icon aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="villa-catalog-card__footer">
          <p className="villa-catalog-card__price">
            {villa.priceLabel ? (
              <>
                <strong>{villa.priceLabel}</strong>
                <span>/ night</span>
              </>
            ) : (
              <strong>Rate on request</strong>
            )}
          </p>
          <Link href={`/villas/${villa.id}#availability`} className="villa-catalog-card__book">
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
