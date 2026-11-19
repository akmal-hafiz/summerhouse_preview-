"use client";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiStar } from "react-icons/fi";
import { airbnbHostProof, publicGuestReviews, type PublicGuestReview } from "@/data/publicGuestReviews";
import styles from "./GuestStoriesSection.module.css";

type GuestStoriesSectionProps = { placement?: "homepage" | "concierge" };

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// An invisible copy of the longest quote holds the review at one height, so the controls never jump
// and a short quote keeps its source link right under it, with any spare room below.
const LONGEST_QUOTE = publicGuestReviews.reduce((longest, item) => (item.quote.length > longest.length ? item.quote : longest), "");

// The slide leaves toward the side it came from in reverse, so "next" always reads as forward.
const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * 12}px)` }),
  center: { opacity: 1, transform: "translateX(0px)", transition: { duration: 0.24, ease: EASE_OUT } },
  exit: (direction: number) => ({ opacity: 0, transform: `translateX(${direction * -8}px)`, transition: { duration: 0.14, ease: EASE_OUT } }),
};

function ReviewPortrait({ review }: { review: PublicGuestReview }) {
  const [failed, setFailed] = useState(false);
  const initials = review.author.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("");
  return (
    <div className={styles.portrait}>
      {review.avatarSrc && !failed ? (
        <Image src={review.avatarSrc} alt={review.author} fill sizes="64px" onError={() => setFailed(true)} />
      ) : <span className={styles.initials} aria-hidden="true">{initials}</span>}
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
  const dotsRef = useRef<HTMLDivElement>(null);
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

  // Dots are one tab stop (roving tabindex): when the guest moves with the arrow keys from a dot, focus follows the active dot.
  useEffect(() => {
    const dots = dotsRef.current;
    if (dots?.contains(document.activeElement)) (dots.children[active] as HTMLElement | undefined)?.focus();
  }, [active]);

  if (!review) return null;

  return (
    <section className={styles.section} aria-labelledby={titleId} aria-roledescription="carousel" aria-describedby={instructionsId} onKeyDown={onKeyDown}>
      <div className={styles.shell}>
        {/* Heading left, host proof right: the same opener as the award section above. */}
        <motion.div
          className={styles.header}
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(12px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduceMotion ? 0 : 0.52, ease: EASE_OUT }}
        >
          <h2 id={titleId}>Stories from our guests</h2>
          <div className={styles.proof}>
            <p className={styles.rating}>
              <FiStar aria-hidden="true" fill="currentColor" />
              <strong>{airbnbHostProof.displayRating}</strong>
              <span>{airbnbHostProof.reviewsLabel}</span>
            </p>
            <p className={styles.host}>{airbnbHostProof.hostStatus} · {airbnbHostProof.hostingTenure}</p>
            <a className={styles.airbnbLink} href={airbnbHostProof.profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Read all guest reviews on Airbnb, opens in a new tab">
              Read all reviews on Airbnb<FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </motion.div>
        <p id={instructionsId} className={styles.srOnly}>Use the previous and next buttons, or the left and right arrow keys, to read guest reviews.</p>

        <div className={styles.stage} aria-live="polite" aria-atomic="true" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.article
              id={slideId}
              key={review.id}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`Review ${active + 1} of ${total}`}
              custom={direction}
              variants={reduceMotion ? undefined : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className={styles.body}>
                <div className={styles.bodyLive}>
                  <blockquote className={styles.quote} lang={review.lang}>&ldquo;{review.quote}&rdquo;</blockquote>
                  <a className={styles.sourceLink} href={review.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${review.author}'s full review on ${review.sourceLabel}, opens in a new tab`}>
                    Read full review on {review.sourceLabel}<FiArrowUpRight aria-hidden="true" />
                  </a>
                </div>
                <div className={styles.sizer} aria-hidden="true">
                  <p className={styles.quote}>&ldquo;{LONGEST_QUOTE}&rdquo;</p>
                  <span className={styles.sourceLink}>{"\u00a0"}</span>
                </div>
              </div>
              <footer className={styles.guest}>
                <ReviewPortrait review={review} />
                <div className={styles.identity}>
                  <ReviewStars review={review} />
                  <strong>{review.author}</strong>
                  <span className={styles.villa}>{review.villaName}</span>
                  {/* Undated Booking.com reviews already say "guest review" above; an empty line keeps every review the same height. */}
                  {/\d{4}/.test(review.dateLabel)
                    ? <span className={styles.reviewDate}>{review.dateLabel}</span>
                    : <span className={styles.reviewDate} aria-hidden="true">{" "}</span>}
                </div>
              </footer>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.controls}>
          <div ref={dotsRef} className={styles.dots} role="group" aria-label="Choose a guest review">
            {publicGuestReviews.map((item, index) => (
              <button key={item.id} type="button" aria-label={`Show review ${index + 1} by ${item.author}`} aria-pressed={active === index} aria-controls={slideId} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} />
            ))}
          </div>
          <div className={styles.arrows}>
            <button type="button" aria-label="Previous guest review" aria-controls={slideId} aria-disabled={active === 0} onClick={() => { if (active > 0) move(-1); }}><FiArrowLeft aria-hidden="true" /></button>
            <button type="button" aria-label="Next guest review" aria-controls={slideId} aria-disabled={active === total - 1} onClick={() => { if (active < total - 1) move(1); }}><FiArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
