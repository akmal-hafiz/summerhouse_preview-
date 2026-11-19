"use client";

import Link from "next/link";
import { useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";
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

// The facts of the recognition as a ruled list, in the same hairline language as the villa feature list above.
function CreditFacts({ recognition }: { recognition: WhyStayRecognition }) {
  const title = recognition.title || "Best Villa in Bali 2024";
  return (
    <ul className={styles.facts}>
      <li>{recognition.type === "publication" ? "Publication" : "Award"}</li>
      {recognition.issuer ? <li>{recognition.issuer}</li> : null}
      <li className={styles.factTitle}>{title}</li>
      {recognition.villa_name ? <li>{recognition.villa_name}</li> : null}
      {recognition.year && !title.includes(recognition.year) ? <li>{recognition.year}</li> : null}
    </ul>
  );
}

export default function WhyStaySection({ content }: { content?: WhyStayContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const recognition = normalizeRecognition(content);
  const href = safeHttpHref(recognition.url, "");
  const contextTitle = content?.context_title?.trim() || fallbackContextTitle;
  const supportingCopy = content?.supporting_copy?.trim() || fallbackSupportingCopy;
  const sourceName = recognition.name || "Honeycombers";

  useGSAP(
    () => {
      const elements = gsap.utils.toArray<HTMLElement>("[data-recognition-reveal]");
      if (reduceMotion) {
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        elements,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.52,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  if (content?.is_visible === false || recognition.is_visible === false) return null;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="recognition-title" data-home-recognition>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h2 id="recognition-title" data-recognition-reveal>{contextTitle}</h2>
          <div className={styles.aside}>
            <p data-recognition-reveal>{supportingCopy}</p>
            <div className={styles.credit} data-recognition-reveal>
              {href ? (
                <Link
                  className={styles.source}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${sourceName} recognition for ${recognition.villa_name || "Summerhouse"}`}
                >
                  {sourceName}
                  <FiArrowUpRight aria-hidden="true" />
                </Link>
              ) : (
                <p className={styles.source}>{sourceName}</p>
              )}
              <CreditFacts recognition={recognition} />
            </div>
          </div>
        </header>
      </div>
    </section>
  );
}
