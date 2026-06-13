"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCoffee,
  FiCompass,
  FiHeart,
  FiHome,
  FiMapPin,
  FiShield,
  FiSmile,
  FiStar,
  FiSun,
  FiUsers,
  FiTool,
  FiWifi,
  FiAward,
  FiMap,
} from "react-icons/fi";
import styles from "./AboutEditorialSections.module.css";

const LibreDestinationMap = dynamic(() => import("./LibreDestinationMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapPanel} aria-label="Loading Summerhouses Bali destination map">
      <div className={styles.mapLoading}>Loading live destination map...</div>
    </div>
  ),
});

export type AboutDestination = {
  name: string;
  villas: number;
  latitude?: number;
  longitude?: number;
};

type AboutProps = {
  destinations?: AboutDestination[];
};

const defaultDestinations: AboutDestination[] = [
  { name: "Canggu", villas: 4, latitude: -8.6478, longitude: 115.1385 },
  { name: "Canggu - Berawa", villas: 15, latitude: -8.6601, longitude: 115.1437 },
  { name: "Canggu - Padonan", villas: 4, latitude: -8.6300, longitude: 115.1500 },
  { name: "Pererenan", villas: 6, latitude: -8.6371, longitude: 115.1335 },
  { name: "Ubud", villas: 2, latitude: -8.5243, longitude: 115.255 },
  { name: "Umalas", villas: 4, latitude: -8.659, longitude: 115.1543 },
  { name: "Kerobokan", villas: 1, latitude: -8.6500, longitude: 115.1700 },
  { name: "Legian", villas: 1, latitude: -8.6980, longitude: 115.1670 },
];

const destinationImages: Record<string, string> = {
  "Canggu": "/homepage_villa/curated-6-exterior.webp",
  "Canggu - Berawa": "/homepage_villa/curated-1-main.webp",
  "Canggu - Padonan": "/homepage_villa/CactusEstate.webp",
  "Pererenan": "/homepage_villa/villaarta.webp",
  "Ubud": "/homepage_villa/curated-8.webp",
  "Umalas": "/homepage_villa/88east.webp",
  "Kerobokan": "/homepage_villa/officiana17.webp",
  "Legian": "/homepage_villa/curated-4-view.webp",
};

const getDestinationImage = (name: string, index: number) => {
  if (destinationImages[name]) {
    return destinationImages[name];
  }
  const fallbacks = [
    "/homepage_villa/curated-6-exterior.webp",
    "/homepage_villa/curated-1-main.webp",
    "/homepage_villa/CactusEstate.webp",
    "/homepage_villa/villaarta.webp",
    "/homepage_villa/curated-8.webp",
    "/homepage_villa/88east.webp",
    "/homepage_villa/officiana17.webp",
    "/homepage_villa/curated-4-view.webp",
  ];
  return fallbacks[index % fallbacks.length];
};


const storyRows = [
  {
    id: "happy-guests",
    value: "200+",
    text: "Happy guests accommodated",
    icon: FiSmile,
  },
  {
    id: "loyal-visitors",
    value: "26%",
    text: "Loyal repeat visitors hosted",
    icon: FiUsers,
  },
  {
    id: "guest-support",
    value: "24/7",
    text: "Professional guest support",
    icon: FiTool,
  },
];

const featurePills = [
  { id: "trusted-hospitality", label: "Trusted Hospitality", icon: FiShield },
  { id: "premium-locations", label: "Premium Locations", icon: FiMapPin },
  { id: "personalized-service", label: "Personalized Service", icon: FiHeart },
  { id: "verified-properties", label: "Verified Properties", icon: FiHome },
  { id: "local-expertise", label: "Local Expertise", icon: FiCompass },
];

