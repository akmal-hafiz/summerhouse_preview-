"use client";

import React from "react";
import { motion } from "framer-motion";
import VillaSearchForm from "@/components/booking/VillaSearchForm";

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

export default function Hero() {
  const activeSlide = heroSlides[0];

  return (
    <section className="hero-section">
      {/* Cinematic Media/Background Wrapper */}
      <motion.div 
        className="hero-media-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
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
            Curated homes in Bali
            For a slower rhythm.
            </p>
          </motion.div>
        </div>

        {/* Integrated Search/Filter Bar Container */}
        <motion.div 
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
          <VillaSearchForm variant="hero" />
        </motion.div>

      </div>
    </section>
  );
}
