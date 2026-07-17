"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiChevronDown, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { useToast } from "@/components/providers/ToastProvider";
import { LiquidDropdownSurface } from "@/components/ui/liquid-dropdown-surface";
import styles from "./Contact.module.css";

const SUBJECT_OPTIONS = [
  "Villa inquiry",
  "Arrival support",
  "Long stay request",
  "Property management",
  "Other question",
] as const;
type ContactSubject = (typeof SUBJECT_OPTIONS)[number];

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

const DEFAULT_CONTACT = {
  email: "info@summerhousebali.com",
  phone: "+62 819 3238 7121",
  whatsapp: "+62 819 3238 7121",
  address: "Bali, Indonesia",
  responseTime: "Within 2 hours",
};

const defaultFaqs = [
  {
    question: "What is the fastest way to reach Summerhouse?",
    answer: "WhatsApp is usually fastest for arrival questions and same-day villa guidance. Email is best for detailed stay requests.",
  },
  {
    question: "Can you help me choose the right villa?",
    answer: "Yes. Share your dates, guest mix, preferred area, and the kind of stay you want, and we will point you toward the best-fit homes.",
  },
  {
    question: "Do you arrange airport transfers or local support?",
    answer: "The Summerhouse team can help with arrival support, drivers, dining suggestions, and trusted local recommendations once your stay is confirmed.",
  },
  {
    question: "Do you support longer stays?",
    answer: "Yes. Tell us your timing and lifestyle needs, and we will help identify homes that are comfortable for a slower Bali rhythm.",
  },
];

type ContactSettings = {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  responseTime?: string | null;
};

type ContactProps = {
  faqs?: Array<{ question: string; answer: string }> | null;
  settings?: ContactSettings | null;
};

function compactPhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function whatsappHref(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : "";
}

function phoneHref(value: string): string {
  const cleaned = compactPhone(value);
  return cleaned.replace(/\D/g, "").length >= 8 ? `tel:${cleaned}` : "";
}

function emailHref(value: string): string {
  const email = value.trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? `mailto:${email}` : "";
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return "+62 8xx xxxx xxxx";

  const prefix = digits.startsWith("62") ? "+62" : `+${digits.slice(0, Math.min(2, digits.length - 6))}`;
  const local = digits.startsWith("62") ? digits.slice(2) : digits.slice(Math.min(2, digits.length - 6));
  const visibleStart = local.slice(0, 3);
  const visibleEnd = local.slice(-3);

  return `${prefix} ${visibleStart} *** *** ${visibleEnd}`;
}

type ContactSubjectFieldProps = {
  value: ContactSubject | "";
  onChange: (next: ContactSubject) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
};

function ContactSubjectField({
  value,
  onChange,
  className,
  placeholder = "Choose a subject",
  required = true,
}: ContactSubjectFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % SUBJECT_OPTIONS.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + SUBJECT_OPTIONS.length) % SUBJECT_OPTIONS.length);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const next = SUBJECT_OPTIONS[activeIndex];
        if (next) {
          onChange(next);
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, activeIndex, onChange]);

  useEffect(() => {
    if (!open) return;
    if (!value) {
      setActiveIndex(0);
      return;
    }
    const idx = SUBJECT_OPTIONS.indexOf(value);
    if (idx >= 0) setActiveIndex(idx);
  }, [open, value]);

  const isEmpty = value === "";

  return (
    <div
      ref={rootRef}
      className={`${className ?? ""} ${styles.subjectField ?? ""}`.trim()}
      data-open={open ? "true" : "false"}
      data-empty={isEmpty ? "true" : "false"}
    >
      <span>Subject</span>
      <button
        ref={triggerRef}
        type="button"
        className={styles.subjectTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        data-placeholder={isEmpty ? "true" : "false"}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.subjectTriggerText}>{isEmpty ? placeholder : value}</span>
        <FiChevronDown
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}
        />
      </button>
      {/* Hidden input keeps form submission + native `required` semantics. */}
      <input
        type="text"
        name="subject"
        value={value}
        onChange={() => {}}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
      />
      {open && (
        <LiquidDropdownSurface
          className={styles.subjectMenu}
          variant="select"
          role="presentation"
        >
          <ul ref={listRef} role="listbox" aria-label="Contact subject" tabIndex={-1}>
            {SUBJECT_OPTIONS.map((option, index) => {
              const selected = option === value;
              const highlighted = index === activeIndex;
              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={selected}
                  data-highlighted={highlighted ? "" : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  {option}
                </li>
              );
            })}
          </ul>
        </LiquidDropdownSurface>
      )}
    </div>
  );
}

