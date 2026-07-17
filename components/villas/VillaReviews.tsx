import Image from "next/image";
import type { CmsVillaReview, CmsVillaReviewSummary } from "@/lib/cms";
import styles from "./VillaReviews.module.css";
import VillaReviewForm from "./VillaReviewForm";

type VillaReviewsProps = {
  lodgifyId: string;
  villaName: string;
  summary: CmsVillaReviewSummary | null;
  reviews: CmsVillaReview[];
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return null;
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long" }).format(d);
}

export default function VillaReviews({ lodgifyId, villaName, summary, reviews }: VillaReviewsProps) {
  const hasReviews = reviews.length > 0;
  const average = summary?.average_rating ?? null;
  const total = summary?.total_count ?? 0;

  return (
    <section className="villa-detail-section" id="reviews" aria-labelledby="villa-reviews-heading">
      <div className="villa-detail-section-heading">
        <p className="villa-detail-section-label">Reviews</p>
        {hasReviews && average !== null ? (
          <h2 id="villa-reviews-heading" className={styles.headline}>
            <span className={styles.headlineScore}>
              <span className={styles.headlineStar} aria-hidden="true">★</span>
              {average.toFixed(1)}
            </span>
            <span className={styles.headlineCount}>
              · {total} review{total === 1 ? "" : "s"}
            </span>
          </h2>
        ) : (
          <h2 id="villa-reviews-heading">What guests remember.</h2>
        )}
      </div>

      {hasReviews ? (
        <div className={styles.grid}>
          {reviews.map((review) => {
            const initials = getInitials(review.reviewerName);
            const stars = review.rating ?? 0;
            const dateLabel = formatDate(review.reviewDate ?? review.publishedAt);
            return (
              <article key={review.id} className={styles.review}>
                <header className={styles.reviewHead}>
                  <div className={styles.avatar} aria-hidden={review.reviewerAvatarUrl ? undefined : true}>
                    {review.reviewerAvatarUrl ? (
                      <Image src={review.reviewerAvatarUrl} alt={review.reviewerName} width={42} height={42} />
                    ) : (
                      <span>{initials || review.reviewerName.charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.reviewer}>
                    <span className={styles.reviewerName}>{review.reviewerName}</span>
                    <span className={styles.reviewerMeta}>
                      {[review.reviewerLocation, dateLabel].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </header>

                {(stars > 0 || review.isVerified) ? (
                  <div className={styles.reviewStarsRow}>
                    {stars > 0 ? (
                      <span className={styles.reviewStars} aria-label={`${stars} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} aria-hidden="true" className={idx < stars ? undefined : styles.reviewStarOff}>
                            ★
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {review.isVerified ? <span className={styles.verifiedDot}>Verified stay</span> : null}
                    {review.sourceLabel ? <span className={styles.verifiedDot}>{review.sourceLabel}</span> : null}
                  </div>
                ) : null}

                {review.title ? <p className={styles.reviewTitle}>{review.title}</p> : null}
                <p className={styles.reviewText}>{review.comment}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>
          No reviews yet for {villaName}. Stayed here? Share your experience below — it goes live after a quick check
          by our team.
        </p>
      )}

      <VillaReviewForm lodgifyId={lodgifyId} villaName={villaName} />
    </section>
  );
}