const galleryItems = [
  {
    type: "image",
    id: "gallery-dining",
    src: "/homepage_villa/officiana17.webp",
    alt: "Villa dining and kitchen area prepared for guests",
    label: "Dining Room",
    index: "01",
    className: styles.galleryDining,
  },
  {
    type: "text",
    id: "editorial-text-1",
    label: "02 / Space",
    title: "Slow Spaces",
    text: "Villas designed around the natural rhythm of the day, where light and shade form their own architecture.",
    className: styles.galleryText1,
  },
  {
    type: "image",
    id: "gallery-bedroom",
    src: "/homepage_villa/88east.webp",
    alt: "Summerhouses villa bedroom with soft textures",
    label: "Bedroom",
    index: "03",
    className: styles.galleryBedroom,
  },
  {
    type: "image",
    id: "gallery-workspace",
    src: "/homepage_villa/villaarta.webp",
    alt: "Warm villa interior detail with tropical modern styling",
    label: "Creative Workspace",
    index: "04",
    className: styles.galleryWorkspace,
  },
  {
    type: "image",
    id: "gallery-kitchen",
    src: "/homepage_villa/CactusEstate.webp",
    alt: "Bright villa pool courtyard in Bali",
    label: "Kitchen",
    index: "05",
    className: styles.galleryKitchen,
  },
  {
    type: "text",
    id: "editorial-text-2",
    label: "06 / Rest",
    title: "Silent Corners",
    text: "Quiet nooks created for reading, writing, or simply watching the tropical afternoon breeze.",
    className: styles.galleryText2,
  },
  {
    type: "image",
    id: "gallery-living",
    src: "/homepage_villa/curated-5-lounge.webp",
    alt: "Summerhouses villa lounge with warm natural details",
    label: "Living Room",
    index: "07",
    className: styles.galleryLiving,
  },
  {
    type: "image",
    id: "gallery-guest-bedroom",
    src: "/homepage_villa/VillaZen.webp",
    alt: "Tropical villa suite with serene island atmosphere",
    label: "Guest Bedroom",
    index: "08",
    className: styles.galleryGuestBedroom,
  },
  {
    type: "image",
    id: "gallery-foyer",
    src: "/homepage_villa/curated-3-corner.webp",
    alt: "Quiet villa architectural corner with tropical planting",
    label: "Decorative Foyer",
    index: "09",
    className: styles.galleryFoyer,
  },
  {
    type: "text",
    id: "editorial-text-3",
    label: "10 / Bath",
    title: "Open-Air Rituals",
    text: "Private bathrooms that let you bathe under the stars, enclosed by lush greenery and stone.",
    className: styles.galleryText3,
  },
  {
    type: "image",
    id: "gallery-office",
    src: "/homepage_villa/curated-2-detail.webp",
    alt: "Summerhouses villa detail with calm work-friendly atmosphere",
    label: "Home Office",
    index: "11",
    className: styles.galleryOffice,
  },
  {
    type: "image",
    id: "gallery-bathroom",
    src: "/homepage_villa/curated-8.webp",
    alt: "Summerhouses villa garden and pool deck",
    label: "Bathroom",
    index: "12",
    className: styles.galleryBathroom,
  },
];

const homeHighlights = [
  { id: "curated-stays", value: "43", label: "Curated stays", text: "A growing collection across Bali's most loved neighborhoods." },
  { id: "support", value: "24/7", label: "Support", text: "A calm team nearby when plans shift, arrivals change, or questions appear." },
  { id: "guest-sentiment", value: "4.9", label: "Guest sentiment", text: "The quiet confidence of homes that feel considered before check-in." },
];

const amenities = [
  { id: "fast-wifi", label: "Fast Wi-Fi", icon: FiWifi },
  { id: "equipped-kitchen", label: "Equipped Kitchen", icon: FiCoffee },
  { id: "private-pools", label: "Private Pools", icon: FiSun },
  { id: "calm-bedrooms", label: "Calm Bedrooms", icon: FiHome },
  { id: "island-guidance", label: "Island Guidance", icon: FiCompass },
  { id: "safety-care", label: "Safety & Care", icon: FiShield },
];

