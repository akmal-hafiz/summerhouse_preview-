"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useFooterSettings } from "@/hooks/useFooterSettings";
import { useGlobalContactSettings } from "@/hooks/useGlobalContactSettings";
import { buildEmailHref, buildWhatsAppHref, buildPhoneHref } from "@/lib/contact-settings";
import styles from "./Footer.module.css";
import { isShowcasePreview } from "@/lib/showcase-preview";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";
const NEWSLETTER_SUBMISSION_URL = process.env.NEXT_PUBLIC_CMS_PILOT_BASE_URL
  ? `${process.env.NEXT_PUBLIC_CMS_PILOT_BASE_URL.replace(/\/$/, "")}/submissions/newsletter`
  : `${CMS_BASE_URL}/v1/newsletter/subscribe`;

export default function Footer() {
  const contact = useGlobalContactSettings();
  const footer = useFooterSettings();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const generalEmailHref = buildEmailHref(contact.generalEmail);
  const reservationEmailHref = buildEmailHref(contact.reservationEmail);
  const whatsappHref = buildWhatsAppHref(contact.whatsapp);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isShowcasePreview) {
      setNewsletterStatus("error");
      setNewsletterMessage("Subscriptions are unavailable in this visual preview. Please contact us directly.");
      return;
    }
    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const response = await fetch(NEWSLETTER_SUBMISSION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: newsletterEmail,
          consent: newsletterConsent,
          source: "footer",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Please check your email and consent.");

      setNewsletterStatus("success");
      setNewsletterMessage("You are on the list. Updates will begin after launch.");
      setNewsletterEmail("");
      setNewsletterConsent(false);
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : "Could not save your subscription.");
    }
  };

  return (
    <footer className={styles.footer} data-site-footer>
      <div className={styles.shell}>
        <div className={styles.main}>
          <div className={styles.information}>
            <div className={styles.contactGrid}>
              <Link href="/" className={styles.brand} aria-label="Summerhouse Bali home"><img src="/SUMMERHOUSE_LOGO_PROJECT_1.svg" alt="Summerhouse Bali" className={styles.logo} /></Link>
              <div className={styles.address}><h2>Address</h2><p>{contact.address}</p></div>
              <div className={styles.contactStack}>
                <div className={styles.email}><h2>{footer.inquiriesHeading}</h2><a href={generalEmailHref}><span className={styles.emailPurpose}>Business</span>{contact.generalEmail}</a><a href={reservationEmailHref}><span className={styles.emailPurpose}>Reservations</span>{contact.reservationEmail}</a></div>
                <div className={styles.phone}><h2>Phone</h2><a href={buildPhoneHref(contact.phone)}>{contact.phone}</a></div>
              </div>
            </div>
            <div className={styles.linkGrid}>
              <div className={styles.navigation}>
                <nav aria-label="Footer navigation"><h2>{footer.navigationHeading}</h2><ul>{footer.navigationLinks.map(item => <li key={`${item.label}-${item.href}`}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>
                <nav aria-label="For villa owners"><h2>{footer.ownersHeading}</h2><ul>{footer.ownerLinks.map(item => <li key={`${item.label}-${item.href}`}><Link href={item.href}>{item.label}</Link></li>)}</ul></nav>
              </div>
              <nav aria-label="Stay locations"><h2>{footer.stayHeading}</h2><ul>{footer.stayLocations.map(item => <li key={item.location}><Link href={`/villas?location=${encodeURIComponent(item.location)}&match=exact`}>{item.label}</Link></li>)}</ul></nav>
              <nav aria-label="Social media"><h2>Social media</h2><ul>{footer.socialLinks.map(item => <li key={`${item.label}-${item.href}`}><a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a></li>)}<li><a href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a></li></ul></nav>
            </div>
          </div>
          <section className={styles.newsletter} aria-labelledby="footer-newsletter-title">
            <h2 id="footer-newsletter-title">{footer.newsletterTitle}</h2>
            <p className={styles.description}>{footer.newsletterDescription}</p>
            <form className={styles.form} onSubmit={subscribe} aria-label="Newsletter subscription" aria-busy={newsletterStatus === "loading"}>
              <div className={styles.formRow}>
                <label className={styles.emailField}><span>Email address</span><input type="email" name="email" autoComplete="email" aria-label="Email address" value={newsletterEmail} onChange={event => setNewsletterEmail(event.target.value)} required maxLength={190} /></label>
                <button type="submit" disabled={newsletterStatus === "loading"}>{newsletterStatus === "loading" ? "Subscribing..." : "Subscribe"}</button>
              </div>
              <label className={styles.consent}><input type="checkbox" checked={newsletterConsent} onChange={event => setNewsletterConsent(event.target.checked)} required /><span>{footer.newsletterConsent}</span></label>
              {newsletterMessage ? <p className={newsletterStatus === "error" ? styles.error : styles.success} role={newsletterStatus === "error" ? "alert" : "status"}>{newsletterMessage}</p> : null}
            </form>
          </section>
        </div>
        <div className={styles.bottom}>
          <p className={styles.closing}>{footer.closingStatement}</p>
          <div className={styles.bottomRight}><small>© {new Date().getFullYear()} {footer.copyrightSuffix}</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
