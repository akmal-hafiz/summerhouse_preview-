"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiChevronDown } from "react-icons/fi";
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
  generalEmail: "info@summerhousebali.com",
  reservationEmail: "reservation.summerhouse@gmail.com",
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
  generalEmail?: string | null;
  reservationEmail?: string | null;
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
      generalEmail: settings?.generalEmail || DEFAULT_CONTACT.generalEmail,
      reservationEmail: settings?.reservationEmail || DEFAULT_CONTACT.reservationEmail,
      phone: settings?.phone || DEFAULT_CONTACT.phone,
      whatsapp: settings?.whatsapp || settings?.phone || DEFAULT_CONTACT.whatsapp,
      address: settings?.address || DEFAULT_CONTACT.address,
      responseTime: settings?.responseTime || DEFAULT_CONTACT.responseTime,
    }),
    [settings],
  );
  const contactPhoneHref = phoneHref(contact.phone);
  const contactEmailHref = emailHref(contact.generalEmail);
  const reservationEmailHref = emailHref(contact.reservationEmail);
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
      <section className={styles.contactHero} aria-labelledby="contact-title">
        <div className={styles.contactHeading}>
          <div>
            <p className={`${styles.eyebrow} ${styles.heroReveal}`}><span />Contact us<span /></p>
            <h1 id="contact-title" className={styles.heroReveal}>Share your Bali<br /><em>vision with us</em></h1>
          </div>
          <p className={styles.heroReveal}>Tell us about your dates, preferred area, and the kind of stay you have in mind. Our Bali team will make the next step feel simple.</p>
        </div>

        <div className={styles.contactGrid} aria-label="Contact form">
          <figure className={`${styles.heroImage} ${styles.scrollReveal}`}>
            <Image src="/Hero_Section.png" alt="A calm Summerhouse villa pool in Bali" fill priority sizes="(min-width: 901px) 46vw, 100vw" />
            <span className={styles.imageCutTop} aria-hidden="true" />
            <span className={styles.imageCutBottom} aria-hidden="true" />
          </figure>

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
            {submitting ? "Saving inquiry..." : "Send message"}
          </button>
          </form>
        </div>
      </section>

      <section className={styles.connected} aria-labelledby="connected-title">
        <div className={`${styles.connectedIntro} ${styles.scrollReveal}`}>
          <p className={styles.eyebrow}><span />Connect<span /></p>
          <h2 id="connected-title">Stay <em>Connected</em></h2>
          <dl>
            <div><dt>General inquiries</dt><dd><a href={contactEmailHref}>{contact.generalEmail}</a></dd></div>
            <div><dt>Bookings & stay planning</dt><dd><a href={reservationEmailHref}>{contact.reservationEmail}</a></dd></div>
            <div><dt>Based in</dt><dd>{contact.address}</dd></div>
          </dl>
        </div>

        <div className={`${styles.connectedChannels} ${styles.scrollReveal}`}>
          <dl>
            <div><dt>Phone</dt><dd><a href={contactPhoneHref}>{contact.phone}</a></dd></div>
            <div><dt>Response time</dt><dd>{contact.responseTime}</dd></div>
            <div><dt>Socials</dt><dd><a href="https://www.instagram.com/summerhouse.bali/" target="_blank" rel="noreferrer">Instagram</a><a href="https://pin.it/3CgvbgIq5" target="_blank" rel="noreferrer">Pinterest</a></dd></div>
          </dl>
          <p>Travel feels better when every detail has room to breathe. We help turn a villa search into a stay that feels considered from the beginning.</p>
        </div>

        <div className={`${styles.connectedVisual} ${styles.scrollReveal}`}>
          <span className={styles.yearMark}>Bali</span>
          <div className={styles.photoStack}>
            <figure><Image src="/Found_myself..jpg" alt="A quiet Summerhouse interior moment" fill sizes="(min-width: 901px) 30vw, 90vw" /></figure>
            <i aria-hidden="true" /><i aria-hidden="true" />
          </div>
          {contactWhatsappHref && <a href={contactWhatsappHref} target="_blank" rel="noreferrer">Start on WhatsApp <span>↗</span></a>}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className={`${styles.faqIntro} ${styles.scrollReveal}`}>
          <p className={styles.eyebrow}><span />FAQ<span /></p>
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
