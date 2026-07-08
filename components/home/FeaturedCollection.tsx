"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiDroplet, FiHome, FiUsers } from "react-icons/fi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { FeaturedCollectionVilla } from "@/lib/lodgify/types";

type FeaturedCollectionProps = {
  villas: FeaturedCollectionVilla[];
  variant: "desktop" | "mobile";
};

function formatFacts(villa: FeaturedCollectionVilla) {
  return [
    villa.guests ? { icon: FiUsers, label: `${villa.guests} guests` } : null,
    villa.bedrooms ? { icon: FiHome, label: `${villa.bedrooms} beds` } : null,
    villa.bathrooms ? { icon: FiDroplet, label: `${villa.bathrooms} baths` } : null,
  ].filter(Boolean) as Array<{ icon: typeof FiUsers; label: string }>;
}

function getDescription(villa: FeaturedCollectionVilla) {
  const location = villa.location.toLowerCase();
  const name = villa.name.toLowerCase();

  if (location.includes("ubud") || name.includes("ubud")) {
    return "Chosen for quiet jungle views, slower mornings, and a restorative Bali rhythm.";
  }

  if (location.includes("berawa")) {
    return "Chosen for easy access to cafes, beach clubs, and relaxed coastal living.";
  }

  if (location.includes("padonan")) {
    return "Chosen for design-led comfort in a calmer Canggu neighborhood.";
  }

  if (location.includes("canggu")) {
    return "Chosen for modern villa living close to surf, cafes, and sunset scenes.";
  }

  if (location.includes("pererenan")) {
    return "Chosen for a quieter coastal stay with surf mornings and village calm.";
  }

  if (location.includes("umalas")) {
    return "Chosen for leafy privacy, easy dining access, and calm Bali downtime.";
  }

  return "Chosen for comfort, location, and a stay that feels personal from the first night.";
}

function getPriceLabel(villa: FeaturedCollectionVilla) {
  if (!villa.priceLabel) return "Price confirmed at booking";
  if (/night/i.test(villa.priceLabel)) return villa.priceLabel;
  return `from ${villa.priceLabel} / night`;
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function useCardSlideshow(
  images: string[] | undefined,
  variant: "desktop" | "mobile",
  index: number,
  isHovered: boolean
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !images || images.length <= 1) return;

    if (variant === "desktop") {
      if (!isHovered) {
        setActiveIndex(0);
        return;
      }

      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }, 2500);

      return () => clearInterval(interval);
    } else {
      let interval: ReturnType<typeof setInterval> | undefined;
      const offsetTimeout = setTimeout(() => {
        interval = setInterval(() => {
          setActiveIndex((prev) => (prev + 1) % images.length);
        }, 5500);
      }, index * 1800);

      return () => {
        clearTimeout(offsetTimeout);
        if (interval) clearInterval(interval);
      };
    }
  }, [reduceMotion, images, variant, index, isHovered]);

  return activeIndex;
}

