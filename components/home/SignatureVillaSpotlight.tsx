"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import type { SignatureVilla } from "@/lib/lodgify/types";
import AwardCredential from "./AwardCredential";
import styles from "./SignatureVillaSpotlight.module.css";

type SignatureVillaSpotlightProps = {
  villa: SignatureVilla | null;
  variant: "desktop" | "mobile";
};

function cleanVillaName(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function getImage(villa: SignatureVilla, index: number) {
  return villa.images[index] || villa.imageUrl || "/homepage_villa/curated-6-exterior.webp";
}

function humanizeFeature(feature: string) {
  const normalized = feature
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/^wi[\s-]?fi$/i.test(normalized)) return "WiFi";

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getFeatures(villa: SignatureVilla) {
  const amenities = villa.amenitiesPreview.filter(Boolean).map(humanizeFeature);
  const facts = [
    villa.guests ? `${villa.guests} guests` : null,
    villa.bedrooms ? `${villa.bedrooms} bedrooms` : null,
    villa.bathrooms ? `${villa.bathrooms} bathrooms` : null,
  ].filter(Boolean) as string[];

  return Array.from(new Set([...amenities, ...facts])).slice(0, 6);
}

function getNextAvailableIndex(currentIndex: number, excludeIndex: number, length: number) {
  if (length <= 3) return (currentIndex + 1) % length;

  let next = (currentIndex + 1) % length;
  while (next === 0 || next === excludeIndex) {
    next = (next + 1) % length;
  }
  return next;
}

function FadingImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`${styles.fadingMedia} ${className || ""}`}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={styles.fadingLayer}
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

function FeatureList({ villa }: { villa: SignatureVilla }) {
  return (
    <div className={styles.features}>
      <p className={styles.eyebrow}>Key features</p>
      <ul className={styles.featureList}>
        {getFeatures(villa).map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
      <Link href={villa.href} className={styles.inlineLink}>
        View this stay
        <FiArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}

function DistinctiveCopy({ villa }: { villa: SignatureVilla }) {
  return (
    <div className={styles.distinctive}>
      <p className={styles.eyebrow}>What makes it distinct</p>
      <p className={styles.distinctiveCopy}>{villa.whyThisHome}</p>
      {villa.award ? <AwardCredential award={villa.award} /> : null}
    </div>
  );
}

export default function SignatureVillaSpotlight({ villa, variant }: SignatureVillaSpotlightProps) {
  const [indices, setIndices] = useState({ mid: 1, small: 2 });
  const stepRef = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !villa?.images || villa.images.length <= 3) return;

    const imagesLength = villa.images.length;
    const interval = window.setInterval(() => {
      const currentStep = stepRef.current;
      setIndices((previous) => {
        if (currentStep === 0) {
          return {
            ...previous,
            mid: getNextAvailableIndex(previous.mid, previous.small, imagesLength),
          };
        }
        return {
          ...previous,
          small: getNextAvailableIndex(previous.small, previous.mid, imagesLength),
        };
      });
      stepRef.current = currentStep === 0 ? 1 : 0;
    }, 4500);

    return () => window.clearInterval(interval);
  }, [reduceMotion, villa]);

  if (!villa) return null;

  const title = cleanVillaName(villa.name);
  const location = villa.address || villa.location;

  if (variant === "mobile") {
    return (
      <section className={`${styles.section} ${styles.mobileSection}`}>
        <div className={styles.mobileContainer}>
          <motion.header
            className={styles.header}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className={styles.mobileTitle}>{title}</h2>
            <p className={styles.location}>{location}</p>
          </motion.header>

          <div className={styles.mobileStack}>
          <motion.div
            className={styles.mobilePrimary}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link className={styles.mediaLink} href={villa.href}>
              <Image
                src={getImage(villa, 0)}
                alt={villa.name}
                fill
                sizes="calc(100vw - 2.5rem)"
                priority
                className="object-cover"
              />
            </Link>
          </motion.div>

          <motion.div
            className={styles.mobileLandscape}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <FadingImage
              className={styles.landscapeMedia}
              src={getImage(villa, indices.mid)}
              alt={`${villa.name} detail`}
              sizes="calc(100vw - 2.5rem)"
            />
          </motion.div>

          <motion.div
            className={styles.mobileDistinctive}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <DistinctiveCopy villa={villa} />
          </motion.div>

          <motion.div
            className={styles.mobileFeatures}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <FeatureList villa={villa} />
          </motion.div>

          <motion.div
            className={styles.mobileLandscape}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <FadingImage
              className={styles.landscapeMedia}
              src={getImage(villa, indices.small)}
              alt={`${villa.name} lifestyle`}
              sizes="calc(100vw - 2.5rem)"
            />
          </motion.div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.section} ${styles.desktopSection}`}>
      <div className={styles.desktopContainer}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className={styles.desktopTitle}>{title}</h2>
          <p className={styles.location}>{location}</p>
        </motion.header>

        <div className={styles.desktopGrid}>
          <motion.div
            className={styles.primaryRail}
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link className={`${styles.mediaLink} ${styles.primaryMedia}`} href={villa.href}>
              <Image
                src={getImage(villa, 0)}
                alt={villa.name}
                fill
                sizes="(min-width: 1200px) 36vw, 50vw"
                className="object-cover"
              />
            </Link>
          </motion.div>

          <motion.div
            className={styles.centerRail}
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <FadingImage
              className={styles.landscapeMedia}
              src={getImage(villa, indices.mid)}
              alt={`${villa.name} detail`}
              sizes="31vw"
            />
            <div className={styles.centerFeatures}>
              <FeatureList villa={villa} />
            </div>
          </motion.div>

          <motion.div
            className={styles.rightRail}
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
          >
            <DistinctiveCopy villa={villa} />
            <div className={styles.rightMedia}>
              <FadingImage
                className={styles.landscapeMedia}
                src={getImage(villa, indices.small)}
                alt={`${villa.name} lifestyle`}
                sizes="27vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
