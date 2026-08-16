"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import type { CmsTestimonial } from "@/lib/cms";
import styles from "./GuestStoriesSection.module.css";

const fallbackReviews: CmsTestimonial[] = [
  {
    author: "Maya",
    location: "Singapore",
    stars: 5,
    text: "From arrival details to local recommendations, every question was handled with calm and care.",
    avatar: "/homepage_villa/owner_sarah_mark.png",
    isVerified: true,
  },
];

type GuestStoriesContent = {
  eyebrow?: string;
  title?: string;
  title_emphasis?: string;
  trust_label?: string;
  supporting_copy?: string;
  is_visible?: boolean;
};

type GuestStoriesSectionProps = {
  testimonials?: CmsTestimonial[] | null;
  placement?: "homepage" | "concierge";
  content?: GuestStoriesContent;
};

function ReviewStars({ value }: { value: number }) {
  const rating = Math.max(1, Math.min(5, Math.round(value || 5)));
  return <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}</span>;
}

function HomepageGuestReviews({ reviews, content }: { reviews: CmsTestimonial[]; content?: GuestStoriesContent }) {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const updateActive = () => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-review-card]"));
    if (!cards.length) return;
    const nearest = cards.reduce(
      (best, card, index) => {
        const distance = Math.abs(card.offsetLeft - rail.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    setActive(nearest.index);
  };

  const move = (delta: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-review-card]"));
    if (!cards.length) return;
    const next = Math.max(0, Math.min(cards.length - 1, active + delta));
    cards[next]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
    setActive(next);
  };

  return (
    <section className={styles.homeReviews} aria-labelledby="homepage-guest-reviews-title">
      <div className={styles.homeReviewsShell}>
        <header className={styles.homeReviewsHeader}>
          <div>
            <h2 id="homepage-guest-reviews-title">{content?.title || "Guest Reviews"}</h2>
            {content?.supporting_copy ? <p>{content.supporting_copy}</p> : null}
          </div>
          {reviews.length > 1 ? (
            <div className={styles.railControls}>
              <button type="button" onClick={() => move(-1)} disabled={active === 0} aria-label="Previous guest reviews">
                <FiArrowLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(1)} disabled={active === reviews.length - 1} aria-label="Next guest reviews">
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </header>

        <div
          ref={railRef}
          className={styles.reviewRail}
          data-count={Math.min(reviews.length, 3)}
          tabIndex={reviews.length > 1 ? 0 : -1}
          role="region"
          aria-label="Guest review carousel"
          onScroll={updateActive}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
          }}
        >
          {reviews.map((review, index) => (
            <article className={styles.reviewCard} data-review-card key={`${review.author}-${review.text}-${index}`}>
              <div className={styles.reviewCardTop}>
                <ReviewStars value={review.stars} />
                {review.isVerified ? <span className={styles.verified}>Verified stay</span> : null}
              </div>
              <blockquote>&ldquo;{review.text}&rdquo;</blockquote>
              <footer>
                {review.avatar ? (
                  <span className={styles.avatar}>
                    <Image src={review.avatar} alt="" fill sizes="44px" />
                  </span>
                ) : (
                  <span className={`${styles.avatar} ${styles.avatarFallback}`} aria-hidden="true">{review.author.charAt(0)}</span>
                )}
                <span className={styles.reviewer}>
                  <strong>{review.author}</strong>
                  <small>{[review.villaName, review.location].filter(Boolean).join(" · ")}</small>
                </span>
                {review.sourceLabel ? <span className={styles.source}>{review.sourceLabel}</span> : null}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConciergeGuestStory({ reviews, content }: { reviews: CmsTestimonial[]; content?: GuestStoriesContent }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const review = reviews[active] || fallbackReviews[0];

  useEffect(() => {
    if (active >= reviews.length) setActive(0);
  }, [active, reviews.length]);

  useEffect(() => {
    if (reviews.length < 2 || reduceMotion) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % reviews.length), 7000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, reviews.length]);

  const move = (delta: number) => setActive((value) => (value + delta + reviews.length) % reviews.length);

  return (
    <section className={`${styles.section} ${styles.concierge}`} aria-labelledby="concierge-guest-stories-title">
      <div className={styles.storyIntro}>
        <p className={styles.eyebrow}><span />{content?.eyebrow || "Guest stories"}<span /></p>
        <h2 id="concierge-guest-stories-title">
          {content?.title || "Stays made easier"}
          <em>{content?.title_emphasis || "by thoughtful care"}</em>
        </h2>
        <div className={styles.portrait}>
          {review.avatar ? <Image src={review.avatar} alt={review.author} fill sizes="(min-width: 1024px) 34vw, 32rem" /> : <span>{review.author.charAt(0)}</span>}
        </div>
      </div>

      <div className={styles.quotePanel}>
        <div className={styles.trust}><div aria-hidden="true"><i /><i /><i /></div><span>{content?.trust_label || "Loved by Summerhouse guests"}</span></div>
        <div className={styles.quoteStage}>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              className={styles.quoteBody}
              key={`${review.author}-${active}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <blockquote>&ldquo;{review.text}&rdquo;</blockquote>
              <p>{review.author}{review.location ? `, ${review.location}` : ""}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.controls}>
          <div>
            <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><FiArrowLeft /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next testimonial"><FiArrowRight /></button>
          </div>
          <span>{active + 1} / {reviews.length}</span>
        </div>
      </div>
    </section>
  );
}

export default function GuestStoriesSection({ testimonials, placement = "concierge", content }: GuestStoriesSectionProps) {
  const reviews = testimonials?.length ? testimonials : fallbackReviews;
  if (content?.is_visible === false) return null;
  return placement === "homepage"
    ? <HomepageGuestReviews reviews={reviews} content={content} />
    : <ConciergeGuestStory reviews={reviews} content={content} />;
}
