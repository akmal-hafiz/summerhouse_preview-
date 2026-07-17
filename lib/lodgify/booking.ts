import type { LodgifyId } from "./types";

const DEFAULT_LODGIFY_CHECKOUT_URL = "https://checkout.lodgify.com/en/summerhouse--bali/{propertyId}/reservation?currency=EUR";
const WHATSAPP_FALLBACK_NUMBER = "62811388999";

function getCheckoutBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL
    || process.env.NEXT_PUBLIC_LODGIFY_CHECKOUT_BASE_URL
    || DEFAULT_LODGIFY_CHECKOUT_URL
  );
}

function toSafeHttpUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Invalid Lodgify checkout URL protocol.");
  }

  return url;
}

export function buildLodgifyCheckoutUrl({
  propertyId,
  checkIn,
  checkOut,
  guests,
}: {
  propertyId: LodgifyId;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  if (!propertyId) {
    throw new Error("Missing Lodgify property id.");
  }

  const safePropertyId = encodeURIComponent(String(propertyId));
  const baseUrl = getCheckoutBaseUrl()
    .replaceAll("{propertyId}", safePropertyId)
    .replaceAll(":propertyId", safePropertyId);
  const url = toSafeHttpUrl(baseUrl);

  if (!baseUrl.includes(safePropertyId) && /checkout\.lodgify\.com/i.test(url.hostname)) {
    const cleanPath = url.pathname.replace(/\/$/, "");
    const hasReservationPath = /\/reservation$/i.test(cleanPath);
    url.pathname = hasReservationPath
      ? cleanPath
      : `${cleanPath}/${safePropertyId}/reservation`;
  }

  url.searchParams.set("propertyId", String(propertyId));
  url.searchParams.set("property_id", String(propertyId));

  if (checkIn) {
    url.searchParams.set("checkIn", checkIn);
    url.searchParams.set("check_in", checkIn);
    url.searchParams.set("arrival", checkIn);
    url.searchParams.set("from", checkIn);
  }

  if (checkOut) {
    url.searchParams.set("checkOut", checkOut);
    url.searchParams.set("check_out", checkOut);
    url.searchParams.set("departure", checkOut);
    url.searchParams.set("to", checkOut);
  }

  if (guests) {
    url.searchParams.set("guests", String(guests));
    url.searchParams.set("adults", String(guests));
  }

  return url.toString();
}

export function getDirectBookingUrl(propertyId: LodgifyId) {
  return buildLodgifyCheckoutUrl({ propertyId });
}

export function buildBookingWhatsAppUrl({
  villaName,
  checkIn,
  checkOut,
  guests,
}: {
  villaName: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const message = [
    `Hello Summerhouses, I would like help booking ${villaName}.`,
    checkIn ? `Check-in: ${checkIn}` : "",
    checkOut ? `Check-out: ${checkOut}` : "",
    guests ? `Guests: ${guests}` : "",
  ].filter(Boolean).join("\n");

  const url = new URL(`https://wa.me/${WHATSAPP_FALLBACK_NUMBER}`);
  url.searchParams.set("text", message);
  return url.toString();
}
