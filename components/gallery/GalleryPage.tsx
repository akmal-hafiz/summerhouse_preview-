"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./GalleryPage.module.css";

const fadeUp = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.24 },
  transition: { duration: 0.92, ease: [0.22, 1, 0.36, 1] as const },
};

const imageMotion = {
  initial: { opacity: 0, y: 46, scale: 0.985 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] as const },
};

type GalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

function GalleryImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: GalleryImageProps) {
  return (
    <motion.figure {...imageMotion} className={`${styles.imageFrame} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={styles.image}
      />
    </motion.figure>
  );
}

export default function GalleryPage() {
  return (
    <div className={styles.galleryPage}>
      <section className={styles.intro}>
        <motion.p {...fadeUp} className={styles.kicker}>
          The
        </motion.p>
        <motion.h1 {...fadeUp}>Gallery</motion.h1>
        <motion.p {...fadeUp} className={styles.introText}>
          A slow walk through private pools, sun-warmed rooms, quiet thresholds, and the details that make a
          Summerhouses stay feel unmistakably Bali.
        </motion.p>
      </section>

      <section className={styles.heroImageSection}>
        <GalleryImage
          src="/homepage_villa/curated-6-exterior.webp"
          alt="Summerhouses Bali villa exterior with tropical architecture"
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <motion.p {...fadeUp} className={styles.heroCaption}>
          Architecture, shade, and open air shape the first impression before the stay begins.
        </motion.p>
      </section>

      <section className={`${styles.editorialBlock} ${styles.editorialBlockA}`}>
        <GalleryImage
          src="/homepage_villa/curated-2-detail.webp"
          alt="Quiet villa bedroom details in soft light"
          className={styles.portraitSmall}
        />
        <motion.div {...fadeUp} className={styles.textBlock}>
          <span>01 / Arrival mood</span>
          <h2>Where peace has a texture.</h2>
          <p>
            Soft walls, natural shadows, and a slower pace invite the day to begin without urgency.
          </p>
        </motion.div>
      </section>

      <section className={styles.floatingPair}>
        <GalleryImage
          src="/homepage_villa/curated-5-lounge.webp"
          alt="Summerhouses lounge with curved architecture"
          className={styles.floatOne}
        />
        <motion.div {...fadeUp} className={`${styles.textBlock} ${styles.floatText}`}>
          <span>Graceful arcs</span>
          <h2>Rooms designed around quiet movement.</h2>
        </motion.div>
        <GalleryImage
          src="/homepage_villa/curated-8.webp"
          alt="Villa interior framed by arched openings"
          className={styles.floatTwo}
        />
      </section>

      <section className={styles.splitStory}>
        <motion.div {...fadeUp} className={styles.textBlock}>
          <span>02 / Unrivaled sophistication</span>
          <h2>Every frame is meant to feel lived in, not staged.</h2>
          <p>
            The homes are selected for proportion, mood, and the way sunlight softens across the day.
          </p>
        </motion.div>
        <GalleryImage
          src="/homepage_villa/villaarta.webp"
          alt="Private Bali villa pool and exterior"
          className={styles.landscapeLarge}
        />
      </section>

      <section className={styles.wideShowcase}>
        <GalleryImage
          src="/homepage_villa/curated-1-main.webp"
          alt="Cinematic Summerhouses villa room with pool foreground"
          sizes="(min-width: 1024px) 78vw, 100vw"
          className={styles.wideImage}
        />
        <motion.div {...fadeUp} className={styles.wideCaption}>
          <h2>Ethereal harmony</h2>
          <p>
            The best spaces do not demand attention. They let the island breathe through them.
          </p>
        </motion.div>
      </section>

      <section className={styles.quoteComposition}>
        <GalleryImage
          src="/homepage_villa/curated-4-view.webp"
          alt="Sunlit Bali villa exterior at golden hour"
          className={styles.quoteImage}
        />
        <motion.div {...fadeUp} className={styles.quoteBlock}>
          <span>Summerhouses / Calm stays</span>
          <h2>Absolute Tranquility</h2>
          <p>
            A private home should hold enough quiet for the whole trip to soften.
          </p>
        </motion.div>
      </section>

      <section className={styles.fullInterior}>
        <GalleryImage
          src="/homepage_villa/CactusEstate.webp"
          alt="Bright villa interior with pool and curved walls"
          sizes="100vw"
          className={styles.interiorImage}
        />
      </section>

      <section className={styles.floatingPairAlt}>
        <GalleryImage
          src="/homepage_villa/officiana17.webp"
          alt="Minimal villa bedroom with calm neutral tones"
          className={styles.altOne}
        />
        <motion.div {...fadeUp} className={`${styles.textBlock} ${styles.altText}`}>
          <span>Heavenly whites</span>
          <h2>Clean lines, warm light, and room to exhale.</h2>
        </motion.div>
        <GalleryImage
          src="/homepage_villa/glass_house.png"
          alt="Summerhouses villa framed by tropical glass architecture"
          className={styles.altTwo}
        />
      </section>

      <section className={styles.panoramaStrip}>
        <GalleryImage
          src="/homepage_villa/TKR03549-HDR.webp"
          alt="Panoramic Summerhouses villa bedroom and pool"
          sizes="100vw"
          className={styles.panoramaImage}
        />
      </section>

      <section className={styles.featureHighlight}>
        <motion.div {...fadeUp} className={styles.textBlock}>
          <span>03 / Sculptural warmth</span>
          <h2>Architecture that feels soft at the edges.</h2>
          <p>
            Every threshold is an invitation to move slowly: from water to room, from daylight to evening.
          </p>
        </motion.div>
        <GalleryImage
          src="/homepage_villa/rumahmimosa.webp"
          alt="Elegant Summerhouses villa interior in warm tones"
          className={styles.featureImage}
        />
      </section>

      <section className={styles.finalShowcase}>
        <GalleryImage
          src="/homepage_villa/88east.webp"
          alt="Summerhouses private villa with pool and lounge setting"
          sizes="100vw"
          className={styles.finalImage}
        />
      </section>

      <section className={styles.reserveCta}>
        <Image
          src="/homepage_villa/curated-7.webp"
          alt="Summerhouses Bali pool surrounded by tropical garden"
          fill
          sizes="100vw"
          className={styles.ctaImage}
        />
        <div className={styles.ctaOverlay} />
        <motion.div {...fadeUp} className={styles.ctaContent}>
          <span>Summerhouses Bali</span>
          <h2>Reserve your stay</h2>
          <p>Choose a private home shaped by light, comfort, and the quieter side of island living.</p>
          <Link href="/villas">Explore villas</Link>
        </motion.div>
      </section>
    </div>
  );
}
