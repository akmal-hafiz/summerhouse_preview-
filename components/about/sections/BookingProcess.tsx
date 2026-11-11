"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import styles from "./BookingProcess.module.css";

type BookingStep = {
  number: string;
  title: string;
  description: string;
  images: [string, string];
};

type BookingProcessContent = {
  title?: string;
  title_emphasis?: string;
  closing_copy?: string;
  link_label?: string;
  steps?: Array<{
    title?: string;
    description?: string;
    images?: string[];
  }>;
};

const BOOKING_STEPS: BookingStep[] = [
  {
    number: "01",
    title: "Discover your villa",
    description: "Browse our collection and find a home that fits the way you want to stay.",
    images: ["/homepage_villa/curated-1-main.webp", "/homepage_villa/curated-2-detail.webp"],
  },
  {
    number: "02",
    title: "Choose your dates",
    description: "Select your travel dates and see live availability for your chosen villa.",
    images: ["/homepage_villa/curated-4-pool.webp", "/homepage_villa/curated-5-lounge.webp"],
  },
  {
    number: "03",
    title: "Confirm your stay",
    description: "Review your details, live rate, and complete a secure Lodgify checkout.",
    images: ["/homepage_villa/rumahmimosa.webp", "/homepage_villa/villaarta.webp"],
  },
  {
    number: "04",
    title: "Arrive with ease",
    description: "Your Bali stay is confirmed, with our local team close by whenever needed.",
    images: ["/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-6-exterior.webp"],
  },
];

function ProcessStep({ step, index }: { step: BookingStep; index: number }) {
  return (
    <article className={`${styles.cell} ${styles.step} ${styles[`step${index + 1}`]}`} data-booking-step>
      <div className={styles.stepMeta}>
        <span>Step {step.number}</span>
        <span className={styles.progress} aria-hidden="true">
          {[0, 1, 2, 3].map((dot) => (
            <i key={dot} className={dot <= index ? styles.activeDot : undefined} />
          ))}
        </span>
      </div>

      <div className={styles.stepContent}>
        <div className={styles.polaroids} aria-hidden="true" data-about-reveal data-polaroids>
          {step.images.map((src, imageIndex) => (
            <span className={styles.polaroid} key={src}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 720px) 112px, 126px"
                className={styles.image}
              />
            </span>
          ))}
        </div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
    </article>
  );
}

export default function BookingProcess({ content }: { content?: BookingProcessContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const steps: BookingStep[] =
    content?.steps
      ?.filter((step) => step.title && step.description)
      .map((step, index) => ({
        number: String(index + 1).padStart(2, "0"),
        title: step.title as string,
        description: step.description as string,
        images: [
          step.images?.[0] || BOOKING_STEPS[index % BOOKING_STEPS.length].images[0],
          step.images?.[1] || step.images?.[0] || BOOKING_STEPS[index % BOOKING_STEPS.length].images[1],
        ],
      })) || BOOKING_STEPS;

  return (
    <section id="booking-process" ref={sectionRef} className={styles.section} aria-labelledby="booking-process-title">
      <div className={styles.grid}>
        <div className={`${styles.cell} ${styles.blankTopLeft}`} aria-hidden="true" />

        <header className={`${styles.cell} ${styles.header}`}>
          <h2 id="booking-process-title" className={styles.title}>
            {content?.title || "Secure your stay"}
            <em>{content?.title_emphasis || "with ease"}</em>
          </h2>
        </header>

        <div className={`${styles.cell} ${styles.blankTopRight}`} aria-hidden="true" />

        <div className={`${styles.cell} ${styles.orbitCell}`} aria-hidden="true">
          <div className={styles.orbits}>
            <span />
            <span />
            <span />
          </div>
        </div>

        {steps.map((step, index) => (
          <ProcessStep step={step} index={index} key={step.number} />
        ))}

        <aside className={`${styles.cell} ${styles.ctaCell}`}>
          <p>{content?.closing_copy || "Your Bali stay, thoughtfully arranged."}</p>
          <Link href="/villas" data-motion-link>{content?.link_label || "Explore villas"}</Link>
        </aside>
      </div>
    </section>
  );
}
