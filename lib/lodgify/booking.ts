import type { LodgifyId } from "./types";

const DEFAULT_LODGIFY_CHECKOUT_URL = "https://lodgify.com/v2/direct-booking";

function getCheckoutBaseUrl() {
  return process.env.NEXT_PUBLIC_LODGIFY_CHECKOUT_BASE_URL || DEFAULT_LODGIFY_CHECKOUT_URL;
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
  const url = new URL(getCheckoutBaseUrl());
  url.searchParams.set("propertyId", String(propertyId));

  if (checkIn) {
    url.searchParams.set("checkIn", checkIn);
    url.searchParams.set("check_in", checkIn);
    url.searchParams.set("arrival", checkIn);
  }

  if (checkOut) {
    url.searchParams.set("checkOut", checkOut);
    url.searchParams.set("check_out", checkOut);
    url.searchParams.set("departure", checkOut);
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
