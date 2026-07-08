"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

function getNextAvailableIndex(
  currentIndex: number,
  excludeIndex: number,
  length: number
) {
  if (length <= 3) {
    return (currentIndex + 1) % length;
  }
  let next = (currentIndex + 1) % length;
  // Exclude index 0 (large image) and excludeIndex (the other smaller image)
  while (next === 0 || next === excludeIndex) {
    next = (next + 1) % length;
  }
  return next;
}

function FadingImage({ src, alt, sizes, priority = false }: { src: string; alt: string; sizes?: string; priority?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

export default function SignatureVillaSpotlight({ villa, variant }: SignatureVillaSpotlightProps) {
  const [indices, setIndices] = useState({ mid: 1, small: 2 });
  const stepRef = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !villa || !villa.images || villa.images.length <= 3) return;

    const imagesLength = villa.images.length;

    const interval = setInterval(() => {
      const currentStep = stepRef.current;
      setIndices((prev) => {
        const nextIndices = { ...prev };
        if (currentStep === 0) {
          nextIndices.mid = getNextAvailableIndex(prev.mid, prev.small, imagesLength);
        } else {
          nextIndices.small = getNextAvailableIndex(prev.small, prev.mid, imagesLength);
        }
        return nextIndices;
      });
      stepRef.current = currentStep === 0 ? 1 : 0;
    }, 4500); // Cycle one image every 4.5 seconds

    return () => clearInterval(interval);
  }, [reduceMotion, villa]);

  if (!villa) return null;

  const facts = formatFacts(villa);
  const title = cleanVillaName(villa.name).toUpperCase();

  if (variant === "mobile") {
    return (
      <section className="mobile-section mobile-section-border-y">
        <motion.div 
          className="mobile-bawa-header-row"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mobile-bawa-title">{title}</h2>
          <div className="mobile-bawa-subtitle-col">
            <div className="mobile-bawa-sub-bar-stack">
              <span className="mobile-bawa-sub-bar">// {villa.eyebrow.toUpperCase()}</span>
              <span className="mobile-bawa-sub-bar">A HOME OF ITS OWN</span>
            </div>
            <h3 className="mobile-bawa-subtitle">{villa.title.toUpperCase()}</h3>
          </div>
        </motion.div>

        <div className="mobile-bawa-layout">
          <motion.div 
            className="mobile-bawa-title-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mobile-bawa-villa-name">{cleanVillaName(villa.name)}</p>
            <p className="mobile-bawa-villa-loc">{villa.address || villa.location}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", display: "block" }}
          >
            <Link className="mobile-bawa-large-img-wrapper" href={villa.href}>
              <Image src={getImage(villa, 0)} alt={villa.name} fill sizes="320px" priority className="object-cover" />
            </Link>
          </motion.div>

          <motion.div 
            className="mobile-bawa-mid-img"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <FadingImage src={getImage(villa, indices.mid)} alt={`${villa.name} detail`} sizes="320px" />
          </motion.div>

          <motion.div 
            className="mobile-bawa-desc-box"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <strong className="signature-villa-label">Why this home</strong>
            {villa.whyThisHome}
          </motion.div>

          <motion.div 
            className="mobile-bawa-details-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
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
          </motion.div>

          <motion.div 
            className="mobile-bawa-small-img-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <FadingImage src={getImage(villa, indices.small)} alt={`${villa.name} lifestyle`} sizes="320px" />
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="desktop-section desktop-section-border-y">
      <div className="desktop-container-shell">
        <motion.div 
          className="desktop-bawa-header-row"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="desktop-bawa-title">{title}</h2>
          <div className="desktop-bawa-subtitle-col">
            <div className="desktop-bawa-sub-bar-stack">
              <span className="desktop-bawa-sub-bar">// {villa.eyebrow.toUpperCase()}</span>
              <span className="desktop-bawa-sub-bar">A HOME OF ITS OWN</span>
            </div>
            <h3 className="desktop-bawa-subtitle">{villa.title.toUpperCase()}</h3>
          </div>
        </motion.div>

        <div className="desktop-bawa-grid">
          <motion.div 
            className="desktop-bawa-left-col"
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="desktop-bawa-title-block">
              <p className="desktop-bawa-villa-name">{cleanVillaName(villa.name)}</p>
              <p className="desktop-bawa-villa-loc">{villa.address || villa.location}</p>
            </div>
            <Link className="desktop-bawa-large-img-wrapper" href={villa.href}>
              <Image src={getImage(villa, 0)} alt={villa.name} fill sizes="540px" priority className="object-cover" />
            </Link>
          </motion.div>

          <motion.div 
            className="desktop-bawa-right-col"
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div className="desktop-bawa-mid-img">
              <FadingImage src={getImage(villa, indices.mid)} alt={`${villa.name} detail`} sizes="320px" />
            </div>

            <div className="desktop-bawa-desc-box">
              <strong className="signature-villa-label">Why this home</strong>
              {villa.whyThisHome}
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
              <FadingImage src={getImage(villa, indices.small)} alt={`${villa.name} lifestyle`} sizes="320px" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
