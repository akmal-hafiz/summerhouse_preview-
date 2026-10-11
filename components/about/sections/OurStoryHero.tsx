"use client";

import styles from "./OurStoryHero.module.css";

/**
 * Editorial text hero — a massive "Our Story." wordmark on the left, a two-part
 * narrative on the right (muted lead + solid follow-up). White stage, no
 * imagery: the type is the hero.
 */
type OurStoryHeroProps = {
  content?: {
    heading?: string;
    lead?: string;
    body?: string;
  };
};

export default function OurStoryHero({ content }: OurStoryHeroProps) {
  return (
    <section id="our-story" className={styles.hero} aria-label="Our story">
      <div className={styles.inner}>
        <h1 className={styles.heading}>{content?.heading || "Our Story."}</h1>

        <div className={styles.body}>
          <p className={styles.lead}>
            {content?.lead ||
              "Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief: a great stay should feel personal before it looks impressive."}
          </p>
          <p className={styles.para}>
            {content?.body ||
              "Years later, that still shapes every home we curate across Canggu, Ubud, Pererenan, and the quiet corners of the island in between."}
          </p>
        </div>
      </div>
    </section>
  );
}
