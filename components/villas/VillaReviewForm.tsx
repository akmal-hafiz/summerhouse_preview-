"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { FiCheck, FiX } from "react-icons/fi";
import ModalLayer from "@/components/common/ModalLayer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
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
/** Fields kept as a draft when the dialog closes before the review is sent. */
const DRAFT_FIELDS = ["author", "location", "reviewer_email", "stay_date", "title", "text"] as const;
type Draft = Partial<Record<(typeof DRAFT_FIELDS)[number], string>>;
const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Wonderful",
};
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Status =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; attempt: number; message: string; fieldErrors?: FieldErrors };

function localTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function VillaReviewForm({ lodgifyId, villaName }: VillaReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [rating, setRating] = useState<number>(5);
  const [pending, startTransition] = useTransition();
  const [isDesktop, setIsDesktop] = useState(true);
  const [draft, setDraft] = useState<Draft>({});
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const backdropPressedRef = useRef(false);
  const errorAttemptRef = useRef(0);
  const titleId = useId();
  const ratingLabelId = useId();
  const textHintId = useId();
  const reduce = usePrefersReducedMotion();

  const errorAttempt = status.kind === "error" && status.fieldErrors ? status.attempt : 0;

  useEffect(() => {
    if (!errorAttempt) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errorAttempt]);

  function openDialog() {
    setIsDesktop(typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true);
    setStatus({ kind: "idle" });
    setOpen(true);
  }

  function closeDialog() {
    // While a review is sending, the dialog stays open so the guest sees whether it went through.
    if (pending) return;
    // Keep what the guest typed (and the rating) for the next open; a sent review leaves no form behind.
    const form = formRef.current;
    if (form) {
      const data = new FormData(form);
      setDraft(Object.fromEntries(DRAFT_FIELDS.map((name) => [name, String(data.get(name) ?? "")])));
    }
    setOpen(false);
    setStatus({ kind: "idle" });
  }

  function clearFieldError(name: string) {
    setStatus((current) => {
      if (current.kind !== "error" || !current.fieldErrors?.[name]?.length) return current;
      const nextErrors: FieldErrors = { ...current.fieldErrors };
      delete nextErrors[name];
      const remaining = Object.keys(nextErrors).filter((key) => nextErrors[key]?.length);
      if (remaining.length === 0) return { kind: "idle" };
      return { ...current, fieldErrors: nextErrors };
    });
  }

  function handleStarKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, currentValue: number) {
    let nextValue: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextValue = currentValue >= 5 ? 1 : currentValue + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextValue = currentValue <= 1 ? 5 : currentValue - 1;
    } else if (event.key === "Home") {
      nextValue = 1;
    } else if (event.key === "End") {
      nextValue = 5;
    }
    if (nextValue === null) return;
    event.preventDefault();
    setRating(nextValue);
    starRefs.current[nextValue - 1]?.focus();
  }

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
        setStatus({ kind: "success", message: "We read every review before it appears on this page." });
        form.reset();
        setDraft({});
        setRating(5);
      } else {
        const fieldErrors = "fieldErrors" in result ? result.fieldErrors : undefined;
        const flagged = Object.keys(fieldErrors ?? {});
        errorAttemptRef.current += 1;
        setStatus({
          kind: "error",
          attempt: errorAttemptRef.current,
          message: flagged.some((field) => MARKED_FIELDS.includes(field))
            ? "Your review was not sent. Check the highlighted fields, then try again."
            : flagged.length
              ? friendlyFieldMessage(flagged[0], "review")
              : describeFailure("review", result.failure ?? {}),
          fieldErrors,
        });
      }
    });
  }

  const authorError = fieldError("author");
  const emailError = fieldError("reviewer_email");
  const textError = fieldError("text");

  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.16 } }
    : isDesktop
      ? {
          initial: { opacity: 0, transform: "translateY(12px) scale(0.98)" },
          animate: { opacity: 1, transform: "translateY(0px) scale(1)", transition: { duration: 0.26, ease: EASE_OUT } },
          exit: { opacity: 0, transform: "translateY(6px) scale(0.985)", transition: { duration: 0.16, ease: EASE_OUT } },
        }
      : {
          initial: { transform: "translateY(100%)" },
          animate: { transform: "translateY(0%)", transition: { duration: 0.3, ease: EASE_OUT } },
          exit: { transform: "translateY(100%)", transition: { duration: 0.18, ease: EASE_OUT } },
        };

  return (
    <>
      <button
        type="button"
        className={styles.triggerButton}
        aria-haspopup="dialog"
        onClick={openDialog}
      >
        Write a review
      </button>

      <AnimatePresence>
        {open ? (
          <ReviewDialogPortal
            key="review-dialog"
            villaName={villaName}
            titleId={titleId}
            ratingLabelId={ratingLabelId}
            textHintId={textHintId}
            rating={rating}
            setRating={setRating}
            draft={draft}
            status={status}
            pending={pending}
            reduce={reduce}
            authorError={authorError}
            emailError={emailError}
            textError={textError}
            starRefs={starRefs}
            formRef={formRef}
            backdropPressedRef={backdropPressedRef}
            panelMotion={panelMotion}
            onClose={closeDialog}
            onClearFieldError={clearFieldError}
            onStarKeyDown={handleStarKeyDown}
            onSubmit={handleSubmit}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

type ReviewDialogPortalProps = {
  villaName: string;
  titleId: string;
  ratingLabelId: string;
  textHintId: string;
  rating: number;
  setRating: (next: number) => void;
  draft: Draft;
  status: Status;
  pending: boolean;
  reduce: boolean;
  authorError?: string;
  emailError?: string;
  textError?: string;
  starRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  formRef: React.RefObject<HTMLFormElement | null>;
  backdropPressedRef: React.MutableRefObject<boolean>;
  panelMotion: Record<string, unknown>;
  onClose: () => void;
  onClearFieldError: (name: string) => void;
  onStarKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, currentValue: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function ReviewDialogPortal({
  villaName,
  titleId,
  ratingLabelId,
  textHintId,
  rating,
  setRating,
  draft,
  status,
  pending,
  reduce,
  authorError,
  emailError,
  textError,
  starRefs,
  formRef,
  backdropPressedRef,
  panelMotion,
  onClose,
  onClearFieldError,
  onStarKeyDown,
  onSubmit,
}: ReviewDialogPortalProps) {
  return createPortal(
    <ModalLayer lockScroll onClose={onClose} aria-labelledby={titleId}>
      <div
        className={styles.modalLayer}
        data-lenis-prevent
        onPointerDown={(event) => {
          backdropPressedRef.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          const shouldClose = backdropPressedRef.current && event.target === event.currentTarget;
          backdropPressedRef.current = false;
          if (shouldClose) onClose();
        }}
      >
        <motion.div
          aria-hidden="true"
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.2 }}
        />

        <motion.div className={styles.modalPanel} {...panelMotion}>
          <header className={styles.modalHeader}>
            <div className={styles.modalHeading}>
              <p className={styles.modalEyebrow}>Guest review</p>
              <h2 id={titleId} className={styles.modalTitle}>
                Share your stay at {villaName}
              </h2>
              {status.kind !== "success" ? (
                <p className={styles.modalSubtitle}>
                  Published after a quick check. Your email stays private.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Close review form"
              onClick={onClose}
              disabled={pending}
            >
              <FiX aria-hidden="true" />
            </button>
          </header>

          {status.kind === "success" ? (
            <div className={styles.successState} role="status">
              <span className={styles.successIcon} aria-hidden="true">
                <FiCheck />
              </span>
              <p className={styles.successTitle}>Thank you for sharing your stay.</p>
              <p className={styles.successBody}>{status.message}</p>
              <button type="button" className={styles.submit} onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              className={styles.formGrid}
              aria-labelledby={titleId}
              aria-busy={pending}
              onSubmit={onSubmit}
              noValidate
            >
              <div className={styles.ratingField}>
                <span id={ratingLabelId} className={styles.ratingLabel}>Rating</span>
                <div className={styles.ratingControls}>
                  <div
                    className={styles.starPicker}
                    role="radiogroup"
                    aria-labelledby={ratingLabelId}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        ref={(node) => {
                          starRefs.current[value - 1] = node;
                        }}
                        type="button"
                        role="radio"
                        tabIndex={rating === value ? 0 : -1}
                        aria-checked={rating === value}
                        aria-label={`${value} star${value === 1 ? "" : "s"}, ${RATING_LABELS[value]}`}
                        onClick={() => setRating(value)}
                        onKeyDown={(event) => onStarKeyDown(event, value)}
                        className={`${styles.starButton} ${value <= rating ? styles.starButtonOn : ""}`.trim()}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className={styles.ratingDescriptor} aria-hidden="true">
                    {rating} / 5 · {RATING_LABELS[rating]}
                  </span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="review-author">
                    Your name <span className={styles.requiredMark} aria-hidden="true">*</span>
                  </label>
                  <input
                    id="review-author"
                    name="author"
                  defaultValue={draft.author}
                    type="text"
                    autoComplete="name"
                    autoFocus
                    required
                    minLength={2}
                    maxLength={120}
                    aria-invalid={Boolean(authorError)}
                    aria-describedby={authorError ? "review-author-error" : undefined}
                    onChange={() => onClearFieldError("author")}
                  />
                  {authorError ? (
                    <span id="review-author-error" className={styles.fieldError}>{authorError}</span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="review-location">
                    Where you&rsquo;re from <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="review-location"
                    name="location"
                  defaultValue={draft.location}
                    type="text"
                    maxLength={120}
                    placeholder="Lisbon, Portugal"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="review-email">
                    Email <span className={styles.optional}>(private)</span>
                  </label>
                  <input
                    id="review-email"
                    name="reviewer_email"
                  defaultValue={draft.reviewer_email}
                    type="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={180}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "review-email-error" : undefined}
                    onChange={() => onClearFieldError("reviewer_email")}
                  />
                  {emailError ? (
                    <span id="review-email-error" className={styles.fieldError}>{emailError}</span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label htmlFor="review-stay-date">
                    Stay date <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="review-stay-date"
                    name="stay_date"
                  defaultValue={draft.stay_date}
                    type="date"
                    max={localTodayIso()}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="review-title">
                  Title <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="review-title"
                  name="title"
                  defaultValue={draft.title}
                  type="text"
                  maxLength={180}
                  placeholder="A quiet Bali retreat"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="review-text">
                  Your review <span className={styles.requiredMark} aria-hidden="true">*</span>
                </label>
                <textarea
                  id="review-text"
                  name="text"
                  defaultValue={draft.text}
                  rows={3}
                  required
                  minLength={20}
                  maxLength={4000}
                  placeholder="What made your stay memorable?"
                  aria-invalid={Boolean(textError)}
                  aria-describedby={textError ? `${textHintId} review-text-error` : textHintId}
                  onChange={() => onClearFieldError("text")}
                />
                <span id={textHintId} className={styles.fieldHint}>At least 20 characters.</span>
                {textError ? (
                  <span id="review-text-error" className={styles.fieldError}>{textError}</span>
                ) : null}
              </div>

              <div className={styles.formFooter}>
                {status.kind === "error" ? (
                  <p className={styles.statusError} role="alert">{status.message}</p>
                ) : null}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submit} disabled={pending}>
                    {pending ? "Sending..." : "Submit review"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </ModalLayer>,
    document.body,
  );
}
