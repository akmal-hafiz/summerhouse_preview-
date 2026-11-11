import type { HistoryItem, MemberCoupon } from "@/lib/member-types";

// Display rules shared by the Coupons and Recent searches pages and the Overview lines.
// Values come from the member's own API responses; React escapes every string we return here.

export type { HistoryItem, MemberCoupon };

const BALI_TIME_ZONE = "Asia/Makassar";

function dayMonth(date: Date, timeZone?: string, withYear = false): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), ...(timeZone ? { timeZone } : {}) }).format(date);
}

/** "30 Nov", or "30 Nov 2027" outside the current year. The end instant is exclusive, so the last day is the moment before it. */
export function couponEndLabel(expiresAt: string, now = new Date()): string | null {
  const end = Date.parse(expiresAt);
  if (Number.isNaN(end)) return null;
  const lastMoment = new Date(end - 1);
  const year = (date: Date) => new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: BALI_TIME_ZONE }).format(date);
  return dayMonth(lastMoment, BALI_TIME_ZONE, year(lastMoment) !== year(now));
}

/** Soonest-ending first; offers without an end date last; then by name. */
export function sortCoupons(coupons: MemberCoupon[]): MemberCoupon[] {
  const endOf = (coupon: MemberCoupon) => {
    const time = coupon.expiresAt ? Date.parse(coupon.expiresAt) : Number.NaN;
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
  };
  return [...coupons].sort((a, b) => endOf(a) - endOf(b) || a.title.localeCompare(b.title));
}

const utcDate = (value: string) => new Date(`${value}T00:00:00Z`);

/** "12 to 15 Dec", "28 Dec to 2 Jan", or null when the entry has no dates. */
export function stayDatesLabel(item: Pick<HistoryItem, "checkIn" | "checkOut">): string | null {
  if (!item.checkIn || !item.checkOut) return null;
  const start = utcDate(item.checkIn);
  const end = utcDate(item.checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const sameMonth = start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();
  return sameMonth ? `${start.getUTCDate()} to ${dayMonth(end, "UTC")}` : `${dayMonth(start, "UTC")} to ${dayMonth(end, "UTC")}`;
}

export const guestsLabel = (guests: number) => `${guests} ${guests === 1 ? "guest" : "guests"}`;

/** The row title: "Canggu, 2 guests" for a search; the villa name for a view, or "Villa (no longer listed)" when the villa is not in the catalog. */
export function historyTitle(item: HistoryItem, villaNames: ReadonlyMap<string, string>): string {
  if (item.kind === "view") return (item.propertyId && villaNames.get(item.propertyId)) || "Villa (no longer listed)";
  const parts = [item.destination || "Any area"];
  if (item.guests !== undefined) parts.push(guestsLabel(item.guests));
  return parts.join(", ");
}

/** "IDR 1,200,000" for a recorded total. */
export function priceLabel(amount: number, currency: string): string {
  const digits = currency === "IDR" ? 0 : 2;
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** "3 Nov" in the member's own time zone. */
export function seenLabel(seenAt: string, now = new Date()): string {
  const seen = new Date(seenAt);
  return dayMonth(seen, undefined, seen.getFullYear() !== now.getFullYear());
}

export type HistoryGroup = "Today" | "This week" | "Earlier";

/** Rule: Today from local midnight; This week is the six calendar days before today; anything older is Earlier. */
export function historyGroup(seenAt: string, now = new Date()): HistoryGroup {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
  const seen = Date.parse(seenAt);
  if (seen >= startOfToday) return "Today";
  if (seen >= startOfWeek) return "This week";
  return "Earlier";
}

const isoToday = (now: Date) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

/** True when the recorded check-in is before today (local), so a repeat search cannot use those dates. */
export function stayDatesPassed(item: Pick<HistoryItem, "checkIn">, now = new Date()): boolean {
  return Boolean(item.checkIn && item.checkIn < isoToday(now));
}

/** The same /villas query VillaSearchForm builds. Dates that have already passed are left out so the search still runs. */
export function searchAgainHref(item: HistoryItem, now = new Date()): string {
  if (item.kind === "view") return item.propertyId ? `/villas/${encodeURIComponent(item.propertyId)}` : "/villas";
  const params = new URLSearchParams();
  if (item.destination) params.set("location", item.destination);
  if (item.checkIn && item.checkOut && !stayDatesPassed(item, now)) {
    params.set("checkIn", item.checkIn);
    params.set("checkOut", item.checkOut);
  }
  // History keeps one total guest count (adults plus children at search time). Searching again puts the whole party under
  // adults on purpose: the split is not stored, and the total is what decides which villas fit.
  params.set("adults", String(Math.min(40, Math.max(1, Math.floor(item.guests ?? 1)))));
  return `/villas?${params.toString()}`;
}

/** The Overview line for the newest entry: "Last search: Canggu, 12 to 15 Dec" or "Last viewed: Villa Name". */
export function latestHistoryLine(item: HistoryItem, villaNames: ReadonlyMap<string, string>): string {
  if (item.kind === "view") return `Last viewed: ${historyTitle(item, villaNames)}`;
  const parts = [item.destination, stayDatesLabel(item)].filter(Boolean) as string[];
  if (parts.length === 0 && item.guests !== undefined) parts.push(guestsLabel(item.guests));
  return `Last search: ${parts.join(", ") || "Any area"}`;
}
