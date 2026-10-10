"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { airbnbHostProof, publicGuestReviews } from "@/data/publicGuestReviews";
import styles from "./GuestStoriesSection.module.css";

type GuestStoriesSectionProps = {
  placement?: "homepage" | "concierge";
};

const AUTO_ADVANCE_MS = 6500;

function ReviewStars({ value }: { value: number | null }) {
  if (value === null) return <span className={styles.sourceLabel}>Verified guest review</span>;

  const rating = Math.max(1, Math.min(5, Math.round(value)));

  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
    </span>
  );
}

function reviewerInitials(author: string) {
  return author
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase();
}

type ActiveReview = (typeof publicGuestReviews)[number];

function RotatingReview({
  review,
  autoplayEnabled,
  reduceMotion,
  compact = false,
}: {
  review: ActiveReview;
  autoplayEnabled: boolean;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  return (
    <div className={styles.reviewColumn}>
      {compact ? <span className={styles.reviewLabel}>Verified guest review</span> : null}
      <div
        className={styles.reviewStage}
        aria-live={autoplayEnabled ? "off" : "polite"}
        aria-atomic="true"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.article
            className={styles.review}
            key={review.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -36 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.48,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ReviewStars value={review.rating} />
            <blockquote className={review.quote.length > 165 ? styles.compactQuote : undefined}>
              &ldquo;{review.quote}&rdquo;
            </blockquote>
            <motion.footer
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0 : 0.08,
                duration: reduceMotion ? 0.01 : 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className={styles.avatar} aria-hidden="true">
                {review.avatarSrc ? (
                  <Image src={review.avatarSrc} alt="" fill sizes="64px" />
                ) : reviewerInitials(review.author)}
              </span>
              <span className={styles.reviewerIdentity}>
                <strong>{review.author}</strong>
                <span>
                  {review.villaName} · {review.dateLabel} · {review.sourceLabel}
                </span>
              </span>
            </motion.footer>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <motion.span
          key={`${review.id}-progress`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: autoplayEnabled ? 1 : 0 }}
          transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}

function AirbnbLink() {
  return (
    <a
      className={styles.airbnbLink}
      href={airbnbHostProof.profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Read guest stories on Airbnb, opens in a new tab"
    >
      <span>Read guest stories on Airbnb</span>
      <FiArrowUpRight aria-hidden="true" />
    </a>
  );
}

export default function GuestStoriesSection({
  placement = "concierge",
}: GuestStoriesSectionProps) {
  const [active, setActive] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const reduceMotion = Boolean(useReducedMotion());
  const review = publicGuestReviews[active];
  const autoplayEnabled = !reduceMotion && isPageVisible;

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(document.visibilityState === "visible");

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!autoplayEnabled || publicGuestReviews.length < 2) return;

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % publicGuestReviews.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [active, autoplayEnabled]);

  return (
    <section
      className={`${styles.section} ${styles[placement]}`}
      aria-labelledby={`${placement}-guest-stories-title`}
    >
      <div className={styles.shell}>
        {placement === "homepage" ? (
          <div className={`${styles.editorialStage} ${styles.compactStage}`}>
            <div className={styles.proofLayout}>
              <aside className={styles.credibility} aria-label="Airbnb host rating summary">
                <span className={styles.eyebrow}>Guest stories</span>
                <h2 id="homepage-guest-stories-title">What our guests say</h2>
                <div className={styles.ratingSummary}>
                  <strong className={styles.rating}>{airbnbHostProof.displayRating}</strong>
                  <span className={styles.ratingDetail}>
                    <span className={styles.summaryStars} aria-label="4.7 out of 5 average rating">
                      ★★★★★
                    </span>
                    <span>{airbnbHostProof.reviewsLabel}</span>
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Host status</dt>
                    <dd>{airbnbHostProof.hostStatus}</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>{airbnbHostProof.hostingTenure}</dd>
                  </div>
                </dl>
              </aside>

              <RotatingReview
                review={review}
                autoplayEnabled={autoplayEnabled}
                reduceMotion={reduceMotion}
                compact
              />
            </div>
            <AirbnbLink />
          </div>
        ) : (
          <>
            <header className={styles.heading}>
              <h2 id="concierge-guest-stories-title">What our guests say</h2>
              <p>
                Thoughtful stays, meaningful experiences. A few words from guests
                who have made Summerhouse part of their time in Bali.
              </p>
            </header>

            <div className={styles.editorialStage}>
              <div className={styles.proofLayout}>
                <aside className={styles.credibility} aria-label="Airbnb host rating summary">
                  <strong className={styles.rating}>{airbnbHostProof.displayRating}</strong>
                  <span className={styles.summaryStars} aria-label="4.7 out of 5 average rating">
                    ★★★★★
                  </span>
                  <p>{airbnbHostProof.reviewsLabel}</p>
                  <dl>
                    <div>
                      <dt>Host status</dt>
                      <dd>{airbnbHostProof.hostStatus}</dd>
                    </div>
                    <div>
                      <dt>Experience</dt>
                      <dd>{airbnbHostProof.hostingTenure}</dd>
                    </div>
                  </dl>
                </aside>

                <RotatingReview
                  review={review}
                  autoplayEnabled={autoplayEnabled}
                  reduceMotion={reduceMotion}
                />
              </div>
              <AirbnbLink />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
