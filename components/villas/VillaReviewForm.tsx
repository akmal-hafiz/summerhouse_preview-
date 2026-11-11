"use client";

import { useState, useTransition } from "react";
import { submitVillaReview } from "@/lib/cms";
import { describeFailure, friendlyFieldMessage } from "@/lib/notifications/guest-messages";
import styles from "./VillaReviews.module.css";

type VillaReviewFormProps = {
  lodgifyId: string;
  villaName: string;
};

type FieldErrors = Record<string, string[] | undefined>;

/** Fields that show their own message under the input. */
const MARKED_FIELDS = ["author", "reviewer_email", "text"];

type Status =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; fieldErrors?: FieldErrors };

export default function VillaReviewForm({ lodgifyId, villaName }: VillaReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [rating, setRating] = useState<number>(5);
  const [pending, startTransition] = useTransition();

  // The server says which field; the words come from guest-messages so raw validation text never shows.
  function fieldError(name: string): string | undefined {
    if (status.kind !== "error" || !status.fieldErrors?.[name]?.length) return undefined;
    return friendlyFieldMessage(name, "review");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      lodgify_property_id: lodgifyId,
      author: String(formData.get("author") ?? "").trim(),
      reviewer_email: String(formData.get("reviewer_email") ?? "").trim() || undefined,
      location: String(formData.get("location") ?? "").trim() || undefined,
      title: String(formData.get("title") ?? "").trim() || undefined,
      text: String(formData.get("text") ?? "").trim(),
      stars: rating,
      stay_date: String(formData.get("stay_date") ?? "").trim() || undefined,
    };

    startTransition(async () => {
      const result = await submitVillaReview(payload);
      if (result.success) {
        setStatus({ kind: "success", message: "Thank you. We read every review before it appears on this page." });
        form.reset();
        setRating(5);
      } else {
        const fieldErrors = "fieldErrors" in result ? result.fieldErrors : undefined;
        const flagged = Object.keys(fieldErrors ?? {});
        setStatus({
          kind: "error",
          message: flagged.some((field) => MARKED_FIELDS.includes(field))
            ? "Your review was not sent. Check the fields marked above, then send it again."
            : flagged.length ? friendlyFieldMessage(flagged[0], "review") : describeFailure("review", result.failure ?? {}),
          fieldErrors,
        });
      }
    });
  }

  return (
    <>
      <div className={styles.formToggleRow}>
        <div className={styles.formToggleCopy}>
          <span className={styles.formToggleTitle}>Stayed at {villaName}?</span>
          <span className={styles.formToggleLead}>
            Share your experience. We publish it after a quick review, and your email stays private.
          </span>
        </div>
        <button
          type="button"
          className={styles.formToggleButton}
          aria-expanded={open}
          aria-controls="villa-review-form"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Write a review"}
        </button>
      </div>

      {open ? (
        <div className={styles.formWrap} id="villa-review-form">
          <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="review-author">Your name</label>
                <input id="review-author" name="author" type="text" required minLength={2} maxLength={120} />
                {fieldError("author") ? <span className={styles.fieldError}>{fieldError("author")}</span> : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="review-location">Where you&rsquo;re from</label>
                <input id="review-location" name="location" type="text" maxLength={120} placeholder="e.g. Lisbon, Portugal" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="review-email">Email (private)</label>
                <input id="review-email" name="reviewer_email" type="email" maxLength={180} />
                {fieldError("reviewer_email") ? (
                  <span className={styles.fieldError}>{fieldError("reviewer_email")}</span>
                ) : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="review-stay-date">Stay date</label>
                <input id="review-stay-date" name="stay_date" type="date" max={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="review-title">Title (optional)</label>
              <input id="review-title" name="title" type="text" maxLength={180} placeholder="A quiet Bali retreat" />
            </div>

            <div className={styles.field}>
              <span id="review-rating-label" className={styles.ratingLabel}>Rating</span>
              <div className={styles.starPicker} role="radiogroup" aria-labelledby="review-rating-label">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onClick={() => setRating(value)}
                    className={`${styles.starButton} ${value <= rating ? styles.starButtonOn : ""}`.trim()}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="review-text">Your review</label>
              <textarea
                id="review-text"
                name="text"
                required
                minLength={20}
                maxLength={4000}
                placeholder="What made your stay memorable?"
              />
              {fieldError("text") ? <span className={styles.fieldError}>{fieldError("text")}</span> : null}
            </div>

            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? "Sending…" : "Submit review"}
            </button>

            {status.kind === "success" ? (
              <p className={styles.statusSuccess} role="status">{status.message}</p>
            ) : null}
            {status.kind === "error" ? (
              <p className={styles.statusError} role="alert">{status.message}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </>
  );
}
