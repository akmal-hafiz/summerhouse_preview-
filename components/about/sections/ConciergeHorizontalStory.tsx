"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { featuredConciergeServices } from "@/lib/concierge";
import styles from "./ConciergeHorizontalStory.module.css";
import { useMotionSettings } from "@/components/providers/MotionPreferenceProvider";

export default function ConciergeHorizontalStory({
  content,
}: {
  content?: {
    title?: string;
    title_emphasis?: string;
    description?: string;
    quote?: string;
    link_label?: string;
  };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduced: reducedMotion, ready } = useMotionSettings();
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !ready || reducedMotion) return;
    const mm = gsap.matchMedia();
    // Vertical page scrolling advances the same horizontal story on every
    // screen size. Reduced-motion users instead get a native horizontal scrollport.
    const setupHorizontalStory = () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { id: "about-concierge-horizontal", trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return () => tween.kill();
    };
    mm.add("(min-width: 0px)", setupHorizontalStory);
    return () => mm.revert();
  }, { scope: sectionRef, dependencies: [reducedMotion, ready], revertOnUpdate: true });

  return (
    <section id="concierge" ref={sectionRef} className={styles.section} aria-labelledby="about-concierge-title" tabIndex={reducedMotion ? 0 : undefined}>
      <div ref={trackRef} className={styles.track}>
        <header className={styles.intro}>
          <h2 id="about-concierge-title">
            {content?.title || "More than a villa"}
            <em>{content?.title_emphasis || "your Bali stay, considered."}</em>
          </h2>
          <p className={styles.lede}>
            {content?.description || "Thoughtful support before arrival and throughout your stay."}
          </p>
        </header>
        {featuredConciergeServices.map((service, index) => (
          <article className={styles.card} key={service.id} style={{ zIndex: index + 1 }}>
            <div className={styles.media}><Image src={service.image} alt={service.alt} fill sizes="(min-width:1024px) 48vw, 86vw" /></div>
            <div className={styles.copy}><span>{String(index + 1).padStart(2, "0")} /</span><div><h3>{service.title}</h3><p>{service.summary}</p></div></div>
          </article>
        ))}
        <aside className={styles.closing} style={{ zIndex: featuredConciergeServices.length + 1 }}>
          <div className={styles.team}><span className={styles.teamMark}>SH</span><p><strong>Summerhouse Guest Experience</strong><small>Concierge Team, Bali</small></p></div>
          <blockquote>
            &ldquo;{content?.quote || "The best stays feel effortless because the right help is already close."}&rdquo;
          </blockquote>
          <Link href="/contact" data-motion-link>{content?.link_label || "Contact concierge"}</Link>
        </aside>
      </div>
    </section>
  );
}
