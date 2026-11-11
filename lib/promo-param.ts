// The `?promo=` link param carries a member coupon code from the dashboard to a villa page, where it only prefills
// the promotion field. The rule matches the coupon code pattern the member backend enforces;
// it lives here so client and page code can use it without importing the CMS. Anything else is ignored, never echoed.
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

/** A villa page link that keeps a valid promo code. */
export function villaHref(id: string | number, promo: string): string {
  const code = promoCodeFromParam(promo);
  return code ? `/villas/${id}?promo=${encodeURIComponent(code)}` : `/villas/${id}`;
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
