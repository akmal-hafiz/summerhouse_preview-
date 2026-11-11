"use client";

import Image from "next/image";
import styles from "./AboutHero.module.css";

/**
 * Full-screen cinematic About hero. A massive stacked wordmark sits centre-left
 * over a naturally moody interior; metadata rides the right edge and the tagline
 * anchors the bottom-left. No overlay gradient — the image's own darkness carries
 * the mood. The site's global navbar provides the top nav.
 */
export default function AboutHero() {
  return (
    <section className={styles.hero} aria-label="Summerhouse Bali">
      <Image
        src="/homepage_villa/curated-6-exterior.webp"
        alt="Summerhouses Bali private villa with tropical architecture"
        fill
        priority
        sizes="100vw"
        className={styles.bg}
      />

      <h1 className={styles.heading}>
        <span className={styles.line1}>Summer</span>
        <span className={styles.line2}>House.</span>
      </h1>

      <p className={styles.meta}>
        <span>Based in Bali</span>
        <span className={styles.divider} aria-hidden="true">//</span>
        <span>Private villas</span>
      </p>

      <p className={styles.tagline}>
        We curate Bali villas for travelers who want more than a beautiful room. They want a home that
        feels considered, cared for, and quietly connected to the island around it.
      </p>
    </section>
  );
}
