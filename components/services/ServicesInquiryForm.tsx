"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { isShowcasePreview } from "@/lib/showcase-preview";
import styles from "./ServicesInquiryForm.module.css";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

export default function ServicesInquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (Object.keys(fieldErrors).length) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [fieldErrors]);
  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(fieldErrors[name]),
    "aria-describedby": fieldErrors[name] ? `inquiry-${name}-error` : undefined,
  });
  const errorFor = (name: string) => fieldErrors[name] ? <span id={`inquiry-${name}-error`} className={styles.fieldError}>{fieldErrors[name]}</span> : null;
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "success"; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    if (isShowcasePreview) { setStatus({ kind: "error", message: "Submissions are unavailable in this visual preview." }); return; }
    const fields = new FormData(form);
    const interest = String(fields.get("interest"));
    const message = String(fields.get("message") || "").trim();
    submitting.current = true;
    setPending(true); setStatus(null); setFieldErrors({});
    try {
      const response = await fetch(`${CMS_BASE_URL}/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: String(fields.get("name") || "").trim(),
          email: String(fields.get("email") || "").trim(),
          phone: String(fields.get("phone") || "").trim() || null,
          subject: "Property management",
          message: interest === "Full villa management" ? message : `Service interest: ${interest}\n\n${message}`,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 422 && data?.errors && typeof data.errors === "object") {
          const errors: Record<string, string> = {};
          for (const name of ["name", "email", "phone", "message"]) {
            const value = data.errors[name];
            const message = Array.isArray(value) ? value.find((item: unknown) => typeof item === "string") : value;
            if (typeof message === "string") errors[name] = message;
          }
          setFieldErrors(errors);
        }
        throw new Error(response.status === 422 ? "Please check your details and try again." : "Your inquiry could not be sent. Please try again shortly.");
      }
      setStatus({ kind: "success", message: typeof data?.message === "string" ? data.message : "Thank you. The Summerhouse team will be in touch." });
      form.reset();
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Your inquiry could not be sent. Please try again." });
    } finally { submitting.current = false; setPending(false); }
  }
  return (
    <form ref={formRef} className={styles.form} onSubmit={submit} aria-label="Villa management inquiry" aria-busy={pending}>
      <p className={styles.intro}>Tell us about your villa, its location, and the support you are looking for. Our Bali team will be in touch.</p>
      <div className={styles.fields}>
        <label>Full name<input name="name" {...fieldProps("name")} autoComplete="name" required maxLength={120} />{errorFor("name")}</label>
        <label>Email address<input name="email" {...fieldProps("email")} type="email" autoComplete="email" required maxLength={160} />{errorFor("email")}</label>
        <label>Phone number <span className={styles.optional}>(optional)</span><input name="phone" {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={50} />{errorFor("phone")}</label>
        <label>Interested in<select name="interest" defaultValue="Full villa management"><option>Full villa management</option><option>Operations & guest care</option><option>Sales & marketing</option><option>Project & renovation</option></select></label>
        <label className={styles.message}>About your villa<textarea name="message" {...fieldProps("message")} required maxLength={4800} rows={3} />{errorFor("message")}</label>
      </div>
      <div className={styles.actions}>
        {status ? <p className={status.kind === "error" ? styles.error : styles.success} role={status.kind === "error" ? "alert" : "status"}>{status.message}</p> : null}
        <button data-motion-button="solid" type="submit" disabled={pending}>{pending ? "Sending inquiry..." : "Send inquiry"}</button>
      </div>
    </form>
  );
}