const testimonials = [
  {
    id: "review-1",
    author: "Naomi S.",
    location: "Stockholm, Sweden",
    stars: 5,
    text: "It felt like a private retreat. Everything was effortless — from check-in to the little design touches.",
    avatar: "/Found_myself..jpg",
  },
  {
    id: "review-2",
    author: "Carlos N.",
    location: "Lisbon, Portugal",
    stars: 4,
    text: "A perfect spot to disconnect and breathe. Quiet, clean, and designed with so much care. I loved every day there",
    avatar: "/homepage_villa/curated-7.webp",
  },
  {
    id: "review-3",
    author: "Emma L.",
    location: "London, UK",
    stars: 5,
    text: "The architectural design is stunning. Mornings spent by the pool with the sound of the jungle were absolute bliss.",
    avatar: "/homepage_villa/curated-2-detail.webp",
  },
  {
    id: "review-4",
    author: "Marc K.",
    location: "Munich, Germany",
    stars: 5,
    text: "Exceeded all expectations. The team was incredibly helpful, booking local drivers and suggesting hidden beach clubs.",
    avatar: "/homepage_villa/curated-6-exterior.webp",
  }
];

const faqs = [
  {
    id: "villa-selection",
    question: "How does Summerhouses choose each villa?",
    answer:
      "We look for homes with atmosphere, privacy, thoughtful light, and practical comfort, then make sure the stay can be supported clearly before guests arrive.",
  },
  {
    id: "arrival-support",
    question: "Can the team help with arrivals and island plans?",
    answer:
      "Yes. Arrivals, recommendations, dining, drivers, and daily requests can be handled with care so guests can settle into the pace of the island.",
  },
  {
    id: "long-stays",
    question: "Are the homes suitable for families or longer stays?",
    answer:
      "Many homes are designed for couples, families, and longer stays, with kitchens, calm bedrooms, private pools, and living spaces that feel easy day after day.",
  },
  {
    id: "villa-locations",
    question: "Where are the villas located?",
    answer:
      "The collection is centered around Bali's most requested stay areas, including Canggu, Ubud, Pererenan, Umalas, Kerobokan, and Legian when available.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const },
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

const heroStaggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const heroChildVariant = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const storyHeadlineVariant = {
  initial: { opacity: 0, y: 28 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  viewport: { once: true, amount: 0.2 },
};

const storyCardVariant = {
  initial: { opacity: 0, x: 28, y: 28 },
  whileInView: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 16,
      mass: 1,
      delay: 0.08,
    },
  },
  viewport: { once: true, amount: 0.15 },
};

const teamQuoteVariant = {
  initial: { opacity: 0, y: 32 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  viewport: { once: true, amount: 0.25 },
};

const highlightsCardVariant = {
  initial: { opacity: 0, y: 28 },
  whileInView: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: index * 0.08,
    },
  }),
  viewport: { once: true, amount: 0.15 },
};

const reviewCardVariant = {
  initial: { opacity: 0, y: 28 },
  whileInView: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: (index % 3) * 0.06,
    },
  }),
  viewport: { once: true, amount: 0.12 },
};

const destinationFactVariant = {
  initial: { opacity: 0, y: 24 },
  whileInView: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: index * 0.08,
    },
  }),
  viewport: { once: true, amount: 0.15 },
};

function CountUp({ to, duration = 1.4, decimals = 0 }: { to: number; duration?: number; decimals?: number }) {
  const [count, setCount] = useState(to);
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    setCount(0);
  }, []);

  useEffect(() => {
    if (isMounted && isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      let start = 0;
      const end = to;
      const startTime = performance.now();

      const animateCount = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const currentCount = start + (end - start) * easeProgress;

        setCount(Number(currentCount.toFixed(decimals)));

        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animateCount);
    }
  }, [isMounted, isInView, to, duration, decimals]);

  return <span ref={ref}>{count.toFixed(decimals)}</span>;
}

