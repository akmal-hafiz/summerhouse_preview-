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

const zoomInVariant = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  whileInView: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: (index % 3) * 0.08,
    },
  }),
  viewport: { once: true, amount: 0.12 },
};

const defaultGalleryItems = [
  {
    type: "image",
    id: "gallery-hero",
    src: "/homepage_villa/curated-6-exterior.webp",
    alt: "Summerhouses Bali villa exterior with tropical architecture",
    label: "Exterior",
    index: "01",
    className: styles.galleryHero,
  },
  {
    type: "text",
    id: "gallery-text-1",
    label: "02 / Mood",
    title: "Where peace has a texture.",
    text: "Soft walls, natural shadows, and a slower pace invite the day to begin without urgency.",
    className: styles.galleryText1,
  },
  {
    type: "image",
    id: "gallery-detail",
    src: "/homepage_villa/curated-2-detail.webp",
    alt: "Quiet villa bedroom details in soft light",
    label: "Bedroom details",
    index: "03",
    className: styles.galleryDetail,
  },
  {
    type: "image",
    id: "gallery-lounge",
    src: "/homepage_villa/curated-5-lounge.webp",
    alt: "Summerhouses lounge with curved architecture",
    label: "Arched lounge",
    index: "04",
    className: styles.galleryLounge,
  },
  {
    type: "text",
    id: "gallery-text-2",
    label: "05 / Space",
    title: "Rooms designed around quiet movement.",
    text: "Soft lines and curved architectural thresholds guide the daylight naturally.",
    className: styles.galleryText2,
  },
  {
    type: "image",
    id: "gallery-courtyard",
    src: "/homepage_villa/curated-8.webp",
    alt: "Villa interior framed by arched openings",
    label: "Courtyard framing",
    index: "06",
    className: styles.galleryCourtyard,
  },
  {
    type: "image",
    id: "gallery-poolside",
    src: "/homepage_villa/villaarta.webp",
    alt: "Private Bali villa pool and exterior",
    label: "Villa Arta Pool",
    index: "07",
    className: styles.galleryPoolside,
  },
  {
    type: "text",
    id: "gallery-text-3",
    label: "08 / Harmony",
    title: "Every frame is meant to feel lived in.",
    text: "The homes are selected for proportion, mood, and the way sunlight softens across the day.",
    className: styles.galleryText3,
  },
  {
    type: "image",
    id: "gallery-living",
    src: "/homepage_villa/curated-1-main.webp",
    alt: "Cinematic Summerhouses villa room with pool foreground",
    label: "Main Lounge",
    index: "09",
    className: styles.galleryLiving,
  },
  {
    type: "image",
    id: "gallery-garden",
    src: "/homepage_villa/curated-4-view.webp",
    alt: "Sunlit Bali villa exterior at golden hour",
    label: "Sunlit garden view",
    index: "10",
    className: styles.galleryGarden,
  },
  {
    type: "text",
    id: "gallery-text-4",
    label: "11 / Rest",
    title: "A private home should hold enough quiet.",
    text: "A private stay should provide a gentle base for rest, letting the entire trip soften.",
    className: styles.galleryText4,
  },
  {
    type: "image",
    id: "gallery-cactus",
    src: "/homepage_villa/CactusEstate.webp",
    alt: "Bright villa interior with pool and curved walls",
    label: "Cactus Estate Courtyard",
    index: "12",
    className: styles.galleryCactus,
  },
  {
    type: "image",
    id: "gallery-dining",
    src: "/homepage_villa/officiana17.webp",
    alt: "Minimal villa bedroom with calm neutral tones",
    label: "Officiana dining",
    index: "13",
    className: styles.galleryDining,
  },
  {
    type: "text",
    id: "gallery-text-5",
    label: "14 / Light",
    title: "Clean lines and warm light.",
    text: "Open spaces and minimal detailing give room to breathe and exhale.",
    className: styles.galleryText5,
  },
  {
    type: "image",
    id: "gallery-glasshouse",
    src: "/homepage_villa/glass_house.png",
    alt: "Summerhouses villa framed by tropical glass architecture",
    label: "Glass House exterior",
    index: "15",
    className: styles.galleryGlasshouse,
  },
  {
    type: "image",
    id: "gallery-pooldeck",
    src: "/homepage_villa/TKR03549-HDR.webp",
    alt: "Panoramic Summerhouses villa bedroom and pool",
    label: "Summerhouses Pool Deck",
    index: "16",
    className: styles.galleryPooldeck,
  },
  {
    type: "text",
    id: "gallery-text-6",
    label: "17 / Touch",
    title: "Architecture soft at the edges.",
    text: "Every threshold is an invitation to move slowly: from water to room, from daylight to evening.",
    className: styles.galleryText6,
  },
  {
    type: "image",
    id: "gallery-mimosa",
    src: "/homepage_villa/rumahmimosa.webp",
    alt: "Elegant Summerhouses villa interior in warm tones",
    label: "Rumah Mimosa Interior",
    index: "18",
    className: styles.galleryMimosa,
  },
  {
    type: "image",
    id: "gallery-east",
    src: "/homepage_villa/88east.webp",
    alt: "Summerhouses private villa with pool and lounge setting",
    label: "88 East suite",
    index: "19",
    className: styles.galleryEast,
  },
  {
    type: "text",
    id: "gallery-text-7",
    label: "20 / Presence",
    title: "The best spaces do not demand attention.",
    text: "They let the island breathe through them, remaining quiet and considered.",
    className: styles.galleryText7,
  },
];

