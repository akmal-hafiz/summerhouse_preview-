"use client";

import Image from "next/image";
import styles from "./ProjectMarquee.module.css";

/** Intrinsic w/h kept per image so each keeps its natural ratio at a fixed height. */
const RAIL_IMAGES = [
  { src: "/homepage_villa/curated-1-main.webp", alt: "Summerhouse villa living space", w: 3478, h: 2319 },
  { src: "/homepage_villa/curated-3-corner.webp", alt: "Summerhouse villa corner detail", w: 2268, h: 4032 },
  { src: "/homepage_villa/curated-5-lounge.webp", alt: "Summerhouse villa lounge", w: 1536, h: 2730 },
  { src: "/homepage_villa/curated-4-pool.webp", alt: "Summerhouse villa pool", w: 2268, h: 4032 },
  { src: "/homepage_villa/88east.webp", alt: "Summerhouse villa interior", w: 4032, h: 3024 },
  { src: "/homepage_villa/VillaZen.webp", alt: "Summerhouse villa quiet room", w: 1024, h: 768 },
  { src: "/homepage_villa/curated-7.webp", alt: "Summerhouse villa terrace", w: 1536, h: 2730 },
  { src: "/homepage_villa/rumahmimosa.webp", alt: "Summerhouse villa garden", w: 2048, h: 1365 },
];

/**
 * Full-bleed infinite film-strip. Two identical sets scroll as one track; the
 * -50% translate hands off seamlessly. Pure CSS, paused on hover.
 */
export default function ProjectMarquee() {
  return (
    <section className={styles.wrapper} aria-label="Summerhouse spaces">
      <div className={styles.track}>
        {[...RAIL_IMAGES, ...RAIL_IMAGES].map((image, index) => (
          <div className={styles.item} key={`${image.src}-${index}`} aria-hidden={index >= RAIL_IMAGES.length}>
            <Image
              src={image.src}
              alt={index < RAIL_IMAGES.length ? image.alt : ""}
              height={image.h}
              width={image.w}
              className={styles.image}
              sizes="480px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