export default function About({ destinations = [] }: AboutProps) {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveReviewIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
  };

  const storySectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: storySectionRef,
    offset: ["start end", "end start"],
  });
  const storyParallaxY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  const destinationItems = destinations.length ? destinations : defaultDestinations;
  const totalVillas = destinationItems.reduce((total, destination) => total + destination.villas, 0) || 43;
  const loopItems = [
    ...destinationItems.map((dest, idx) => ({ ...dest, uniqueId: `${dest.name}-primary-${idx}` })),
    ...destinationItems.map((dest, idx) => ({ ...dest, uniqueId: `${dest.name}-mirror-${idx}` })),
  ];
  const trustStats = [
    { id: "active-villas", value: String(totalVillas), label: "Premium Villas" },
    { id: "support", value: "24/7", label: "Guest Support" },
    { id: "sentiment", value: "4.9", label: "Guest Sentiment" },
  ];
  const valuePillItems = [
    ...featurePills.map((pill) => ({ ...pill, renderId: `${pill.id}-primary` })),
    ...featurePills.map((pill) => ({ ...pill, renderId: `${pill.id}-mirror` })),
  ];

  return (
    <div className={styles.aboutShell}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeftColumn}>
            <motion.div
              variants={heroStaggerContainer}
              initial="initial"
              animate="animate"
              className={styles.heroCopy}
            >
              <motion.p variants={heroChildVariant} className={styles.locationPill}>
                <FiMapPin aria-hidden="true" />
                Bali private stays
              </motion.p>
              <motion.h1 variants={heroChildVariant}>Private homes for a slower kind of island living.</motion.h1>
              <motion.p variants={heroChildVariant}>
                We curate Bali villas for travelers who want more than a beautiful room. They want a home that
                feels considered, cared for, and quietly connected to the island around it.
              </motion.p>

              <motion.div variants={heroChildVariant} className={styles.guestStack}>
                <div className={styles.avatarGroup}>
                  <div className={styles.guestAvatar}>
                    <Image
                      src="/Found_myself..jpg"
                      alt="Guest profile photo"
                      fill
                      sizes="32px"
                      className={styles.avatarImg}
                    />
                  </div>
                  <div className={styles.guestAvatar}>
                    <Image
                      src="/homepage_villa/curated-2-detail.webp"
                      alt="Guest profile photo"
                      fill
                      sizes="32px"
                      className={styles.avatarImg}
                    />
                  </div>
                  <div className={styles.guestAvatar}>
                    <Image
                      src="/homepage_villa/curated-6-exterior.webp"
                      alt="Guest profile photo"
                      fill
                      sizes="32px"
                      className={styles.avatarImg}
                    />
                  </div>
                </div>
                <span>Loved by 200+ happy guests accommodated</span>
              </motion.div>

              <motion.div variants={heroChildVariant}>
                <Link href="/villas" className={styles.primaryCta}>
                  <span>
                    <FiArrowUpRight aria-hidden="true" />
                  </span>
                  Explore Villas
                </Link>
              </motion.div>
            </motion.div>

            <motion.div {...fadeUp} className={styles.heroStats}>
              <div className={styles.favoriteBadge}>
                <FiAward aria-hidden="true" />
                <span>Guest favorite</span>
              </div>
              {trustStats.map((stat) => (
                <div key={stat.id} className={styles.heroStat}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.96, ease: [0.22, 1, 0.36, 1] }}
            className={styles.heroVisual}
          >
            <Image
              src="/homepage_villa/curated-6-exterior.webp"
              alt="Summerhouses Bali private villa with tropical architecture"
              fill
              priority
              sizes="(min-width: 1100px) 48vw, 100vw"
              className={styles.coverImage}
            />
            <div className={styles.floatingMapButton} aria-label="Show villa map location">
              <FiMap aria-hidden="true" />
            </div>
          </motion.figure>
        </div>
      </section>

      <section className={styles.storySection} ref={storySectionRef}>
        <motion.div style={{ y: storyParallaxY }} className={styles.storyImageWrapper}>
          <Image
            src="/homepage_villa/curated-1-main.webp"
            alt="Summerhouses villa living space framed by warm interiors"
            fill
            sizes="100vw"
            className={styles.coverImage}
            priority
          />
          <div className={styles.storyOverlay} />
        </motion.div>
        <div className={styles.storyInner}>
          <motion.div
            variants={storyHeadlineVariant}
            initial="initial"
            whileInView="whileInView"
            viewport={storyHeadlineVariant.viewport}
            className={styles.storyHeadline}
          >
            <span className={styles.lightEyebrow}>• Introduction</span>
            <h2>Built around the feeling of arriving somewhere that already understands you.</h2>
          </motion.div>

          <motion.div
            variants={storyCardVariant}
            initial="initial"
            whileInView="whileInView"
            viewport={storyCardVariant.viewport}
            className={styles.storyCard}
          >
            {storyRows.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className={styles.storyRow}>
                  <strong>
                    {item.id === "happy-guests" ? (
                      <>
                        <CountUp to={200} />+
                      </>
                    ) : item.id === "loyal-visitors" ? (
                      <>
                        <CountUp to={26} />%
                      </>
                    ) : item.id === "guest-support" ? (
                      <>
                        <CountUp to={24} />/7
                      </>
                    ) : (
                      item.value
                    )}
                  </strong>
                  <p>{item.text}</p>
                  <div className={styles.storyIcon}>
                    <Icon aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <motion.div {...fadeUp} className={styles.teamCard}>
          <Image
            src="/Found_myself..jpg"
            alt="Summerhouses editorial portrait"
            width={96}
            height={96}
            className={styles.teamAvatar}
          />
          <div>
            <h2>Summerhouses Team</h2>
            <p>Island hospitality, villa curation, and practical guest care.</p>
          </div>
          <Link href="/contact" aria-label="Contact Summerhouses">
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.blockquote
          variants={teamQuoteVariant}
          initial="initial"
          whileInView="whileInView"
          viewport={teamQuoteVariant.viewport}
          className={styles.teamQuote}
        >
          "Summerhouses began with a simple belief: the best stays in Bali are not the loudest ones. They
          are the homes that let the day unfold naturally, with good light, thoughtful spaces, and people
          nearby when you need them."
        </motion.blockquote>

        <div className={styles.pillMarquee} aria-label="Summerhouses values">
          <div className={styles.pillMarqueeTrack}>
            {valuePillItems.map((pill) => {
              const Icon = pill.icon;
              return (
                <span key={pill.renderId} className={styles.valuePill}>
                  <span>
                    <Icon aria-hidden="true" />
                  </span>
                  {pill.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.gallerySection}>
        <motion.div {...fadeUp} className={styles.sectionIntro}>
          <p className={styles.darkEyebrow}>Gallery</p>
          <h2>Inside the quieter side of Bali.</h2>
          <Link href="/gallery" className={styles.smallCta}>
            Explore Full Gallery
          </Link>
        </motion.div>

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

      <section className={styles.highlightsSection}>
        <motion.div {...fadeUp} className={styles.sectionIntro}>
          <p className={styles.darkEyebrow}>Why choose Summerhouses</p>
          <h2>Everything feels easier when the details are already cared for.</h2>
          <p>
            Whether you are arriving for a honeymoon, a family pause, or a longer stay between work and
            waves, our role is to make the home feel ready for the life you came to live.
          </p>
        </motion.div>

        <div className={styles.highlightCards}>
          {homeHighlights.map((highlight, index) => (
            <motion.article
              variants={highlightsCardVariant}
              custom={index}
              initial="initial"
              whileInView="whileInView"
              viewport={highlightsCardVariant.viewport}
              key={highlight.id}
              className={styles.highlightCard}
            >
              <strong key={`${highlight.id}-value`}>
                {highlight.id === "curated-stays" ? (
                  <CountUp to={43} />
                ) : highlight.id === "support" ? (
                  <>
                    <CountUp to={24} />/7
                  </>
                ) : highlight.id === "guest-sentiment" ? (
                  <CountUp to={4.9} decimals={1} />
                ) : (
                  highlight.value
                )}
              </strong>
              <div key={`${highlight.id}-copy`}>
                <h3>{highlight.label}</h3>
                <p>{highlight.text}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className={styles.amenityGrid}>
          {amenities.map((amenity, index) => {
            const Icon = amenity.icon;
            return (
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.035 }}
                key={amenity.id}
                className={styles.amenityItem}
              >
                <span key={`${amenity.id}-label`}>{amenity.label}</span>
                <Icon key={`${amenity.id}-icon`} aria-hidden="true" />
              </motion.div>
            );
          })}
        </div>

        <motion.div {...fadeUp} className={styles.promoBanner}>
          <Image
            key="promo-image"
            src="/homepage_villa/curated-4-view.webp"
            alt="Summerhouses Bali villa view for a calm stay"
            fill
            sizes="(min-width: 900px) 82vw, 100vw"
            className={styles.coverImage}
          />
          <div key="promo-copy">
            <p className={styles.lightEyebrow}>Begin with a home</p>
            <h3>Discover your next unforgettable stay.</h3>
            <Link href="/villas" className={styles.reserveButton}>
              <span>
                <FiArrowUpRight aria-hidden="true" />
              </span>
              Reserve Now
            </Link>
          </div>
        </motion.div>
      </section>

      <section className={styles.newReviewsSection}>
        <div className={styles.newReviewsContainer}>
          {/* Header */}
          <div className={styles.newReviewsHeader}>
            <span className={styles.newReviewsKicker}>Reviews</span>
            <h2 className={styles.newReviewsHeading}>What do our guests say</h2>
          </div>

          {/* Grid Layout (2-column on desktop, stacked on mobile) */}
          <div className={styles.newReviewsGrid}>
            
            {/* Left Card: Summary Rating Dashboard */}
            <div className={styles.ratingSummaryCard}>
              <div className={styles.ratingBigRow}>
                <span className={styles.ratingStarIcon}>★</span>
                <span className={styles.ratingValueBig}>4.8</span>
              </div>
              
              <div className={styles.ratingMetricRows}>
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>Cleanliness</span>
                  <div className={styles.metricBarTrack}>
                    <div className={styles.metricBarFill} style={{ width: "98%" }} />
                  </div>
                  <span className={styles.metricVal}>4.9</span>
                </div>
                
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>Location</span>
                  <div className={styles.metricBarTrack}>
                    <div className={styles.metricBarFill} style={{ width: "94%" }} />
                  </div>
                  <span className={styles.metricVal}>4.7</span>
                </div>
                
                <div className={styles.metricRow}>
                  <span className={styles.metricLabel}>Value</span>
                  <div className={styles.metricBarTrack}>
                    <div className={styles.metricBarFill} style={{ width: "96%" }} />
                  </div>
                  <span className={styles.metricVal}>4.8</span>
                </div>
              </div>
            </div>

            {/* Right: Active Testimonial Card */}
            <div className={styles.activeTestimonialBlock}>
              <div className={styles.testimonialContentArea}>
                <motion.div
                  key={activeReviewIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Star Rating */}
                  <div className={styles.testimonialStars}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span 
                        key={idx} 
                        className={idx < testimonials[activeReviewIndex].stars ? styles.starSolid : styles.starOutline}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Quote Text */}
                  <blockquote className={styles.testimonialQuoteText}>
                    “{testimonials[activeReviewIndex].text}”
                  </blockquote>

                  {/* Author Info Group */}
                  <div className={styles.testimonialAuthorRow}>
                    <div className={styles.authorAvatarWrapper}>
                      <Image
                        src={testimonials[activeReviewIndex].avatar}
                        alt={testimonials[activeReviewIndex].author}
                        fill
                        sizes="48px"
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div className={styles.authorMeta}>
                      <strong className={styles.authorName}>{testimonials[activeReviewIndex].author}</strong>
                      <span className={styles.authorLocation}>{testimonials[activeReviewIndex].location}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Arrows on the right side */}
              <div className={styles.testimonialNavCtrls}>
                <button 
                  type="button" 
                  onClick={handlePrev} 
                  className={styles.testimonialNavArrow} 
                  aria-label="Previous review"
                >
                  ↑
                </button>
                <button 
                  type="button" 
                  onClick={handleNext} 
                  className={styles.testimonialNavArrow} 
                  aria-label="Next review"
                >
                  ↓
                </button>
              </div>
            </div>

          </div>

          {/* Centered CTA Button */}
          <div className={styles.ctaButtonWrapper}>
            <a 
              href="https://www.airbnb.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.airbnbCtaButton}
            >
              Check all 200+ reviews
            </a>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqIntro}>
          <p className={styles.darkEyebrow}>FAQ</p>
          <h2>Everything you need to know.</h2>
          <Link href="/contact" className={styles.reserveButtonDark}>
            <span>
              <FiArrowUpRight aria-hidden="true" />
            </span>
            Ask Us
          </Link>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.06 }}
              key={faq.id}
            >
              <details className={styles.faqItem}>
                <summary>
                  <span>{faq.question}</span>
                  <FiChevronDown aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.destinationSection}>
        <div className={styles.destinationInner}>
          <motion.div {...fadeUp} className={styles.destinationHeader}>
            <p className={styles.lightEyebrow}>Location</p>
            <h2>Where Summerhouses stays unfold.</h2>
            <p>
              The collection is centered around Bali's most requested stay areas, with villas selected for
              privacy, atmosphere, and access to the island's everyday rituals.
            </p>
          </motion.div>

          <div className={styles.destinationFacts}>
            <motion.div
              variants={destinationFactVariant}
              custom={0}
              initial="initial"
              whileInView="whileInView"
              viewport={destinationFactVariant.viewport}
            >
              <span>Featured regions</span>
              <strong><CountUp to={destinationItems.length} /></strong>
            </motion.div>
            <motion.div
              variants={destinationFactVariant}
              custom={1}
              initial="initial"
              whileInView="whileInView"
              viewport={destinationFactVariant.viewport}
            >
              <span>Active villa points</span>
              <strong><CountUp to={totalVillas} /></strong>
            </motion.div>
            <motion.div
              variants={destinationFactVariant}
              custom={2}
              initial="initial"
              whileInView="whileInView"
              viewport={destinationFactVariant.viewport}
            >
              <span>Island focus</span>
              <strong>Bali</strong>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <LibreDestinationMap destinations={destinationItems} />
          </motion.div>

          <div className={styles.locationMarquee} aria-label="Summerhouses regions">
            <div className={styles.locationMarqueeTrack}>
              {loopItems.map((destination, idx) => {
                const imageUrl = getDestinationImage(destination.name, idx);
                const sizeClass = [
                  styles.cardSizeTall,
                  styles.cardSizeWide,
                  styles.cardSizeSlim,
                  styles.cardSizeSquare,
                  styles.cardSizeTall,
                  styles.cardSizeWide,
                  styles.cardSizeSlim,
                  styles.cardSizeSquare,
                ][idx % 8];
                return (
                  <div key={destination.uniqueId} className={`${styles.locationCard} ${sizeClass}`}>
                    <Image
                      src={imageUrl}
                      alt={`Summerhouses in ${destination.name}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 680px) 45vw, 75vw"
                      className={styles.locationCardImage}
                    />
                    <div className={styles.locationCardOverlay} />
                    <div className={styles.locationCardContent}>
                      <h3>{destination.name}</h3>
                      <span>
                        {destination.villas} {destination.villas === 1 ? "villa" : "villas"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
