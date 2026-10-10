import type { LodgifyId } from "./types";
import { validateStayRange } from "@/lib/security/validation";

const DEFAULT_LODGIFY_CHECKOUT_URL = "https://checkout.lodgify.com/en/summerhouse--bali/{propertyId}/reservation";
const WHATSAPP_FALLBACK_NUMBER = "6281932387121";

function getCheckoutBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_LODGIFY_BOOKING_BASE_URL
    || process.env.NEXT_PUBLIC_LODGIFY_CHECKOUT_BASE_URL
    || DEFAULT_LODGIFY_CHECKOUT_URL
  );
}

function toSafeHttpUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" || url.hostname !== "checkout.lodgify.com" || url.port || url.username || url.password || url.hash) {
    throw new Error("Invalid checkout destination.");
  }

  if ([...url.searchParams.keys()].some((key) => key !== "currency")) throw new Error("Unexpected checkout parameter.");
  // The checkout determines currency for the selected villa; a fixed URL currency can conflict with the site label.
  url.searchParams.delete("currency");

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
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(String(propertyId))) throw new Error("Invalid villa id.");
  if (Boolean(checkIn) !== Boolean(checkOut) || (checkIn && checkOut && !validateStayRange(checkIn, checkOut, 90))) {
    throw new Error("Invalid stay dates.");
  }
  if (guests !== undefined && (!Number.isInteger(guests) || guests < 1 || guests > 40)) throw new Error("Invalid guest count.");

  const safePropertyId = encodeURIComponent(String(propertyId));
  const baseUrl = getCheckoutBaseUrl()
    .replaceAll("{propertyId}", safePropertyId)
    .replaceAll(":propertyId", safePropertyId);
  const url = toSafeHttpUrl(baseUrl);

  if (!baseUrl.includes(safePropertyId)) {
    const cleanPath = url.pathname.replace(/\/$/, "");
    const hasReservationPath = /\/reservation$/i.test(cleanPath);
    url.pathname = hasReservationPath
      ? cleanPath
      : `${cleanPath}/${safePropertyId}/reservation`;
  }

  if (!url.pathname.endsWith(`/${safePropertyId}/reservation`)) throw new Error("Invalid checkout villa path.");

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
  whatsappNumber,
}: {
  villaName: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  whatsappNumber?: string;
}) {
  const message = [
    `Hello Summerhouses, I would like help booking ${villaName}.`,
    checkIn ? `Check-in: ${checkIn}` : "",
    checkOut ? `Check-out: ${checkOut}` : "",
    guests ? `Guests: ${guests}` : "",
  ].filter(Boolean).join("\n");

  const digits = (whatsappNumber || WHATSAPP_FALLBACK_NUMBER).replace(/\D/g, "");
  const url = new URL(`https://wa.me/${digits.length >= 8 ? digits : WHATSAPP_FALLBACK_NUMBER}`);
  url.searchParams.set("text", message);
  return url.toString();
}
