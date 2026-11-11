"use client";

import EditorialImage from "../EditorialImage";
import { useMemo } from "react";
import styles from "./TrustRecognition.module.css";

type Pillar = {
  id: string;
  name: string;
  desc: string;
  scope?: string;
};

const DEFAULT_PILLARS: Pillar[] = [
  { id: "chosen-homes", name: "Thoughtfully Chosen Villas", desc: "Homes selected for comfort, privacy, and a true sense of place." },
  { id: "calm", name: "Room to Slow Down", desc: "Quiet spaces and an unhurried way to experience Bali." },
  { id: "hospitality", name: "Personal Hospitality", desc: "Warm, attentive support from people who know the island." },
  { id: "local", name: "Local Insight", desc: "Trusted recommendations shaped around the days you want to have." },
  { id: "clarity", name: "Clear From the Start", desc: "Straightforward booking, secure payments, and transparent details." },
  { id: "seamless", name: "A Seamless Stay", desc: "From arrival to departure, the details are quietly taken care of." },
];

const LEGACY_PILLAR_IDS = "verified,support,concierge,booking,pricing";

export default function TrustRecognition({ content }: {
  content?: {
    heading?: string;
    feature_image?: string;
    pillars?: Array<Partial<Pillar>>;
  };
}) {
  const savedHeading = content?.heading?.trim();
  const heading = savedHeading && savedHeading !== "A decade of stays, thoughtfully hosted."
    ? savedHeading
    : "Why stay at Summerhouses";
  const pillars = useMemo(() => {
    const saved = content?.pillars;
    if (!saved?.length || saved.map((item) => item.id).join(",") === LEGACY_PILLAR_IDS) {
      return DEFAULT_PILLARS;
    }
    return saved.filter((item) => item.name && item.desc).map((item, index) => ({
      id: item.id || `reason-${index + 1}`,
      name: item.name || "",
      desc: item.desc || "",
    }));
  }, [content?.pillars]);

  return (
    <section className={styles.section} id="trust-recognition" aria-labelledby="why-stay-title">
      <div className={styles.inner}>
        <aside className={styles.visual}>
          <h2 id="why-stay-title" className={styles.heading}>{heading}</h2>
          <div className={styles.imageFrame} data-about-reveal>
            <EditorialImage
              fallbackSrc="/homepage_villa/88east.webp"
              src={content?.feature_image || "/homepage_villa/88east.webp"}
              alt="Summerhouses Bali villa interior"
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1000px) 40vw, 28vw"
              className={styles.image}
            />
          </div>
        </aside>
        <ol className={styles.list}>
          {pillars.map((pillar, index) => (
            <li key={pillar.id} className={styles.row}>
              <p className={styles.description}>{pillar.desc}</p>
              <h3 className={styles.name}>{pillar.name}</h3>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
