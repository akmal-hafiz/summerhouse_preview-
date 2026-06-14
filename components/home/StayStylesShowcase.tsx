"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import type { HomepageStayGroup, HomepageStayVilla } from "@/lib/lodgify/types";

type StayStylesShowcaseProps = {
  groups: HomepageStayGroup[];
  variant: "desktop" | "mobile";
};

function formatPrice(villa: HomepageStayVilla) {
  if (!villa.priceLabel) return "Price confirmed at booking";
  return `from ${villa.priceLabel} per night`;
}

function formatFacts(villa: HomepageStayVilla) {
  return [
    villa.guests ? `${villa.guests} guests` : null,
    villa.bedrooms ? `${villa.bedrooms} beds` : null,
    villa.bathrooms ? `${villa.bathrooms} bath${villa.bathrooms > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" - ");
}

function cleanVillaName(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function getAmenityLine(villa: HomepageStayVilla) {
  const amenities = villa.amenitiesPreview.length ? villa.amenitiesPreview : ["Private stay", "Comfort", "Bali living"];
  return amenities.slice(0, 4).join(" - ");
}

function StayCard({ villa, variant }: { villa: HomepageStayVilla; variant: "desktop" | "mobile" }) {
  const prefix = variant === "desktop" ? "desktop" : "mobile";
  const cardClass = variant === "desktop" ? "desktop-villa-card" : "mobile-category-card";
  const headerClass = variant === "desktop" ? "desktop-villa-card-header-tag" : "mobile-category-header-tag";
  const imageClass = variant === "desktop" ? "desktop-villa-image-wrapper" : "mobile-category-image-wrapper";
  const titleRowClass = variant === "desktop" ? "desktop-villa-title-row" : "mobile-category-title-row";
  const titleClass = variant === "desktop" ? "desktop-villa-title" : "mobile-category-title";
  const metaClass = variant === "desktop" ? "desktop-villa-metadata" : "mobile-category-metadata";
  const priceClass = variant === "desktop" ? "desktop-villa-price" : "mobile-category-price";
  const iconClass = variant === "desktop" ? "desktop-villa-blue-icon" : "mobile-blue-square-icon-btn";

  return (
    <Link className={`${cardClass} homepage-stay-card-link`} href={villa.href}>
      <div className={headerClass}>
        <span>{villa.location}</span>
        <span className="badge-num">Live</span>
      </div>
      <div className={imageClass}>
        <Image
          src={villa.imageUrl}
          alt={villa.name}
          fill
          sizes={variant === "desktop" ? "350px" : "260px"}
          className="object-cover"
        />
      </div>
      <div className={titleRowClass}>
        <h3 className={titleClass}>{cleanVillaName(villa.name)}</h3>
        <div className={iconClass}>
          <FiArrowRight aria-hidden="true" />
        </div>
      </div>
      <p className={metaClass}>{formatFacts(villa)}</p>
      <p className={`${metaClass} ${prefix}-villa-amenity-line`}>{getAmenityLine(villa)}</p>
      <p className={priceClass}>{formatPrice(villa)}</p>
    </Link>
  );
}

export default function StayStylesShowcase({ groups, variant }: StayStylesShowcaseProps) {
  const availableGroups = groups.filter((group) => group.villas.length > 0);
  const [activeGroupId, setActiveGroupId] = useState<string>(availableGroups[0]?.id || "short-stays");
  const [userInteracted, setUserInteracted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeGroup = useMemo(
    () => availableGroups.find((group) => group.id === activeGroupId) || availableGroups[0],
    [activeGroupId, availableGroups]
  );

  useEffect(() => {
    if (userInteracted || isHovered || availableGroups.length <= 1) return;

    const interval = setInterval(() => {
      setActiveGroupId((currentId) => {
        const currentIndex = availableGroups.findIndex((g) => g.id === currentId);
        const nextIndex = (currentIndex + 1) % availableGroups.length;
        return availableGroups[nextIndex].id;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [userInteracted, isHovered, availableGroups]);

  const handleTabClick = (groupId: string) => {
    setActiveGroupId(groupId);
    setUserInteracted(true);
  };

  if (!activeGroup) return null;

  if (variant === "mobile") {
    return (
      <section 
        className="mobile-section"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="mobile-brand-header-col">
          <h1 className="mobile-brand-title">SUMMERHOUSES</h1>
          <p className="mobile-brand-copy">
            Choose the kind of stay that fits your rhythm, from quick Bali escapes to longer private stays and handpicked SummerHouse homes.
          </p>
        </div>

        <div className="homepage-stay-tabs homepage-stay-tabs--mobile" aria-label="Choose stay style">
          {availableGroups.map((group) => {
            const isActive = group.id === activeGroup.id;
            return (
              <button
                type="button"
                key={group.id}
                className={isActive ? "is-active" : ""}
                onClick={() => handleTabClick(group.id)}
                style={{ position: "relative" }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeStayTabMobile"
                    className="homepage-stay-active-bg"
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{group.label}</span>
              </button>
            );
          })}
        </div>

        <p className="homepage-stay-mode-desc homepage-stay-mode-desc--mobile">{activeGroup.description}</p>

        <div className="mobile-category-row">
          {activeGroup.villas.map((villa) => (
            <StayCard villa={villa} variant="mobile" key={villa.id} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section 
      className="desktop-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="desktop-container-shell">
        <div className="desktop-intro-header-row">
          <div>
            <h1 className="desktop-stay-heading">A home, not a hotel</h1>
          </div>

          <p className="desktop-brand-copy">
            Choose the kind of stay that fits your rhythm, from quick Bali escapes to longer private stays and handpicked SummerHouse homes.
          </p>
        </div>

        <div className="desktop-stay-desc-tabs-row">
          <p className="homepage-stay-mode-desc">{activeGroup.description}</p>
          <div className="homepage-stay-tabs" aria-label="Choose stay style">
            {availableGroups.map((group) => {
              const isActive = group.id === activeGroup.id;
              return (
                <button
                  type="button"
                  key={group.id}
                  className={isActive ? "is-active" : ""}
                  onClick={() => handleTabClick(group.id)}
                  style={{ position: "relative" }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeStayTabDesktop"
                      className="homepage-stay-active-bg"
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>{group.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="desktop-grid-3col">
          {activeGroup.villas.map((villa) => (
            <StayCard villa={villa} variant="desktop" key={villa.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