type GalleryPageProps = {
  items?: Array<{
    type: "image" | "text" | "video";
    src?: string | null;
    alt?: string | null;
    label?: string | null;
    title?: string | null;
    text?: string | null;
    video_url?: string | null;
    video_poster?: string | null;
  }> | null;
};

const CMS_CLASS_BY_INDEX = [
  styles.galleryItem1, styles.galleryText1, styles.galleryItem2, styles.galleryItem3,
  styles.galleryText2, styles.galleryItem4, styles.galleryItem5, styles.galleryText3,
  styles.galleryItem6, styles.galleryItem7, styles.galleryText4, styles.galleryItem8,
  styles.galleryItem9, styles.galleryText5, styles.galleryItem10, styles.galleryItem11,
  styles.galleryText6, styles.galleryItem12, styles.galleryItem13, styles.galleryText7,
].filter(Boolean);

export default function GalleryPage({ items: itemsProp }: GalleryPageProps = {}) {
  const galleryItems = itemsProp && itemsProp.length
    ? itemsProp.map((item, i) => ({
        id: `cms-gallery-${i}`,
        type: item.type,
        src: item.src ?? null,
        alt: item.alt ?? "",
        label: item.label ?? String(i + 1).padStart(2, "0"),
        title: item.title ?? "",
        text: item.text ?? "",
        video_url: item.video_url ?? null,
        video_poster: item.video_poster ?? null,
        index: String(i + 1).padStart(2, "0"),
        className: CMS_CLASS_BY_INDEX[i % CMS_CLASS_BY_INDEX.length] || "",
      }))
    : defaultGalleryItems;

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

      <section className={styles.gallerySection}>
        <div className={styles.galleryGrid}>
          {galleryItems.map((item, index) => {
            if (item.type === "text") {
              return (
                <motion.div
                  variants={zoomInVariant}
                  custom={index}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true, amount: 0.12 }}
                  key={item.id}
                  className={`${styles.galleryTextCard} ${item.className}`}
                >
                  <span className={styles.galleryTextLabel}>{item.label}</span>
                  <h3 className={styles.galleryTextTitle}>{item.title}</h3>
                  <p className={styles.galleryTextDesc}>{item.text}</p>
                </motion.div>
              );
            }
            if (item.type === "video" && "video_url" in item && item.video_url) {
              return (
                <motion.figure
                  variants={zoomInVariant}
                  custom={index}
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true, amount: 0.12 }}
                  key={item.id}
                  className={`${styles.galleryItem} ${item.className}`}
                >
                  <video
                    className={styles.coverImage}
                    src={item.video_url}
                    poster={("video_poster" in item ? item.video_poster : null) || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <figcaption key={`${item.id}-caption`}>
                    <span>{item.index}</span>
                    {item.label}
                  </figcaption>
                </motion.figure>
              );
            }
            return (
              <motion.figure
                variants={zoomInVariant}
                custom={index}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.12 }}
                key={item.id}
                className={`${styles.galleryItem} ${item.className}`}
              >
                <Image
                  key={`${item.id}-image`}
                  src={item.src!}
                  alt={item.alt!}
                  fill
                  sizes="(min-width: 1100px) 24vw, (min-width: 680px) 42vw, 88vw"
                  className={styles.coverImage}
                />
                <figcaption key={`${item.id}-caption`}>
                  <span>{item.index}</span>
                  {item.label}
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
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