function CardFadingImage({ src, alt, sizes, priority = false }: { src: string; alt: string; sizes?: string; priority?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FeaturedLargeCard({ villa, variant, index }: { villa: FeaturedCollectionVilla; variant: "desktop" | "mobile"; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const activeIndex = useCardSlideshow(villa.images, variant, index, isHovered);
  const facts = formatFacts(villa);
  const prefix = variant === "desktop" ? "desktop" : "mobile";
  
  const displayImage = villa.images && villa.images.length > 0
    ? villa.images[activeIndex]
    : villa.imageUrl;

  return (
    <Link 
      className={`${prefix}-featured-large-card`} 
      href={villa.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`${prefix}-premium-location`}>{villa.location}</span>
      <div className={`${prefix}-premium-card`}>
        <div className={`${prefix}-premium-img-wrapper`}>
          <CardFadingImage
            src={displayImage}
            alt={villa.name}
            sizes={variant === "desktop" ? "680px" : "86vw"}
            priority={variant === "desktop"}
          />
        </div>

        <div className={`${prefix}-premium-content`}>
          <div className={`${prefix}-premium-header-row`}>
            <div className={`${prefix}-premium-title-group`}>
              <h3 className={`${prefix}-premium-title`}>{villa.name}</h3>
              <span className={`${prefix}-premium-subtitle`}>{getPriceLabel(villa)}</span>
            </div>
            <div className={`${prefix}-blue-square-icon-btn ${prefix}-blue-square-icon-btn-large`}>
              <ArrowIcon />
            </div>
          </div>

          <p className={`${prefix}-premium-desc`}>
            {getDescription(villa)}
          </p>

          <div className={`${prefix}-premium-pills-row`}>
            {facts.map((fact) => (
              <span className={`${prefix}-premium-pill`} key={fact.label}>
                <fact.icon aria-hidden="true" />
                {fact.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSmallCard({ villa, variant, index }: { villa: FeaturedCollectionVilla; variant: "desktop" | "mobile"; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const activeIndex = useCardSlideshow(villa.images, variant, index, isHovered);
  const facts = formatFacts(villa);
  const prefix = variant === "desktop" ? "desktop" : "mobile";

  const displayImage = villa.images && villa.images.length > 0
    ? villa.images[activeIndex]
    : villa.imageUrl;

  return (
    <Link 
      className={`${prefix}-small-row-card-wrapper`} 
      href={villa.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`${prefix}-small-card-location`}>{villa.location}</span>
      <div className={`${prefix}-small-row-card`}>
        <div className={`${prefix}-small-card-img`}>
          <CardFadingImage
            src={displayImage}
            alt={villa.name}
            sizes={variant === "desktop" ? "160px" : "46vw"}
          />
        </div>
        <div className={`${prefix}-small-card-body`}>
          <div className={`${prefix}-small-card-title-row`}>
            <div className="u-flex-col">
              <h4 className={`${prefix}-small-card-title`}>{villa.name}</h4>
              <p className={`${prefix}-small-card-price`}>{getPriceLabel(villa)}</p>
            </div>
            <div className={`${prefix}-blue-square-icon-btn`}>
              <ArrowIcon />
            </div>
          </div>
          <p className={`${prefix}-small-card-details`}>
            {getDescription(villa)}
          </p>
          <div className={`${prefix}-small-card-pills`}>
            {facts.map((fact) => (
              <span className={`${prefix}-small-card-pill`} key={fact.label}>
                <fact.icon aria-hidden="true" />
                {fact.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedCollection({ villas, variant }: FeaturedCollectionProps) {
  if (villas.length === 0) return null;

  const [primary, ...secondary] = villas;
  const description = "A curated selection of SummerHouse villas, personally chosen for exceptional design, location, comfort, and guest experience.";

  if (variant === "mobile") {
    return (
      <section className="mobile-section mobile-featured-collection-section">
        <motion.div 
          className="mobile-featured-header"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mobile-featured-stacked-title">
            <span>FEATURED</span>
            <span>COLLECTION</span>
          </h2>
          <p className="mobile-featured-desc">{description}</p>
        </motion.div>

        <motion.div 
          className="mobile-featured-scroll" 
          aria-label="Featured SummerHouse villas"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
        >
          {villas.map((villa, index) => (
            <motion.div 
              className="mobile-featured-scroll-item" 
              key={villa.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                }
              }}
            >
              {index === 0 ? (
                <FeaturedLargeCard villa={villa} variant="mobile" index={index} />
              ) : (
                <FeaturedSmallCard villa={villa} variant="mobile" index={index} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  return (
    <section className="desktop-section desktop-featured-collection-section">
      <div className="desktop-container-shell">
        <motion.div 
          className="desktop-featured-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="desktop-featured-stacked-title">
            <span>FEATURED</span>
            <span>COLLECTION</span>
          </h2>
          <p className="desktop-featured-desc">{description}</p>
        </motion.div>

        <div className="desktop-featured-collection-grid">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block" }}
          >
            <FeaturedLargeCard villa={primary} variant="desktop" index={0} />
          </motion.div>

          <motion.div 
            className="desktop-stacked-cards desktop-featured-collection-stack"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {secondary.map((villa, idx) => (
              <motion.div
                key={villa.id}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                  }
                }}
                style={{ display: "block", width: "100%" }}
              >
                <FeaturedSmallCard villa={villa} variant="desktop" index={idx + 1} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
