"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { safeHttpHref } from "@/lib/safe-url";
import styles from "./WhyStaySection.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type WhyStayAward = {
  name?: string;
  issuer?: string;
  year?: string;
  url?: string;
};

export type WhyStayRecognition = {
  type?: "award" | "publication";
  name?: string;
  issuer?: string;
  title?: string;
  year?: string;
  lodgify_property_id?: string;
  villa_name?: string;
  url?: string;
  image?: string;
  image_alt?: string;
  is_visible?: boolean;
};

export type WhyStayContent = {
  context_title?: string;
  supporting_copy?: string;
  recognition?: WhyStayRecognition;
  recognitions?: WhyStayRecognition[];
  awards?: WhyStayAward[];
  is_visible?: boolean;
};

const fallbackContextTitle = "A stay recognised for the details.";
const fallbackSupportingCopy =
  "Ubud Zen River House was named Gold Winner for Best Villa in Bali 2024 by Honeycombers. A recognition of the thoughtful design, setting, and care behind the stay.";

const fallbackRecognition: WhyStayRecognition = {
  type: "award",
  name: "Honeycombers",
  issuer: "Gold Winner",
  title: "Best Villa in Bali 2024",
  year: "2024",
  villa_name: "Ubud Zen River House",
  is_visible: true,
};

function hasRecognitionContent(item?: WhyStayRecognition): item is WhyStayRecognition {
  return Boolean(
    item &&
      item.is_visible !== false &&
      (item.name?.trim() || item.title?.trim() || item.issuer?.trim()),
  );
}

function normalizeRecognition(content?: WhyStayContent): WhyStayRecognition {
  if (hasRecognitionContent(content?.recognition)) return content.recognition;

  const legacyRecognitions = (content?.recognitions || []).filter(hasRecognitionContent);
  const honeycombers = legacyRecognitions.find((item) =>
    [item.name, item.issuer, item.title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes("honeycombers"),
  );
  if (honeycombers) return honeycombers;
  if (legacyRecognitions[0]) return legacyRecognitions[0];

  const legacyAward = content?.awards?.find((item) => item.name?.trim());
  return legacyAward ? { ...legacyAward, type: "award", is_visible: true } : fallbackRecognition;
}

function Credential({ recognition }: { recognition: WhyStayRecognition }) {
  return (
    <span className={styles.credential}>
      <strong data-recognition-reveal>{recognition.name || "Honeycombers"}</strong>
      <span className={styles.details} data-recognition-reveal>
        <small>{recognition.type === "publication" ? "Publication" : "Award"}</small>
        {recognition.issuer ? <span>{recognition.issuer}</span> : null}
        <b>{recognition.title || "Best Villa in Bali 2024"}</b>
        {recognition.villa_name ? <span>{recognition.villa_name}</span> : null}
        {recognition.year && !recognition.title?.includes(recognition.year) ? (
          <span className={styles.year}>{recognition.year}</span>
        ) : null}
      </span>
    </span>
  );
}

export default function WhyStaySection({ content }: { content?: WhyStayContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const recognition = normalizeRecognition(content);
  const href = safeHttpHref(recognition.url, "");
  const contextTitle = content?.context_title?.trim() || fallbackContextTitle;
  const supportingCopy = content?.supporting_copy?.trim() || fallbackSupportingCopy;

  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>("[data-recognition-reveal]");
      if (reduceMotion) {
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        elements,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.09,
          duration: 0.72,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  if (content?.is_visible === false || recognition.is_visible === false) return null;

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Summerhouse recognition">
      <div className={styles.shell}>
        <header className={styles.header}>
          <h2 data-recognition-reveal>{contextTitle}</h2>
          <p data-recognition-reveal>{supportingCopy}</p>
        </header>
        {href ? (
          <Link
            className={styles.panel}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${recognition.name || "Honeycombers"} recognition for ${recognition.villa_name || "Summerhouse"}`}
          >
            <Credential recognition={recognition} />
          </Link>
        ) : (
          <div className={styles.panel}>
            <Credential recognition={recognition} />
          </div>
        )}
      </div>
    </section>
  );
}
