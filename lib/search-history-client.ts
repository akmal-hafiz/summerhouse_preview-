import { sessionFetch } from "./auth-client";
import { addDays, formatISODate, isValidDateRange, parseISODate } from "./date";
import type { SearchEntry } from "./member-types";

export type { SearchEntry };

/**
 * Builds the history entry for a submitted villa search, shared by every search form so the rule lives once.
 * Returns null when there is nothing worth recording. Dates count only as a complete, ordered range that does not start
 * before yesterday (the server allows one day of slack too), so stale dates never cost the destination and guests.
 * Guests are clamped to 1-40. `today` is the browser's local date.
 */
export function searchEntryFromParams(params: { location?: string; checkIn?: string; checkOut?: string; guests?: number },
  today: string = formatISODate(new Date())): SearchEntry | null {
  const entry: SearchEntry = { kind: "search" };
  const destination = params.location?.trim();
  if (destination) entry.destination = destination;
  const earliest = formatISODate(addDays(parseISODate(today), -1));
  if (isValidDateRange(params.checkIn, params.checkOut) && params.checkIn! >= earliest) {
    entry.checkIn = params.checkIn;
    entry.checkOut = params.checkOut;
  }
  if (typeof params.guests === "number" && Number.isFinite(params.guests)) entry.guests = Math.min(40, Math.max(1, Math.floor(params.guests)));
  return entry.destination || entry.checkIn || entry.guests !== undefined ? entry : null;
}

/**
 * Records a search or villa view for a signed-in member. `isMember` is true only for a member session: guests and CMS
 * admins (who have no member session) send nothing.
 * Guests store nothing: no request, no localStorage, no sessionStorage, no cookie. Failures are never surfaced.
 */
export async function recordSearch(entry: SearchEntry, isMember: boolean): Promise<void> {
  if (!isMember) return;
  try {
    await sessionFetch("search-history", { method: "POST", body: JSON.stringify(entry) });
  } catch {
    // History is a convenience; a failed write must never affect the search or the page.
  }
}
