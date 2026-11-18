import { sessionFetch } from "./auth-client";
import { addDays, formatISODate, isValidDateRange, nightsBetween, parseISODate } from "./date";
import type { HistoryItem, SearchEntry } from "./member-types";

export type { SearchEntry };
export type LastStay = { checkIn: string; checkOut: string; guests?: number };

/**
 * The dates a member most recently checked for one villa, when they are still ahead (today counts). `items` are newest
 * first, as the history endpoint lists them. Another villa's dates are never used.
 */
export function lastStayForVilla(items: HistoryItem[], propertyId: string, today: string = formatISODate(new Date())): LastStay | null {
  return latestStay(items.filter((item) => item.propertyId === propertyId), today);
}

/** The newest upcoming stay in any search or villa view: the trip being planned, used when this villa has none. */
export function latestStay(items: HistoryItem[], today: string = formatISODate(new Date())): LastStay | null {
  for (const item of items) {
    if (!item.checkIn || !item.checkOut || item.checkIn < today || !isValidDateRange(item.checkIn, item.checkOut)) continue;
    return { checkIn: item.checkIn, checkOut: item.checkOut, ...(item.guests ? { guests: item.guests } : {}) };
  }
  return null;
}

/**
 * The member's usual party and stay length: guests and nights from their newest search-box searches (past dates still
 * tell the length). Villa views are left out: the villa page records its default 1 guest even when nobody chose it.
 * shortcut: the habit lasts as long as the 7-day history; add two columns on the member account if the owner wants months.
 */
export function stayHabit(items: HistoryItem[]): { guests?: number; nights?: number } {
  const searches = items.filter((item) => item.kind === "search");
  // Both search forms record their default 1 guest even when nobody touched it, so 1 never replaces a real party;
  // a solo traveller loses nothing, as 1 is the sheet's default anyway.
  const guests = searches.find((item) => (item.guests ?? 0) > 1)?.guests;
  const dated = searches.find((item) => isValidDateRange(item.checkIn, item.checkOut));
  const nights = nightsBetween(dated?.checkIn, dated?.checkOut);
  return { ...(guests ? { guests } : {}), ...(nights ? { nights } : {}) };
}

/** The member's history, newest first. Only call it for a member session; any failure is an empty list. */
export async function loadHistory(signal?: AbortSignal): Promise<HistoryItem[]> {
  try {
    const response = await sessionFetch("search-history", { signal });
    if (!response.ok) return [];
    const data = await response.json() as { success?: boolean; items?: unknown };
    return data.success && Array.isArray(data.items) ? data.items as HistoryItem[] : [];
  } catch {
    return []; // History is a convenience.
  }
}

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
