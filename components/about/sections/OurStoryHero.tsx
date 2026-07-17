"use client";

import styles from "./OurStoryHero.module.css";

/**
 * Editorial text hero — a massive "Our Story." wordmark on the left, a two-part
 * narrative on the right (muted lead + solid follow-up), and a quiet scroll cue
 * anchored to the bottom. White stage, no imagery: the type is the hero.
 */
export default function OurStoryHero() {
  return (
    <section className={styles.hero} aria-label="Our story">
      <div className={styles.inner}>
        <h1 className={styles.heading}>Our Story.</h1>

        <div className={styles.body}>
          <p className={styles.lead}>
            Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief:
            a great stay should feel personal before it looks impressive.
          </p>
          <p className={styles.para}>
            Years later, that still shapes every home we curate — across Canggu, Ubud, Pererenan,
            and the quiet corners of the island in between.
          </p>
        </div>
      </div>

      <a className={styles.scrollCue} href="#trust" aria-label="Scroll to why travelers trust Summerhouses">
        <span>Trusted by travelers worldwide</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v14" />
          <path d="m6 13 6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
