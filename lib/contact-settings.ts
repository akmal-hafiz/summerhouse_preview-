export const GLOBAL_CONTACT_KEYS = [
  "contact.general_email",
  "contact.reservation_email",
  "contact.phone",
  "contact.whatsapp",
  "contact.address",
  "contact.response_time",
] as const;

export type GlobalContactSettings = {
  generalEmail: string;
  reservationEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  responseTime: string;
};

export const DEFAULT_GLOBAL_CONTACT: GlobalContactSettings = {
  generalEmail: "info@summerhousebali.com",
  reservationEmail: "reservation.summerhouse@gmail.com",
  phone: "+62 819 3238 7121",
  whatsapp: "+62 819 3238 7121",
  address: "Bali, Indonesia",
  responseTime: "Within 2 hours",
};

type CmsSettingsRecord = Record<string, unknown>;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveGlobalContactSettings(
  values?: CmsSettingsRecord | null,
): GlobalContactSettings {
  const phone = clean(values?.["contact.phone"]) || DEFAULT_GLOBAL_CONTACT.phone;

  return {
    generalEmail:
      clean(values?.["contact.general_email"])
      || clean(values?.["contact.email"])
      || DEFAULT_GLOBAL_CONTACT.generalEmail,
    reservationEmail:
      clean(values?.["contact.reservation_email"])
      || DEFAULT_GLOBAL_CONTACT.reservationEmail,
    phone,
    whatsapp: clean(values?.["contact.whatsapp"]) || phone,
    address: clean(values?.["contact.address"]) || DEFAULT_GLOBAL_CONTACT.address,
    responseTime:
      clean(values?.["contact.response_time"])
      || DEFAULT_GLOBAL_CONTACT.responseTime,
  };
}

export function buildWhatsAppHref(value: string, message?: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return "";

  const url = new URL(`https://wa.me/${digits}`);
  if (message?.trim()) url.searchParams.set("text", message.trim());
  return url.toString();
}

export function buildPhoneHref(value: string): string {
  const compact = value.replace(/[^\d+]/g, "");
  return compact.replace(/\D/g, "").length >= 8 ? `tel:${compact}` : "";
}

export function buildEmailHref(value: string): string {
  const email = value.trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
    ? `mailto:${email}`
    : "";
}
