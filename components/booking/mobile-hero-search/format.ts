import { monthNames, parseISODate } from "@/lib/date";
import type { Guests } from "./types";

/** "21 Nov": the visible date in both hero search forms. */
export function formatShortDate(iso: string) {
  const d = parseISODate(iso);
  return `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)}`;
}

/** "21 November 2026": the accessible name of a chosen or offered date. */
export function formatLongDate(iso: string) {
  const d = parseISODate(iso);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn) return "";
  if (!checkOut) return formatShortDate(checkIn);
  return `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`;
}

export function guestsLabel(g: Guests) {
  const total = g.adults + g.children;
  const parts = [`${total} ${total === 1 ? "guest" : "guests"}`];
  if (g.infants) parts.push(`${g.infants} infant${g.infants > 1 ? "s" : ""}`);
  if (g.pets) parts.push(`${g.pets} pet${g.pets > 1 ? "s" : ""}`);
  return parts.join(", ");
}