export default function Contact({ faqs: faqsProp, settings }: ContactProps = {}) {
  const toast = useToast();
  const rootRef = useRef<HTMLDivElement>(null);
  const faqs = faqsProp && faqsProp.length ? faqsProp : defaultFaqs;
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<ContactSubject | "">("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const contact = useMemo(
    () => ({
      email: settings?.email || DEFAULT_CONTACT.email,
      phone: settings?.phone || DEFAULT_CONTACT.phone,
      whatsapp: settings?.whatsapp || settings?.phone || DEFAULT_CONTACT.whatsapp,
      address: settings?.address || DEFAULT_CONTACT.address,
      responseTime: settings?.responseTime || DEFAULT_CONTACT.responseTime,
    }),
    [settings],
  );
  const maskedPhone = maskPhone(contact.phone);
  const contactPhoneHref = phoneHref(contact.phone);
  const contactEmailHref = emailHref(contact.email);
  const contactWhatsappHref = whatsappHref(contact.whatsapp);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const heroItems = gsap.utils.toArray<HTMLElement>(`.${styles.heroReveal}`);
      gsap.fromTo(
        heroItems,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out", stagger: 0.09 },
      );

      gsap.fromTo(
        `.${styles.dividerLine}`,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: "power3.out", transformOrigin: "center center", delay: 0.32 },
      );

      gsap.fromTo(
        `.${styles.dividerDot}`,
        { autoAlpha: 0, scale: 0.45 },
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)", delay: 0.62 },
      );

      gsap.utils.toArray<HTMLElement>(`.${styles.scrollReveal}`).forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            delay: index % 2 ? 0.04 : 0,
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          },
        );
      });
    },
    { scope: rootRef },
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmittedOk(false);
    setSubmitting(true);

    try {
      const res = await fetch(`${CMS_BASE_URL}/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, phone: phone || null, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
        throw new Error((firstError as string) || data?.message || "Could not send inquiry.");
      }
      setSubmittedOk(true);
      toast.success({ title: "Inquiry sent", message: "The Summerhouse team will reply soon." });
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const errorMessage = (err as Error).message;
      setSubmitError(errorMessage);
      toast.error({ title: "Could not send inquiry", message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={rootRef} className={styles.contactPage}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <p className={`${styles.eyebrow} ${styles.heroReveal}`}>/ Contact</p>
        <h1 id="contact-title" className={styles.heroReveal}>Get in touch</h1>
        <p className={styles.heroReveal}>Tell us what kind of Bali stay you are imagining.</p>
      </section>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerDot} />
        <span className={styles.dividerLine} />
      </div>

      <section className={styles.contactGrid} aria-label="Contact details and form">
        <aside className={`${styles.contactInfo} ${styles.scrollReveal}`}>
          <p>We are here to help. Ask about villas, arrivals, long stays, or a slower Bali rhythm.</p>
          <ul>
            <li>
              <FiMapPin aria-hidden="true" />
              <span>{contact.address}</span>
            </li>
            {contactPhoneHref && (
              <li>
                <FiPhone aria-hidden="true" />
                <a href={contactPhoneHref} aria-label="Call Summerhouse">
                  {maskedPhone}
                </a>
              </li>
            )}
            {contactEmailHref && (
              <li>
                <FiMail aria-hidden="true" />
                <a href={contactEmailHref}>{contact.email}</a>
              </li>
            )}
          </ul>
          {contactWhatsappHref && (
            <a className={styles.whatsappLink} href={contactWhatsappHref} target="_blank" rel="noreferrer">
              WhatsApp / {contact.responseTime}
            </a>
          )}
        </aside>

        <form className={`${styles.form} ${styles.scrollReveal}`} onSubmit={handleSubmit}>
          <label className={styles.fullField}>
            <span>Name</span>
            <input type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <div className={styles.fieldPair}>
            <label>
              <span>Email</span>
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              <span>Phone</span>
              <input type="tel" placeholder="+62 8xx xxxx xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          <ContactSubjectField
            value={subject as ContactSubject}
            onChange={setSubject}
            className={styles.selectField}
          />

          <label className={styles.messageField}>
            <span>Message</span>
            <textarea placeholder="My message is..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>

          {submitError && <p className={styles.formError}>{submitError}</p>}
          {submittedOk && <p className={styles.formSuccess}>Thanks. The Summerhouse team will reach out soon.</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Submit"}
          </button>
        </form>
      </section>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerDot} />
        <span className={styles.dividerLine} />
      </div>

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className={`${styles.faqIntro} ${styles.scrollReveal}`}>
          <p className={styles.eyebrow}>/ FAQ</p>
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>Everything you need to know before planning a stay with Summerhouse.</p>
        </div>
        <div className={`${styles.faqList} ${styles.scrollReveal}`}>
          {faqs.map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <article className={styles.faqItem} key={item.question}>
                <button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}>
                  <span>{item.question}</span>
                  <span aria-hidden="true">{isOpen ? "-" : "+"}</span>
                </button>
                <div className={styles.faqAnswer} data-open={isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

    </div>
  );
}
