import { monthNames, parseISODate } from "@/lib/date";
import type { Guests } from "./types";

export function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn) return "";
  const short = (iso: string) => {
    const d = parseISODate(iso);
    return `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)}`;
  };
  if (!checkOut) return short(checkIn);
  return `${short(checkIn)} - ${short(checkOut)}`;
}

export function guestsLabel(g: Guests) {
  const total = g.adults + g.children;
  const parts = [`${total} ${total === 1 ? "guest" : "guests"}`];
  if (g.infants) parts.push(`${g.infants} infant${g.infants > 1 ? "s" : ""}`);
  if (g.pets) parts.push(`${g.pets} pet${g.pets > 1 ? "s" : ""}`);
  return parts.join(", ");
}
