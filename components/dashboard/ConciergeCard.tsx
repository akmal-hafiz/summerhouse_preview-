"use client";

import { FiArrowRight } from "react-icons/fi";
import { useGlobalContactSettings } from "@/hooks/useGlobalContactSettings";
import { buildEmailHref, buildPhoneHref, buildWhatsAppHref } from "@/lib/contact-settings";

export default function ConciergeCard() {
  const contact = useGlobalContactSettings();

  const href = buildWhatsAppHref(contact.whatsapp)
    || buildEmailHref(contact.reservationEmail)
    || buildPhoneHref(contact.phone);
  if (!href) return null;

  return (
    <section className="dash-concierge-card" aria-labelledby="dash-concierge-title">
      <img src="/homepage_villa/villaarta.webp" alt="Villa pool at dusk" loading="lazy" />
      <div className="dash-concierge-body">
        <h2 id="dash-concierge-title">Talk to our concierge</h2>
        <p>Need a hand choosing a villa? Our Bali team is here to help.</p>
        <a href={href} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}>
          Contact concierge <FiArrowRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
