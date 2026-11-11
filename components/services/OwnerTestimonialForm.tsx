"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitOwnerTestimonial } from "@/lib/cms";
import { describeFailure, friendlyFieldMessage } from "@/lib/notifications/guest-messages";
import styles from "./OwnerTestimonialForm.module.css";

type FieldErrors = Record<string, string[] | undefined>;

type Status =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; fieldErrors?: FieldErrors };

type OwnerTestimonialFormProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  closeLabel?: string;
};

export default function OwnerTestimonialForm({
  title = "Is your villa managed by Summerhouse?",
  description = "Share your honest experience as an owner, published after a quick review. Your email stays private.",
  buttonLabel = "Share your experience",
  closeLabel = "Close",
}: OwnerTestimonialFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (open) formRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); }, [open]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const submitting = useRef(false);
  useEffect(() => {
    if (status.kind === "error") formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [status]);

  // The server says which field; the words come from guest-messages so raw validation text never shows.
  function fieldError(name: string): string | undefined {
    if (status.kind !== "error" || !status.fieldErrors?.[name]?.length) return undefined;
    return friendlyFieldMessage(name, "owner-story");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      author: String(formData.get("author") ?? "").trim(),
      reviewer_email: String(formData.get("reviewer_email") ?? "").trim() || undefined,
      owner_role: String(formData.get("owner_role") ?? "").trim() || undefined,
      villa_name: String(formData.get("villa_name") ?? "").trim() || undefined,
      text: String(formData.get("text") ?? "").trim(),
    };

    submitting.current = true;
    setStatus({ kind: "idle" });
    startTransition(async () => {
      try {
        const result = await submitOwnerTestimonial(payload);
        if (result.success) {
          setStatus({ kind: "success", message: "Thank you. We read every story before it goes live." });
          form.reset();
        } else {
          const fieldErrors = "fieldErrors" in result ? result.fieldErrors : undefined;
          setStatus({
            kind: "error",
            message: fieldErrors && Object.keys(fieldErrors).length
              ? "Your story was not sent. Check the fields marked above, then send it again."
              : describeFailure("owner-story", result.failure ?? {}),
            fieldErrors,
          });
        }
      } catch {
        setStatus({ kind: "error", message: describeFailure("owner-story", { network: true }) });
      } finally { submitting.current = false; }
    });
  }

  return (
    <>
      <div className={styles.formToggleRow} data-motion-rule-host><span data-motion-rule aria-hidden="true" />
        <div className={styles.formToggleCopy}>
          <span className={styles.formToggleTitle}>{title}</span>
          <span className={styles.formToggleLead}>{description}</span>
        </div>
        <button
          type="button"
          data-motion-link
          className={styles.formToggleButton}
          aria-expanded={open}
          aria-controls="owner-testimonial-form"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? closeLabel : buttonLabel}
        </button>
      </div>

      {open ? (
        <div className={styles.formWrap} id="owner-testimonial-form">
          <form ref={formRef} className={styles.formGrid} onSubmit={handleSubmit} noValidate aria-busy={pending}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="owner-name">Your name</label>
                <input id="owner-name" name="author" autoComplete="name" aria-invalid={Boolean(fieldError("author"))} aria-describedby={fieldError("author") ? "owner-name-error" : undefined} type="text" required minLength={2} maxLength={120} />
                {fieldError("author") ? <span id="owner-name-error" className={styles.fieldError}>{fieldError("author")}</span> : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="owner-role">Your role</label>
                <input id="owner-role" name="owner_role" autoComplete="organization-title" aria-invalid={Boolean(fieldError("owner_role"))} aria-describedby={fieldError("owner_role") ? "owner-role-error" : undefined} type="text" maxLength={120} placeholder="e.g. Villa Owner, Property Investor" />
                {fieldError("owner_role") ? <span id="owner-role-error" className={styles.fieldError}>{fieldError("owner_role")}</span> : null}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="owner-villa">Villa name</label>
                <input id="owner-villa" name="villa_name" autoComplete="off" aria-invalid={Boolean(fieldError("villa_name"))} aria-describedby={fieldError("villa_name") ? "owner-villa-error" : undefined} type="text" maxLength={160} placeholder="e.g. Villa Zen, Pererenan" />
                {fieldError("villa_name") ? <span id="owner-villa-error" className={styles.fieldError}>{fieldError("villa_name")}</span> : null}
              </div>
              <div className={styles.field}>
                <label htmlFor="owner-email">Email (private)</label>
                <input id="owner-email" name="reviewer_email" autoComplete="email" aria-invalid={Boolean(fieldError("reviewer_email"))} aria-describedby={fieldError("reviewer_email") ? "owner-email-error" : undefined} type="email" maxLength={180} />
                {fieldError("reviewer_email") ? (
                  <span id="owner-email-error" className={styles.fieldError}>{fieldError("reviewer_email")}</span>
                ) : null}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="owner-text">Your testimonial</label>
              <textarea
                id="owner-text"
                name="text"
                autoComplete="off"
                aria-invalid={Boolean(fieldError("text"))}
                aria-describedby={fieldError("text") ? "owner-text-error" : undefined}
                required
                minLength={20}
                maxLength={4000}
                placeholder="How has Summerhouse managing your property worked out?"
              />
              {fieldError("text") ? <span id="owner-text-error" className={styles.fieldError}>{fieldError("text")}</span> : null}
            </div>

            <button type="submit" data-motion-button="solid" className={styles.submit} disabled={pending}>
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
