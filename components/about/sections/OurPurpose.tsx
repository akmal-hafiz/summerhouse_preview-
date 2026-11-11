"use client";

import EditorialImage from "../EditorialImage";
import styles from "./OurPurpose.module.css";

type PurposeContent = {
  heading?: string;
  vision_title?: string;
  vision_body?: string;
  mission_title?: string;
  mission_body?: string;
  image?: string;
};

export default function OurPurpose({ content }: { content?: PurposeContent }) {
  return (
    <section id="our-purpose" className={styles.section} aria-labelledby="purpose-title">
      <div className={styles.inner}>
        <h2 id="purpose-title" className={styles.heading}>{content?.heading || "Our Purpose"}</h2>
        <div className={styles.visionLabel}>
          <h3>{content?.vision_title || "Vision"}</h3>
        </div>
        <p className={styles.visionBody}>
          {content?.vision_body || "To make Bali stays feel more personal, with distinctive homes and a local team guests can trust."}
        </p>
        <div className={styles.imageFrame} data-about-reveal>
          <EditorialImage
            fallbackSrc="/homepage_villa/curated-1-main.webp"
            src={content?.image || "/homepage_villa/curated-1-main.webp"}
            alt="Summerhouses Bali villa detail"
            fill
            sizes="(max-width: 700px) 150px, 160px"
            className={styles.image}
          />
        </div>
        <div className={styles.mission}>
          <h3>{content?.mission_title || "Mission"}</h3>
          <p>{content?.mission_body || "We curate villas with character, care for the details before arrival, and stay close whenever guests need us."}</p>
        </div>
      </div>
    </section>
  );
}
