import { safeHttpHref } from "@/lib/safe-url";

export const FOOTER_SETTING_KEYS = [
  "footer.newsletter_title",
  "footer.newsletter_description",
  "footer.newsletter_consent",
  "footer.closing_statement",
  "footer.stay_heading",
  "footer.stay_locations",
  "footer.owners_heading",
  "footer.owner_links",
  "footer.navigation_heading",
  "footer.navigation_links",
  "footer.inquiries_heading",
  "footer.social_links",
  "footer.copyright_suffix",
] as const;

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterLocation = {
  label: string;
  location: string;
};

export type FooterSettings = {
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterConsent: string;
  closingStatement: string;
  stayHeading: string;
  stayLocations: FooterLocation[];
  ownersHeading: string;
  ownerLinks: FooterLink[];
  navigationHeading: string;
  navigationLinks: FooterLink[];
  inquiriesHeading: string;
  socialLinks: FooterLink[];
  copyrightSuffix: string;
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  newsletterTitle: "Join Our Newsletter",
  newsletterDescription: "Occasional notes on Bali, new stays, and places worth knowing.",
  newsletterConsent: "I agree to receive occasional Summerhouse updates.",
  closingStatement: "Stay well. Know Bali better.",
  stayHeading: "Stay",
  stayLocations: [
    { label: "Canggu, Berawa", location: "Canggu - Berawa" },
    { label: "Canggu, Padonan", location: "Canggu - Padonan" },
    { label: "Pererenan", location: "Pererenan" },
    { label: "Ubud", location: "Ubud" },
  ],
  ownersHeading: "For Villa Owners",
  ownerLinks: [
    { label: "Property Management", href: "/services" },
    { label: "List Your Property", href: "/contact" },
  ],
  navigationHeading: "Navigation",
  navigationLinks: [
    { label: "About us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact us", href: "/contact" },
  ],
  inquiriesHeading: "Inquiries",
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/summerhouse.bali/" },
    { label: "Pinterest", href: "https://pin.it/3CgvbgIq5" },
  ],
  copyrightSuffix: "SUMMERHOUSE / ALL RIGHTS RESERVED",
};

type CmsSettingsRecord = Record<string, unknown>;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveLinks(value: unknown, fallback: FooterLink[]): FooterLink[] {
  if (!Array.isArray(value)) return fallback;

  const links = value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    const label = clean(record.label);
    const href = safeHttpHref(clean(record.href), "");
    return label && href ? [{ label, href }] : [];
  });

  return links.length ? links : fallback;
}

function resolveLocations(value: unknown): FooterLocation[] {
  if (!Array.isArray(value)) return DEFAULT_FOOTER_SETTINGS.stayLocations;

  const locations = value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    const location = clean(record.location);
    const label = clean(record.label) || location;
    return location ? [{ label, location }] : [];
  });

  return locations.length ? locations : DEFAULT_FOOTER_SETTINGS.stayLocations;
}

export function resolveFooterSettings(values?: CmsSettingsRecord | null): FooterSettings {
  const fallback = DEFAULT_FOOTER_SETTINGS;

  return {
    newsletterTitle: clean(values?.["footer.newsletter_title"]) || fallback.newsletterTitle,
    newsletterDescription:
      clean(values?.["footer.newsletter_description"]) || fallback.newsletterDescription,
    newsletterConsent:
      clean(values?.["footer.newsletter_consent"]) || fallback.newsletterConsent,
    closingStatement:
      clean(values?.["footer.closing_statement"]) || fallback.closingStatement,
    stayHeading: clean(values?.["footer.stay_heading"]) || fallback.stayHeading,
    stayLocations: resolveLocations(values?.["footer.stay_locations"]),
    ownersHeading: clean(values?.["footer.owners_heading"]) || fallback.ownersHeading,
    ownerLinks: resolveLinks(values?.["footer.owner_links"], fallback.ownerLinks),
    navigationHeading:
      clean(values?.["footer.navigation_heading"]) || fallback.navigationHeading,
    navigationLinks: resolveLinks(
      values?.["footer.navigation_links"],
      fallback.navigationLinks,
    ),
    inquiriesHeading:
      clean(values?.["footer.inquiries_heading"]) || fallback.inquiriesHeading,
    socialLinks: resolveLinks(values?.["footer.social_links"], fallback.socialLinks),
    copyrightSuffix:
      clean(values?.["footer.copyright_suffix"]) || fallback.copyrightSuffix,
  };
}
