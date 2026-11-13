"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiPause, FiPlay } from "react-icons/fi";
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
  const video = useRef<HTMLVideoElement>(null);
  const [failedVideo, setFailedVideo] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const stopped = reduced || paused;

  useEffect(() => { setFailedVideo(false); }, [videoSrc]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (stopped) element.pause();
    else void element.play().catch(() => { /* Retain the poster when autoplay is blocked. */ });
  }, [stopped, videoSrc]);

  return (
    <section className={styles.section} data-home-hero>
      <div className={styles.frame}>
        <div className={styles.media}>
          <img className={styles.poster} src={poster} alt="" fetchPriority="high" onError={event => {
            if (!event.currentTarget.src.endsWith(FALLBACK_POSTER)) event.currentTarget.src = FALLBACK_POSTER;
          }} />
          <video key={videoSrc} ref={video} className={styles.video} data-failed={failedVideo} autoPlay={!reduced} muted loop playsInline preload="metadata" poster={poster} onError={() => setFailedVideo(true)} aria-hidden="true">
            <source src={videoSrc} type="video/mp4" onError={() => setFailedVideo(true)} />
          </video>
        </div>

        <div className={styles.copy}>
          <div className={styles.lead}>
            {cms?.show_badge && badge ? <p className={styles.badge}>{badge.split("/").map(item => item.trim()).filter(Boolean).join(" / ")}</p> : null}
            {/* Exactly one h1: the CMS heading when it is shown, otherwise the statement (same class, same look). */}
            {showHeading ? <h1 className={styles.display}>{heading}</h1> : description ? <h1 className={styles.display}>{description}</h1> : null}
          </div>
          {showHeading && description ? <p className={styles.lede}>{description}</p> : null}
        </div>

        {buttons.length ? <nav className={styles.links} aria-label="Discover Summerhouse">
          {buttons.map(button => <Link key={`${button.label}-${button.href}`} href={button.href} className={styles.glassLink}>
            <span>{button.label}</span><FiArrowUpRight aria-hidden="true" />
          </Link>)}
        </nav> : null}

        {!failedVideo && !reduced ? <button type="button" className={styles.motionToggle} onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Play background video" : "Pause background video"}>
          {paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
        </button> : null}

        {/* The page cuts a notch into the bottom edge of the frame; the search sits in it. */}
        <div id="home-hero-search" className={styles.notch}>
          <div className={styles.desktop}><VillaSearchForm variant="cinematic" /></div>
          <div className={styles.mobile}><MobileHeroSearch /></div>
        </div>
      </div>
    </section>
  );
}
