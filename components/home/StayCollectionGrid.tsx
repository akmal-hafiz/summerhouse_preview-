"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import type { HomepageStayVilla } from "@/lib/lodgify/types";
import styles from "./StayCollectionGrid.module.css";

type StayCollectionGridProps = {
  villas: HomepageStayVilla[];
  groupLabel: string;
};

function cleanVillaName(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function getPriceLabel(villa: HomepageStayVilla) {
  if (!villa.priceLabel) return "Price confirmed at booking";
  if (/night/i.test(villa.priceLabel)) return villa.priceLabel;
  return `From ${villa.priceLabel} per night`;
}

function getFacts(villa: HomepageStayVilla) {
  const countLabel = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  return [
    villa.guests ? countLabel(villa.guests, "guest", "guests") : null,
    villa.bedrooms ? countLabel(villa.bedrooms, "bedroom", "bedrooms") : null,
    villa.bathrooms ? countLabel(villa.bathrooms, "bathroom", "bathrooms") : null,
  ].filter(Boolean) as string[];
}

function usePointerSlideshow(villa: HomepageStayVilla, isHovered: boolean) {
  const [activeImage, setActiveImage] = useState(0);
  const reduceMotion = useReducedMotion();
  const images = villa.images?.length ? villa.images : [villa.imageUrl];

  useEffect(() => {
    if (!isHovered || reduceMotion || images.length <= 1) {
      setActiveImage(0);
      return;
    }

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [images.length, isHovered, reduceMotion]);

  return images[activeImage] || villa.imageUrl;
}

function VillaImage({
  villa,
  priority,
}: {
  villa: HomepageStayVilla;
  priority: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const image = usePointerSlideshow(villa, isHovered);

  return (
    <div
      className={styles.media}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          className={styles.imageLayer}
          key={image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt={villa.name}
            fill
            sizes="(min-width: 960px) 30vw, (min-width: 721px) 46vw, 78vw"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className={styles.image}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function VillaFacts({ villa }: { villa: HomepageStayVilla }) {
  return <p className={styles.facts}>{getFacts(villa).join(" · ")}</p>;
}

function StayVillaCard({
  villa,
  index,
}: {
  villa: HomepageStayVilla;
  index: number;
}) {
  return (
    <article className={styles.item}>
      <Link href={villa.href} className={styles.card} aria-label={`View ${cleanVillaName(villa.name)}`}>
        <VillaImage villa={villa} priority={index === 0} />
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3>{cleanVillaName(villa.name)}</h3>
            <span className={styles.arrow} aria-hidden="true"><FiArrowUpRight /></span>
          </div>
          <VillaFacts villa={villa} />
          <p className={styles.location}>{villa.location}</p>
          <p className={styles.price}>{getPriceLabel(villa)}</p>
        </div>
      </Link>
    </article>
  );
}

export default function StayCollectionGrid({ villas }: StayCollectionGridProps) {
  const displayVillas = villas.slice(0, 6);
  const row1 = displayVillas.slice(0, 3);
  const row2 = displayVillas.slice(3, 6);

  return (
    <div className={styles.gridContainer}>
      <div className={styles.scrollRow} role="region" aria-label="Featured stays row 1">
        {row1.map((villa, index) => (
          <StayVillaCard key={String(villa.id)} villa={villa} index={index} />
        ))}
      </div>
      {row2.length > 0 && (
        <div className={styles.scrollRow} role="region" aria-label="Featured stays row 2">
          {row2.map((villa, index) => (
            <StayVillaCard key={String(villa.id)} villa={villa} index={index + 3} />
          ))}
        </div>
      )}
    </div>
  );
}
