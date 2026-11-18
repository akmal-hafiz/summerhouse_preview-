// The `?promo=` link param carries a member coupon code from the dashboard to a villa page, where it only prefills
// the promotion field. The rule matches the coupon code pattern the member backend enforces;
// it lives here so client and page code can use it without importing the CMS. Anything else is ignored, never echoed.
import { isValidDateRange } from "./date";
import { clampInteger } from "./security/validation";
import type { LastStay } from "./search-history-client";

export const PROMO_CODE_PATTERN = /^[A-Za-z0-9_-]{2,64}$/;

/** The first value of the param when it is a valid coupon code, otherwise an empty string. */
export function promoCodeFromParam(value: string | string[] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && PROMO_CODE_PATTERN.test(first) ? first : "";
}

/** Keeps a valid promo code on a /villas search query (replacing any earlier one); an invalid code adds nothing. */
export function withPromo(params: URLSearchParams, promo: string): URLSearchParams {
  const code = promoCodeFromParam(promo);
  if (code) params.set("promo", code);
  return params;
}

/** A villa page link that keeps a valid promo code and, when given, the stay being searched (so a sold-out first pick
 * does not cost the guest their dates on the next villa). */
export function villaHref(id: string | number, promo: string, stay?: LastStay | null): string {
  const query = withStay(withPromo(new URLSearchParams(), promo).toString(), stay ?? null);
  return query ? `/villas/${id}?${query}` : `/villas/${id}`;
}

/** A page query (`location.search`) with the stay replaced by `stay`, or removed when it is null; other params stay. */
export function withStay(search: string, stay: LastStay | null): string {
  const params = new URLSearchParams(search);
  for (const key of ["checkIn", "checkOut", "guests"]) params.delete(key);
  if (stay) {
    params.set("checkIn", stay.checkIn);
    params.set("checkOut", stay.checkOut);
    if (stay.guests) params.set("guests", String(stay.guests));
  }
  return params.toString();
}

/** The stay carried by a villa link: a valid date range and, when it is a number, guests clamped to 1-40. Past dates
 * pass here; the calendar drops them in the visitor's own time zone. */
export function stayFromParams(params: Record<string, string | string[] | undefined>): LastStay | null {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const checkIn = first(params.checkIn);
  const checkOut = first(params.checkOut);
  if (!isValidDateRange(checkIn, checkOut)) return null;
  const guests = Number(first(params.guests));
  return { checkIn: checkIn!, checkOut: checkOut!, ...(first(params.guests) && Number.isFinite(guests) ? { guests: clampInteger(guests, 1, 40, 1) } : {}) };
}

/** The villa collection link ("Reload", "Clear filters") that keeps a valid promo code and drops every filter. */
export function collectionHref(promo: string): string {
  const code = promoCodeFromParam(promo);
  return code ? `/villas?promo=${encodeURIComponent(code)}` : "/villas";
}

/** The valid promo code in a page query string (`location.search`), otherwise an empty string. */
export function promoFromSearch(search: string): string {
  return promoCodeFromParam(new URLSearchParams(search).get("promo") ?? undefined);
}
