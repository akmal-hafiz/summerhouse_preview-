"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiHeart,
  FiHome,
  FiMapPin,
  FiShield,
  FiSmile,
  FiStar,
  FiUsers,
  FiTool,
  FiAward,
  FiMap,
} from "react-icons/fi";
import styles from "./AboutEditorialSections.module.css";
import DomeGallery from "./DomeGallery";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

type AboutTestimonial = {
  author: string;
  location?: string | null;
  stars: number;
  text: string;
  avatar?: string | null;
  source?: string | null;
  sourceLabel?: string | null;
  isVerified?: boolean;
  reviewDate?: string | null;
  villaName?: string | null;
  villaLocation?: string | null;
};

type AboutFaq = {
  question: string;
  answer: string;
};

import JournalPreviewSection from "./JournalPreviewSection";
import OurStoryHero from "./sections/OurStoryHero";
import TrustRecognition from "./sections/TrustRecognition";
import StudioStatement from "./sections/StudioStatement";
import ServicesList from "./sections/ServicesList";
import type { ArticleListItem } from "@/lib/journal";
import type { PortfolioStats } from "@/lib/lodgify";
import type { CmsGalleryItem } from "@/lib/cms";

type AboutProps = {
  destinations?: AboutDestination[];
  testimonials?: AboutTestimonial[] | null;
  faqs?: AboutFaq[] | null;
  journalArticles?: ArticleListItem[];
  portfolioStats?: PortfolioStats;
  cmsGalleryItems?: CmsGalleryItem[] | null;
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
    label: "Quiet space",
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
    label: "Soft rest",
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
    label: "Bath detail",
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

const fallbackDomeGalleryImages = galleryItems
  .filter((item) => item.type === "image")
  .map((item) => ({
    src: item.src ?? "",
    alt: item.alt ?? item.label,
  }));

const homeHighlights = [
  { id: "curated-stays", value: "43", label: "Curated stays", text: "A growing collection across Bali's most loved neighborhoods." },
  { id: "support", value: "24/7", label: "Support", text: "The Summerhouse team nearby when plans shift, arrivals change, or questions appear." },
  { id: "guest-sentiment", value: "4.9", label: "Guest sentiment", text: "The quiet confidence of homes that feel considered before check-in." },
];

const servicePromises = [
  {
    id: "villa-matching",
    label: "Villa Matching",
    text: "We help guests choose homes by mood, area, group size, and the kind of Bali rhythm they want.",
    icon: FiHome,
  },
  {
    id: "arrival-care",
    label: "Arrival Care",
    text: "From check-in details to first-day guidance, the stay starts with fewer questions and more ease.",
    icon: FiMap,
  },
  {
    id: "local-concierge",
    label: "Local Concierge",
    text: "Drivers, dining ideas, beach days, and trusted island recommendations stay close when needed.",
    icon: FiCompass,
  },
  {
    id: "long-stay-setup",
    label: "Long-Stay Setup",
    text: "For slower stays, we think through work comfort, daily routines, and practical home details.",
    icon: FiUsers,
  },
  {
    id: "home-readiness",
    label: "Home Readiness",
    text: "Homes are checked for comfort, cleanliness, safety, and small details before guests arrive.",
    icon: FiShield,
  },
  {
    id: "guest-support",
    label: "Guest Support",
    text: "If plans shift, our team stays nearby with calm help, clear answers, and practical next steps.",
    icon: FiTool,
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const defaultFaqs = [
  {
    id: "villa-selection",
    question: "How does Summerhouses choose each villa?",
    answer:
      "We look for homes with atmosphere, privacy, thoughtful light, and practical comfort, then make sure the stay can be supported clearly before guests arrive.",
  },
  {
    id: "arrival-support",
    question: "Can the Summerhouse team help with arrivals and island plans?",
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

export default function About({
  destinations = [],
  testimonials: testimonialsProp,
  faqs: faqsProp,
  journalArticles = [],
  portfolioStats,
  cmsGalleryItems,
}: AboutProps) {
  const aboutRootRef = useRef<HTMLDivElement>(null);
  const domeGalleryImages = useMemo(() => {
    const source = cmsGalleryItems ?? [];
    const mapped = source
      .map((item, index) => {
        if (item.type === "image" && item.src) {
          return {
            src: item.src,
            alt: item.alt?.trim() || item.label?.trim() || `Summerhouse gallery ${index + 1}`,
            propertyName: item.label?.trim() || undefined,
          };
        }
        if (item.type === "video" && item.video_poster) {
          return {
            src: item.video_poster,
            alt: item.alt?.trim() || item.label?.trim() || `Summerhouse gallery video ${index + 1}`,
            propertyName: item.label?.trim() || undefined,
          };
        }
        return null;
      })
      .filter((item): item is { src: string; alt: string; propertyName: string | undefined } => Boolean(item));
    return mapped.length ? mapped : fallbackDomeGalleryImages;
  }, [cmsGalleryItems]);
  const homesCount = portfolioStats?.homesCount ?? null;
  const testimonials = (testimonialsProp ?? []).map((t, i) => ({
    id: `cms-review-${i}`,
    author: t.author,
    location: t.location ?? "",
    stars: t.stars,
    text: t.text,
    avatar: t.avatar ?? null,
    initials: getInitials(t.author),
    sourceLabel: t.sourceLabel ?? null,
    isVerified: Boolean(t.isVerified),
    villaName: t.villaName ?? null,
  }));
  const hasTestimonials = testimonials.length > 0;
  const faqs = faqsProp && faqsProp.length
    ? faqsProp.map((f, i) => ({
        id: `cms-faq-${i}`,
        question: f.question,
        answer: f.answer,
      }))
    : defaultFaqs;
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    if (!hasTestimonials) return;
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasTestimonials, testimonials.length]);

  useEffect(() => {
    if (activeReviewIndex >= testimonials.length) {
      setActiveReviewIndex(0);
    }
  }, [testimonials.length, activeReviewIndex]);

  const handlePrev = () => {
    if (!hasTestimonials) return;
    setActiveReviewIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    if (!hasTestimonials) return;
    setActiveReviewIndex((prev) => (prev + 1) % testimonials.length);
  };

  const activeTestimonial = hasTestimonials ? testimonials[activeReviewIndex] : null;

  useGSAP(
    () => {
      const root = aboutRootRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>(`.${styles.velocitySurface}`).forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 58 + index * 10, opacity: 0.86 },
          {
            y: -18,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top 92%",
              end: "bottom 18%",
              scrub: 0.72,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(`.${styles.darkScrollChapter}`).forEach((section) => {
        gsap.fromTo(
          section,
          { scale: 0.985 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: 0.9,
            },
          },
        );
      });
    },
    { scope: aboutRootRef },
  );

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
    <div className={styles.aboutShell} ref={aboutRootRef}>
      <OurStoryHero />

      <TrustRecognition villas={totalVillas} />

      <StudioStatement />

      <ServicesList />

      <section className={styles.newReviewsSection}>
        <div className={styles.newReviewsContainer}>
          {/* Header */}
          <div className={styles.newReviewsHeader}>
            <span className={styles.newReviewsKicker}>Reviews</span>
            <h2 className={styles.newReviewsHeading}>What our guests say about Summerhouses</h2>
            <p>
              Real notes from stays shaped by calm homes, clear support, and details handled before arrival.
            </p>
          </div>

          {hasTestimonials && activeTestimonial ? (
            <>
              <div className={styles.newReviewsGrid}>
                <div className={styles.ratingSummaryCard}>
                  <motion.div
                    key={`${activeTestimonial.id}-portrait`}
                    className={styles.testimonialPortrait}
                    initial={{ opacity: 0, x: -24, rotate: -1.5 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {activeTestimonial.avatar ? (
                      <Image
                        src={activeTestimonial.avatar}
                        alt={activeTestimonial.author}
                        fill
                        sizes="(min-width: 960px) 22vw, 78vw"
                        className={styles.coverImage}
                      />
                    ) : (
                      <div className={styles.testimonialPortraitFallback} aria-hidden="true">
                        <span>{activeTestimonial.initials || activeTestimonial.author.charAt(0)}</span>
                      </div>
                    )}
                  </motion.div>
                  <div className={styles.testimonialPortraitMeta}>
                    <strong>{activeTestimonial.author}</strong>
                    <span>{activeTestimonial.location}</span>
                    {activeTestimonial.villaName ? (
                      <span className={styles.testimonialVillaLabel}>Stayed at {activeTestimonial.villaName}</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.activeTestimonialBlock}>
                  <div className={styles.testimonialContentArea}>
                    <motion.div
                      key={activeReviewIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={styles.testimonialStars} aria-label={`${activeTestimonial.stars} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span
                            key={idx}
                            aria-hidden="true"
                            className={idx < activeTestimonial.stars ? styles.starSolid : styles.starOutline}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      {(activeTestimonial.isVerified || activeTestimonial.sourceLabel) ? (
                        <div className={styles.testimonialBadgeRow}>
                          {activeTestimonial.isVerified ? (
                            <span className={styles.testimonialVerifiedBadge}>Verified stay</span>
                          ) : null}
                          {activeTestimonial.sourceLabel ? (
                            <span className={styles.testimonialSourceBadge}>{activeTestimonial.sourceLabel}</span>
                          ) : null}
                        </div>
                      ) : null}

                      <blockquote className={styles.testimonialQuoteText}>
                        &ldquo;{activeTestimonial.text}&rdquo;
                      </blockquote>

                      <div className={styles.testimonialAuthorRow}>
                        <div className={styles.authorAvatarWrapper}>
                          {activeTestimonial.avatar ? (
                            <Image
                              src={activeTestimonial.avatar}
                              alt={activeTestimonial.author}
                              fill
                              sizes="48px"
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <div className={styles.authorAvatarFallback} aria-hidden="true">
                              <span>{activeTestimonial.initials || activeTestimonial.author.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.authorMeta}>
                          <strong className={styles.authorName}>{activeTestimonial.author}</strong>
                          <span className={styles.authorLocation}>{activeTestimonial.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className={styles.testimonialNavCtrls}>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className={styles.testimonialNavArrow}
                      aria-label="Previous review"
                    >
                      <FiChevronLeft aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className={styles.testimonialNavArrow}
                      aria-label="Next review"
                    >
                      <FiChevronRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.ctaButtonWrapper}>
                <InteractiveHoverButton
                  href="/villas"
                  className={`${styles.airbnbCtaButton} ihb-fill-dark`}
                  arrow={null}
                >
                  Read more guest stories
                </InteractiveHoverButton>
              </div>
            </>
          ) : (
            <div className={styles.newReviewsEmpty}>
              <p>Guest stories are on their way. Check back soon for words from our first Summerhouse stays.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqIntro}>
          <p className={styles.darkEyebrow}>FAQ</p>
          <h2>Everything you need to know.</h2>
          <InteractiveHoverButton href="/contact" className={`${styles.reserveButtonDark} ihb-fill-light`} arrow={null}>
            <span>
              <FiArrowUpRight aria-hidden="true" />
            </span>
            Ask Us
          </InteractiveHoverButton>
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

      <JournalPreviewSection articles={journalArticles} />

      <section className={`${styles.destinationSection} ${styles.darkScrollChapter}`}>
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
