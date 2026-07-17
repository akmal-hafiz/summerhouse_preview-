"use client";

import React from "react";
import { motion } from "framer-motion";
import VillaSearchForm from "@/components/booking/VillaSearchForm";
import MobileHeroSearch from "@/components/booking/MobileHeroSearch";

type HeroSlide = {
  mediaType: "video" | "image";
  videoSrc?: string;
  imageSrc: string;
  badge_text: string;
  heading_text: string;
  show_badge: boolean;
  show_heading: boolean;
};

const heroSlides: HeroSlide[] = [
  {
    mediaType: "video",
    videoSrc: "/video/herosection_summerhouse.mp4",
    imageSrc: "/homepage_villa/curated-1-main.webp",
    badge_text: "Villas / Jungle Stays / Private Pools",
    heading_text: "Own Your World,\nOne Property at a Time.",
    show_badge: false,
    show_heading: false,
  },
];

type HeroProps = {
  cms?: {
    video_url?: string | null;
    poster_image?: string | null;
    badge_text?: string | null;
    heading_text?: string | null;
    description?: string | null;
    show_badge?: boolean | null;
    show_heading?: boolean | null;
  } | null;
};

export default function Hero({ cms }: HeroProps = {}) {
  const fallback = heroSlides[0];
  const activeSlide: HeroSlide = {
    mediaType: fallback.mediaType,
    videoSrc: cms?.video_url || fallback.videoSrc,
    imageSrc: cms?.poster_image || fallback.imageSrc,
    badge_text: cms?.badge_text ?? fallback.badge_text,
    heading_text: cms?.heading_text ?? fallback.heading_text,
    show_badge: cms?.show_badge ?? fallback.show_badge,
    show_heading: cms?.show_heading ?? fallback.show_heading,
  };

  return (
    <section className="hero-section">
      {/* Cinematic Media/Background Wrapper */}
      <motion.div
        className="hero-media-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-bg" />
        {activeSlide.mediaType === "video" && activeSlide.videoSrc ? (
          <video
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={activeSlide.imageSrc}
          >
            <source src={activeSlide.videoSrc} type="video/mp4" />
          </video>
        ) : null}
        <div className="hero-overlay" />
      </motion.div>

      {/* Hero Content Shell */}
      <div className="hero-inner">
        
        {/* Upper Editorial Text Row */}
        <div className="hero-content">
          {/* Primary Heading (Left Block) */}
          <div className="hero-text-block-left">
            {activeSlide.show_badge && activeSlide.badge_text ? (
              <div className="hero-tags">
                {activeSlide.badge_text.split("/").map((item) => (
                  <span className="hero-tag" key={item.trim()}>{item.trim()}</span>
                ))}
              </div>
            ) : null}
            {activeSlide.show_heading && activeSlide.heading_text ? (
              <h1 className="hero-title">
                {activeSlide.heading_text.split("\n").map((line, index, lines) => (
                  <React.Fragment key={`${index}-${line}`}>
                    {line}
                    {index < lines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </h1>
            ) : null}
          </div>

          {/* Supporting Copy (Right Block) */}
          <motion.div 
            className="hero-text-block-right"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <p className="hero-description">
              Curated homes in Bali for a slower rhythm.
            </p>
          </motion.div>
        </div>

        {/* Integrated Search Container — desktop uses full grid form,
             mobile + tablet use Airbnb-style pill → sheet flow. */}
        <motion.div
          id="home-hero-search"
          className="hero-search hero-search-wrapper"
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 14,
            delay: 0.45
          }}
        >
          <div className="hero-search-desktop">
            <VillaSearchForm variant="hero" />
          </div>
          <div className="hero-search-mobile">
            <MobileHeroSearch />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
