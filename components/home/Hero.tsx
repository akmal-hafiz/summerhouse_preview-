"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { safeHttpHref } from "@/lib/safe-url";
import VillaSearchForm from "@/components/booking/VillaSearchForm";
import MobileHeroSearch from "@/components/booking/MobileHeroSearch";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./Hero.module.css";

type HeroProps = {
  cms?: {
    video_url?: string | null;
    poster_image?: string | null;
    badge_text?: string | null;
    heading_text?: string | null;
    description?: string | null;
    show_badge?: boolean | null;
    show_heading?: boolean | null;
    buttons?: { label?: string | null; href?: string | null }[] | null;
  } | null;
};

const FALLBACK_POSTER = "/homepage_villa/curated-1-main.webp";

export default function Hero({ cms }: HeroProps = {}) {
  const videoSrc = cms?.video_url || "/video/herosection_summerhouse.mp4";
  const poster = cms?.poster_image || FALLBACK_POSTER;
  const description = cms?.description ?? "Curated homes in Bali for a slower rhythm.";
  const heading = cms?.heading_text ?? "Own Your World,\nOne Property at a Time.";
  const showHeading = Boolean(cms?.show_heading && heading);
  const badge = cms?.badge_text ?? "Villas / Jungle Stays / Private Pools";
  const buttons = (cms?.buttons ?? [
    { label: "Our story", href: "/about" },
    { label: "The gallery", href: "/gallery" },
  ]).slice(0, 2).map(button => ({ label: button.label?.trim(), href: safeHttpHref(button.href, "") }))
    .filter(button => button.label && button.href);
  const clipId = `hero-contour-${useId().replace(/:/g, "")}`;
  const video = useRef<HTMLVideoElement>(null);
  const [failedVideo, setFailedVideo] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => { setFailedVideo(false); }, [videoSrc]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (reduced) element.pause();
    else void element.play().catch(() => { /* Retain the poster when autoplay is blocked. */ });
  }, [reduced, videoSrc]);

  return (
    <section className={styles.section} data-home-hero>
      <svg className={styles.definitions} width="0" height="0" aria-hidden="true">
        <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path d="M 0 0 H 1 V 1 H .277 C .243 1 .239 .938 .208 .938 H 0 Z" />
        </clipPath></defs>
      </svg>
      <div className={styles.media} style={{ clipPath: `url(#${clipId})` }}>
        <img className={styles.poster} src={poster} alt="" fetchPriority="high" onError={event => {
          if (!event.currentTarget.src.endsWith(FALLBACK_POSTER)) event.currentTarget.src = FALLBACK_POSTER;
        }} />
        <video key={videoSrc} ref={video} className={styles.video} data-failed={failedVideo} autoPlay={!reduced} muted loop playsInline preload="metadata" poster={poster} onError={() => setFailedVideo(true)} aria-hidden="true">
          <source src={videoSrc} type="video/mp4" onError={() => setFailedVideo(true)} />
        </video>
        <div className={styles.mobileOverlay} aria-hidden="true" />
      </div>
      {buttons.length ? <nav className={styles.actions} aria-label="Discover Summerhouse">
        {buttons.map(button => <Link key={`${button.label}-${button.href}`} href={button.href} className={styles.mediaLink}>
          <span>{button.label}</span><FiArrowUpRight aria-hidden="true" />
        </Link>)}
      </nav> : null}
      <div className={styles.apron}>
        <div className={styles.copy}>
          {cms?.show_badge && badge ? <p className={styles.badge}>{badge.split("/").map(item => item.trim()).filter(Boolean).join(" / ")}</p> : null}
          {showHeading ? <h1 className={styles.heading}>{heading}</h1> : null}
          {/* Exactly one h1: the CMS heading when it is shown, otherwise the statement (same class, same look). */}
          {description ? (showHeading ? <p className={styles.description}>{description}</p> : <h1 className={styles.description}>{description}</h1>) : null}
        </div>
        <div id="home-hero-search" className={styles.search}>
          <div className={styles.desktop}><VillaSearchForm variant="cinematic" /></div>
          <div className={styles.mobile}><MobileHeroSearch /></div>
        </div>
      </div>
    </section>
  );
}
