"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import styles from "./StudioStatement.module.css";

/* Enough frames per rail to overflow the clipped 100vh window at every
   parallax position, so the columns never reveal a gap as they translate. */
const LEFT_IMAGES = [
  "/homepage_villa/curated-2-detail.webp",
  "/homepage_villa/curated-5-lounge.webp",
  "/homepage_villa/curated-4-view.webp",
  "/homepage_villa/curated-1-main.webp",
  "/homepage_villa/curated-3-corner.webp",
  "/homepage_villa/VillaZen.webp",
  "/homepage_villa/88east.webp",
  "/homepage_villa/curated-8.webp",
];

const RIGHT_IMAGES = [
  "/homepage_villa/curated-7.webp",
  "/homepage_villa/rumahmimosa.webp",
  "/homepage_villa/CactusEstate.webp",
  "/homepage_villa/villaarta.webp",
  "/homepage_villa/officiana17.webp",
  "/homepage_villa/curated-5-lounge.webp",
  "/homepage_villa/curated-4-view.webp",
  "/homepage_villa/88east.webp",
];

/**
 * Dark editorial "About us" stage — a left-aligned manifesto floating in black
 * negative space, flanked by two vertical image rails. The section is exactly
 * one viewport tall; the rails are clipped to it and translate ONLY on scroll
 * (parallax tied to scroll position — no autoplay), both drifting upward at
 * slightly different rates as the section passes through the viewport.
 */
export default function StudioStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], ["-6%", "-34%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], ["-4%", "-40%"]);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="About Summerhouses">
      <div className={styles.col} aria-hidden="true">
        <motion.div className={styles.track} style={{ y: leftY }}>
          {LEFT_IMAGES.map((src, index) => (
            <div className={styles.frame} key={`${src}-${index}`}>
              <Image src={src} alt="" fill sizes="240px" className={styles.img} />
            </div>
          ))}
        </motion.div>
      </div>

      <div className={styles.center}>
        <p className={styles.eyebrow}>The gallery</p>
        <p className={styles.primary}>
          A closer look at the spaces you&rsquo;ll actually live in.
        </p>
        <p className={styles.secondary}>
          The light through the morning kitchen, the pool at dusk, the quiet corners between rooms.
          Every villa is photographed the way you&rsquo;ll remember it — so what you see is what you arrive to.
        </p>
        <InteractiveHoverButton
          href="/gallery"
          className={`${styles.galleryCta} ihb-fill-light`}
        >
          View the full gallery
        </InteractiveHoverButton>
      </div>

      <div className={styles.col} aria-hidden="true">
        <motion.div className={styles.track} style={{ y: rightY }}>
          {RIGHT_IMAGES.map((src, index) => (
            <div className={styles.frame} key={`${src}-${index}`}>
              <Image src={src} alt="" fill sizes="240px" className={styles.img} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
