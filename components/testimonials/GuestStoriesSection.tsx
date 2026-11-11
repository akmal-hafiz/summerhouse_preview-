"use client";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiStar } from "react-icons/fi";
import { airbnbHostProof, publicGuestReviews, type PublicGuestReview } from "@/data/publicGuestReviews";
import styles from "./GuestStoriesSection.module.css";

type GuestStoriesSectionProps = { placement?: "homepage" | "concierge" };

function ReviewPortrait({ review }: { review: PublicGuestReview }) {
  const [failed, setFailed] = useState(false);
  const initials = review.author.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("");
  return (
    <div className={styles.portrait}>
      {review.avatarSrc && !failed ? (
        <Image src={review.avatarSrc} alt={review.author} fill sizes="(max-width: 600px) 160px, 250px" onError={() => setFailed(true)} />
      ) : <span className={styles.initials} aria-label={review.author}>{initials}</span>}
    </div>
  );
}

function ReviewStars({ review }: { review: PublicGuestReview }) {
  if (review.rating === null) return <span className={styles.reviewSource}>{review.sourceLabel} guest review</span>;
  return (
    <span className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => <FiStar key={index} fill={index < Math.round(review.rating!) ? "currentColor" : "none"} aria-hidden="true" />)}
    </span>
  );
}

export default function GuestStoriesSection({ placement = "concierge" }: GuestStoriesSectionProps) {
  const [{ index: active, direction }, setSlide] = useState({ index: 0, direction: 1 });
  const reduceMotion = Boolean(usePrefersReducedMotion());
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const total = publicGuestReviews.length;
  const review = publicGuestReviews[active];
  const titleId = `${placement}-guest-stories-title`;
  const slideId = `${placement}-guest-review`;
  const instructionsId = `${placement}-guest-review-instructions`;

  const select = (index: number) => setSlide(current => {
    const next = Math.max(0, Math.min(total - 1, index));
    return next === current.index ? current : { index: next, direction: next > current.index ? 1 : -1 };
  });
  const move = (step: number) => setSlide(current => {
    const next = Math.max(0, Math.min(total - 1, current.index + step));
    return next === current.index ? current : { index: next, direction: step > 0 ? 1 : -1 };
  });
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest("a")) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "Home") { event.preventDefault(); select(0); }
    if (event.key === "End") { event.preventDefault(); select(total - 1); }
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || (event.target as HTMLElement).closest("a, button")) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  };

  if (!review) return null;

  return (
    <section className={styles.section} aria-labelledby={titleId} aria-roledescription="carousel" aria-describedby={instructionsId} onKeyDown={onKeyDown}>
      <div className={styles.shell}>
        <h2 id={titleId} className={styles.heading}>Stories from our<br />guests</h2>
        <p id={instructionsId} className={styles.srOnly}>Use the previous and next buttons, or the left and right arrow keys, to read guest reviews.</p>

        <div className={styles.controls}>
          <div className={styles.dots} role="group" aria-label="Choose a guest review">
            {publicGuestReviews.map((item, index) => (
              <button key={item.id} type="button" aria-label={`Show review ${index + 1} by ${item.author}`} aria-pressed={active === index} aria-controls={slideId} onClick={() => select(index)} />
            ))}
          </div>
          <div className={styles.arrows}>
            <button type="button" aria-label="Previous guest review" aria-controls={slideId} aria-disabled={active === 0} onClick={() => { if (active > 0) move(-1); }}><FiArrowLeft aria-hidden="true" /></button>
            <button type="button" aria-label="Next guest review" aria-controls={slideId} aria-disabled={active === total - 1} onClick={() => { if (active < total - 1) move(1); }}><FiArrowRight aria-hidden="true" /></button>
          </div>
        </div>

        <div className={styles.stage} aria-live="polite" aria-atomic="true" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
          <AnimatePresence initial={false} mode="wait">
            <motion.article
              id={slideId}
              key={review.id}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`Review ${active + 1} of ${total}`}
              initial={reduceMotion ? false : { opacity: 0, x: direction * 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: direction * -18 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.photoPanel}><ReviewPortrait review={review} /></div>
              <div className={styles.quotePanel}><blockquote>&ldquo;{review.quote}&rdquo;</blockquote></div>
              <footer className={styles.identityPanel}>
                <ReviewStars review={review} />
                <div className={styles.identity}>
                  <strong>{review.author}</strong>
                  <span>{review.villaName}</span>
                  <span className={styles.reviewDate}>{review.dateLabel}</span>
                  <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${review.author}'s full review on ${review.sourceLabel}, opens in a new tab`}>
                    Read full review on {review.sourceLabel}<FiArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </footer>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.proof} aria-label="Airbnb host rating summary">
            <span><strong>{airbnbHostProof.displayRating}</strong> {airbnbHostProof.reviewsLabel}</span>
            <span>{airbnbHostProof.hostStatus}</span>
            <span>{airbnbHostProof.hostingTenure}</span>
          </div>
          <a className={styles.airbnbLink} href={airbnbHostProof.profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Read all guest reviews on Airbnb, opens in a new tab">
            Read all reviews on Airbnb<FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
