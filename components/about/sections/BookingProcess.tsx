"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BookingProcess.module.css";

type BookingStep = {
  number: string;
  title: string;
  description: string;
  images: [string, string];
};

type BookingProcessContent = {
  eyebrow?: string;
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
        <div className={styles.polaroids} aria-hidden="true" data-polaroids>
          {step.images.map((src, imageIndex) => (
            <span className={styles.polaroid} key={src}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 720px) 112px, 126px"
                className={styles.image}
                priority={index < 2}
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

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(`.${styles.title}`, {
          opacity: 0,
          y: 26,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            once: true,
          },
        });

        gsap.from("[data-booking-step]", {
          opacity: 0,
          y: 42,
          duration: 1,
          stagger: 0.13,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 56%",
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-polaroids]").forEach((stack, index) => {
          gsap.to(stack, {
            yPercent: index % 2 === 0 ? -9 : -6,
            rotate: index % 2 === 0 ? -1.3 : 1.3,
            ease: "none",
            scrollTrigger: {
              trigger: stack,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="booking-process-title">
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
          <Link href="/villas">{content?.link_label || "Explore villas"}</Link>
        </aside>
      </div>
    </section>
  );
}
