"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useFooterSettings } from "@/hooks/useFooterSettings";
import { useGlobalContactSettings } from "@/hooks/useGlobalContactSettings";
import { buildEmailHref, buildWhatsAppHref } from "@/lib/contact-settings";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

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
    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const response = await fetch(`${CMS_BASE_URL}/v1/newsletter/subscribe`, {
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
    <footer className="sh-footer" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <div className="sh-footer-container">
        <div className="sh-footer-top">
          <div className="sh-footer-brand-newsletter">
            <div className="sh-footer-brand-logo">
              <img
                src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
                alt="Summerhouse Bali"
                className="sh-footer-logo-img"
              />
            </div>

            <div className="sh-footer-newsletter">
              <h2 className="sh-footer-newsletter-title">{footer.newsletterTitle}</h2>
              <p className="sh-footer-desc">{footer.newsletterDescription}</p>
              <form className="sh-footer-form" onSubmit={subscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="sh-footer-input"
                  aria-label="Email address"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="sh-footer-submit"
                  aria-label="Subscribe"
                  disabled={newsletterStatus === "loading"}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sh-footer-submit-icon"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </button>
                <label className="sh-footer-consent">
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    onChange={(event) => setNewsletterConsent(event.target.checked)}
                    required
                  />
                  <span>{footer.newsletterConsent}</span>
                </label>
                {newsletterMessage ? (
                  <p className={`sh-footer-form-status is-${newsletterStatus}`} role="status">
                    {newsletterMessage}
                  </p>
                ) : null}
              </form>
            </div>
          </div>

          <div className="sh-footer-right-block">
            <div className="sh-footer-columns">
              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">{footer.stayHeading}</h3>
                <ul className="sh-footer-links-list">
                  {footer.stayLocations.map((item) => (
                    <li key={item.location}>
                      <Link
                        href={`/villas?location=${encodeURIComponent(item.location)}&match=exact`}
                        className="sh-footer-link"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">{footer.ownersHeading}</h3>
                <ul className="sh-footer-links-list">
                  {footer.ownerLinks.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <Link href={item.href} className="sh-footer-link">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">{footer.navigationHeading}</h3>
                <ul className="sh-footer-links-list">
                  {footer.navigationLinks.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <Link href={item.href} className="sh-footer-link">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">{footer.inquiriesHeading}</h3>
                <ul className="sh-footer-inquiries-list">
                  <li>
                    <span className="sh-inquiry-label">Business</span>
                    <a href={generalEmailHref} className="sh-inquiry-email">{contact.generalEmail}</a>
                  </li>
                  <li>
                    <span className="sh-inquiry-label">Reservations</span>
                    <a href={reservationEmailHref} className="sh-inquiry-email">{contact.reservationEmail}</a>
                  </li>
                  <li>
                    <span className="sh-inquiry-label">WhatsApp</span>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sh-inquiry-phone"
                    >
                      {contact.phone}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sh-footer-socials">
              {footer.socialLinks.map((item) => (
                <a
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sh-footer-social-btn"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sh-footer-social-btn"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <p className="sh-footer-closing">{footer.closingStatement}</p>

        <div className="sh-footer-bottom">
          <span className="sh-footer-copyright">
            © {new Date().getFullYear()} {footer.copyrightSuffix}
          </span>
        </div>
      </div>
    </footer>
  );
}
