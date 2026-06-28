"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiClock, FiMail, FiMapPin, FiMessageCircle, FiPhone } from "react-icons/fi";
import styles from "./Contact.module.css";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

const contactOptions = [
  {
    icon: FiMessageCircle,
    label: "WhatsApp",
    value: "+62 811 388 999",
    note: "Fastest for arrivals and same-day questions",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "hello@summerhousebali.com",
    note: "Best for detailed stay requests",
  },
  {
    icon: FiMapPin,
    label: "Location",
    value: "Bali, Indonesia",
    note: "Serving Canggu, Ubud, Umalas, and beyond",
  },
  {
    icon: FiClock,
    label: "Response time",
    value: "Within 24 hours",
    note: "Urgent guest support is prioritized",
  },
];

const defaultFaqs = [
  {
    question: "Can you help me choose the right villa?",
    answer: "Yes. Share your dates, guest mix, and preferred area, and we will guide you toward homes that fit the way you want to stay.",
  },
  {
    question: "Can you arrange airport transfers or local plans?",
    answer: "Our team can help with arrival support, drivers, dining suggestions, and trusted local recommendations once your stay is confirmed.",
  },
  {
    question: "Do you support longer stays?",
    answer: "Yes. Tell us your timing and lifestyle needs, and we will help identify homes that are comfortable for a slower Bali rhythm.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

type ContactProps = {
  faqs?: Array<{ question: string; answer: string }> | null;
};

export default function Contact({ faqs: faqsProp }: ContactProps = {}) {
  const faqs = faqsProp && faqsProp.length ? faqsProp : defaultFaqs;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [guests, setGuests] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const composedSubject = travelDates ? `Inquiry for ${travelDates}` : "Villa inquiry";
    const composedMessage = [
      message,
      guests ? `Guests: ${guests}` : "",
      travelDates ? `Dates: ${travelDates}` : "",
    ].filter(Boolean).join("\n\n");

    try {
      const res = await fetch(`${CMS_BASE_URL}/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone: phone || null,
          subject: composedSubject,
          message: composedMessage || message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
        throw new Error(firstError as string || data?.message || "Could not send inquiry.");
      }
      setSubmittedOk(true);
      setFirstName(""); setLastName(""); setEmail(""); setPhone("");
      setTravelDates(""); setGuests(""); setMessage("");
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <section className={styles.hero}>
        <Image
          src="/homepage_villa/curated-5-lounge.webp"
          alt="Quiet Summerhouses villa lounge in Bali"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={styles.heroContent}
        >
          <p className={styles.eyebrow}>Contact Summerhouses</p>
          <h1>Tell us what kind of Bali stay you are imagining.</h1>
          <p>
            Whether you know the villa you want or only the feeling you are chasing, our team will help you
            move from idea to arrival with calm, practical guidance.
          </p>
        </motion.div>
      </section>

      <section className={styles.optionsSection}>
        <div className={styles.optionsHeader}>
          <p className={styles.eyebrow}>Direct details</p>
          <h2>Choose the easiest way to reach us.</h2>
        </div>
        <div className={styles.optionGrid}>
          {contactOptions.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                key={item.label}
                className={styles.optionCard}
              >
                <div className={styles.motionContents}>
                  <div className={styles.optionIcon}>
                    <Icon aria-hidden="true" />
                  </div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className={styles.formSection}>
        <motion.div {...fadeUp} className={styles.formIntro}>
          <div className={styles.motionContents}>
            <p className={styles.eyebrow}>Inquiry</p>
            <h2>Share a few details. We will take it from there.</h2>
            <p>
              The more we know about your dates, group, and preferred pace, the better we can recommend a villa
              that feels natural from the moment you arrive.
            </p>
          </div>
        </motion.div>

        <motion.form {...fadeUp} className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.motionContents}>
            <div className={styles.fieldGrid}>
              <label>
                <span>First name *</span>
                <input type="text" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                <span>Last name</span>
                <input type="text" placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
            </div>
            <div className={styles.fieldGrid}>
              <label>
                <span>Email *</span>
                <input type="email" placeholder="jane@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                <span>WhatsApp</span>
                <input type="tel" placeholder="+62 811 388 999" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>
            <div className={styles.fieldGrid}>
              <label>
                <span>Travel dates</span>
                <input type="text" placeholder="June 12 - June 18" value={travelDates} onChange={(e) => setTravelDates(e.target.value)} />
              </label>
              <label>
                <span>Guests</span>
                <input type="text" placeholder="2 adults, 2 children" value={guests} onChange={(e) => setGuests(e.target.value)} />
              </label>
            </div>
            <label>
              <span>What can we help with? *</span>
              <textarea placeholder="Tell us about the area, villa style, occasion, or support you would like." value={message} onChange={(e) => setMessage(e.target.value)} required />
            </label>
            {submitError && <p style={{ color: "#b14a3d", fontSize: "0.9rem", margin: 0 }}>{submitError}</p>}
            {submittedOk && <p style={{ color: "#2e5c45", fontSize: "0.9rem", margin: 0 }}>Thanks. We will reach out within 2 hours.</p>}
            <button type="submit" disabled={submitting}>
              <span>{submitting ? "Sending..." : "Send inquiry"}</span>
              <span className={styles.ctaIconWrap} aria-hidden="true">
                <FiArrowUpRight />
              </span>
            </button>
          </div>
        </motion.form>
      </section>

      <section className={styles.expectations}>
        <motion.figure {...fadeUp} className={styles.expectationImage}>
          <Image
            src="/homepage_villa/curated-2-detail.webp"
            alt="Summerhouses villa bedroom detail"
            width={1300}
            height={1000}
            sizes="(min-width: 1024px) 46vw, 100vw"
          />
        </motion.figure>
        <motion.div {...fadeUp} className={styles.expectationCopy}>
          <div className={styles.motionContents}>
            <p className={styles.eyebrow}>What to expect</p>
            <h2>A real person, a clear reply, and no pressure.</h2>
            <p>
              We respond with availability guidance, villa fit, and next steps. If your request needs a little
              extra care, we will say so clearly and help you find the best path.
            </p>
            <Link href="/villas">
              <span>Browse villas first</span>
              <span className={styles.ctaIconWrap} aria-hidden="true">
                <FiArrowUpRight />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqHeader}>
          <p className={styles.eyebrow}>Common questions</p>
          <h2>Before you write.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((item) => (
            <motion.article {...fadeUp} key={item.question} className={styles.faqItem}>
              <div className={styles.motionContents}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>Summerhouses Bali</p>
        <h2>Your island stay can start with a simple message.</h2>
        <a href="mailto:hello@summerhousebali.com">
          <FiPhone aria-hidden="true" />
          <span>Contact the team</span>
          <span className={styles.ctaIconWrap} aria-hidden="true">
            <FiArrowUpRight />
          </span>
        </a>
      </section>
    </div>
  );
}
