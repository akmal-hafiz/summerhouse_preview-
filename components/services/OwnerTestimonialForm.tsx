"use client";

import { useState, useTransition } from "react";
import { submitOwnerTestimonial } from "@/lib/cms";
import styles from "@/components/villas/VillaReviews.module.css";

type FieldErrors = Record<string, string[] | undefined>;

type Status =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; fieldErrors?: FieldErrors };

export default function OwnerTestimonialForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function fieldError(name: string): string | undefined {
    if (status.kind !== "error") return undefined;
    return status.fieldErrors?.[name]?.[0];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      author: String(formData.get("author") ?? "").trim(),
      reviewer_email: String(formData.get("reviewer_email") ?? "").trim() || undefined,
      owner_role: String(formData.get("owner_role") ?? "").trim() || undefined,
      villa_name: String(formData.get("villa_name") ?? "").trim() || undefined,
      text: String(formData.get("text") ?? "").trim(),
    };

    startTransition(async () => {
      const result = await submitOwnerTestimonial(payload);
      if (result.success) {
        setStatus({ kind: "success", message: result.message });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          message: result.error,
          fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
        });
      }
    });
  }

  return (
    <>
      <div className={styles.formToggleRow}>
        <div className={styles.formToggleCopy}>
          <span className={styles.formToggleTitle}>Is your villa managed by Summerhouse?</span>
          <span className={styles.formToggleLead}>
            Share your honest experience as an owner — published after a quick review. Your email stays private.
          </span>
        </div>
        <button
          type="button"
          className={styles.formToggleButton}
          aria-expanded={open}
          aria-controls="owner-testimonial-form"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Share your experience"}
        </button>
      </div>

      {open ? (
        <div className={styles.formWrap} id="owner-testimonial-form">
          <form className={styles.formGrid} onSubmit={handleSubmit} noValidate>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="owner-name">Your name</label>
                <input id="owner-name" name="author" type="text" required minLength={2} maxLength={120} />
                {fieldError("author") ? <span className={styles.fieldError}>{fieldError("author")}</span> : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="owner-role">Your role</label>
                <input id="owner-role" name="owner_role" type="text" maxLength={120} placeholder="e.g. Villa Owner, Property Investor" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="owner-villa">Villa name</label>
                <input id="owner-villa" name="villa_name" type="text" maxLength={160} placeholder="e.g. Villa Zen, Pererenan" />
              </div>
              <div className={styles.field}>
                <label htmlFor="owner-email">Email (private)</label>
                <input id="owner-email" name="reviewer_email" type="email" maxLength={180} />
                {fieldError("reviewer_email") ? (
                  <span className={styles.fieldError}>{fieldError("reviewer_email")}</span>
                ) : null}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="owner-text">Your testimonial</label>
              <textarea
                id="owner-text"
                name="text"
                required
                minLength={20}
                maxLength={4000}
                placeholder="How has Summerhouse managing your property worked out?"
              />
              {fieldError("text") ? <span className={styles.fieldError}>{fieldError("text")}</span> : null}
            </div>

            <button type="submit" className={styles.submit} disabled={pending}>
              {pending ? "Sending…" : "Submit testimonial"}
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
