"use client";

import { useEffect, useState } from "react";
import { FiMail, FiPhone, FiArrowUpRight, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

type ConciergeSettings = {
  "concierge.subtitle"?: string | null;
  "concierge.hours"?: string | null;
  "concierge.whatsapp"?: string | null;
  "concierge.whatsapp_label"?: string | null;
  "concierge.phone"?: string | null;
  "concierge.phone_label"?: string | null;
  "concierge.email"?: string | null;
  "concierge.email_label"?: string | null;
};

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

const SETTING_KEYS = [
  "concierge.subtitle",
  "concierge.hours",
  "concierge.whatsapp",
  "concierge.whatsapp_label",
  "concierge.phone",
  "concierge.phone_label",
  "concierge.email",
  "concierge.email_label",
].join(",");

const DEFAULT_SUBTITLE = "Tim Bali kami siap bantu pilih villa, cek ketersediaan, atau atur jadwal kunjungan.";

function buildWhatsappUrl(rawNumber: string): string {
  const digits = rawNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function buildTelUrl(rawNumber: string): string {
  const cleaned = rawNumber.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export default function ConciergeCard() {
  const [settings, setSettings] = useState<ConciergeSettings | null>(null);

  useEffect(() => {
    let abort = false;
    fetch(`${CMS_BASE_URL}/v1/cms/settings?keys=${SETTING_KEYS}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (abort || !data?.success) return;
        setSettings(data.settings || {});
      })
      .catch(() => undefined);
    return () => { abort = true; };
  }, []);

  const subtitle = settings?.["concierge.subtitle"] || DEFAULT_SUBTITLE;
  const hours = settings?.["concierge.hours"];
  const wa = settings?.["concierge.whatsapp"];
  const waLabel = settings?.["concierge.whatsapp_label"] ?? "WhatsApp";
  const phone = settings?.["concierge.phone"];
  const phoneLabel = settings?.["concierge.phone_label"] ?? "Telepon";
  const email = settings?.["concierge.email"];
  const emailLabel = settings?.["concierge.email_label"] ?? "Email";

  if (!wa && !email && !phone && settings !== null) {
    return null;
  }

  return (
    <div className="dash-rail-card">
      <div className="dash-rail-card-head">
        <h3>Tanya concierge</h3>
      </div>
      <div className="dash-concierge">
        <p className="dash-concierge-copy">{subtitle}</p>

        {hours && (
          <p className="dash-concierge-hours">
            <FiClock aria-hidden="true" />
            <span>{hours}</span>
          </p>
        )}

        <div className="dash-concierge-links">
          {wa && (
            <a
              href={buildWhatsappUrl(wa)}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-concierge-link"
            >
              <span className="dash-concierge-icon"><FaWhatsapp aria-hidden="true" /></span>
              <span>{waLabel}</span>
              <span className="dash-concierge-arrow"><FiArrowUpRight aria-hidden="true" /></span>
            </a>
          )}
          {phone && (
            <a
              href={buildTelUrl(phone)}
              className="dash-concierge-link"
            >
              <span className="dash-concierge-icon"><FiPhone aria-hidden="true" /></span>
              <span>{phoneLabel}</span>
              <span className="dash-concierge-arrow"><FiArrowUpRight aria-hidden="true" /></span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="dash-concierge-link"
            >
              <span className="dash-concierge-icon"><FiMail aria-hidden="true" /></span>
              <span>{emailLabel}</span>
              <span className="dash-concierge-arrow"><FiArrowUpRight aria-hidden="true" /></span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
