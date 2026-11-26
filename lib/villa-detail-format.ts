import { monthNames } from "@/lib/date";
import type { VillaSearchResult, VillaSummary } from "@/lib/lodgify/types";
import { sanitizeHtml } from "@/lib/sanitize";

const fullDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type CalendarDayStatus = "available" | "booked" | "blocked" | "unavailable" | "unknown";

export type CalendarDayAriaFlags = {
  isSelectedStart?: boolean;
  isSelectedEnd?: boolean;
  isInRange?: boolean;
  isDisabled?: boolean;
};

const REAL_HTML_TAG = /<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/gi;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&mdash;|&#8212;|&#x2014;/gi, "\u2014")
    .replace(/&ndash;|&#8211;|&#x2013;/gi, "-")
    .replace(/&rsquo;|&#8217;|&#x2019;/gi, "\u2019")
    .replace(/&lsquo;|&#8216;|&#x2018;/gi, "\u2018")
    .replace(/&rdquo;|&#8221;|&#x201d;/gi, "\u201d")
    .replace(/&ldquo;|&#8220;|&#x201c;/gi, "\u201c")
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&apos;|&#0*39;|&#x27;/gi, "'")
    .replace(/&lt;|&#60;|&#x3c;/gi, "<")
    .replace(/&gt;|&#62;|&#x3e;/gi, ">")
    .replace(/&amp;|&#38;|&#x26;/gi, "&");
}

function stripEmDashes(value: string): string {
  return value.replace(/\s*\u2014\s*/g, " - ");
}

function toPlainLineText(raw: string): string {
  const withoutTags = raw.replace(REAL_HTML_TAG, "");
  return stripEmDashes(decodeHtmlEntities(withoutTags)).replace(/\s+/g, " ").trim();
}

export function formatVillaDescriptionHtml(html: string): string {
  if (!html) return "";

  const normalizedTags = html.replace(REAL_HTML_TAG, (tag) => tag.replace(/\r?\n/g, " "));
  const withLineMarkers = normalizedTags.replace(/\r?\n/g, "<br />");

  const cleaned = sanitizeHtml(withLineMarkers)
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(?:p|li|div|h[1-6])>/gi, "\n\n")
    .replace(/<(?:p|ul|ol|div|h[1-6])\b[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");

  const rawLines = cleaned.split("\n");
  let result = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      result += "</ul>\n";
      inList = false;
    }
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const plainText = toPlainLineText(trimmed);
    if (!plainText) continue;

    const bracketMatch = plainText.match(/^\[([^\]]{2,60})\]\s*(.*)$/);
    if (bracketMatch) {
      const heading = bracketMatch[1].trim();
      const rest = bracketMatch[2].trim();
      closeList();
      result += `<h3 class="description-heading">${escapeHtml(heading)}</h3>\n`;
      if (rest) {
        result += `<p>${escapeHtml(rest)}</p>\n`;
      }
      continue;
    }

    const cleanTextForCheck = plainText
      .replace(/^[-*•·\u2014\s]+/, "")
      .replace(/[-*•·\u2014\s]+$/, "")
      .trim();

    const isHeading =
      (cleanTextForCheck.length > 3 &&
        cleanTextForCheck === cleanTextForCheck.toUpperCase() &&
        !/^\d+$/.test(cleanTextForCheck)) ||
      /^(?:The Space|Layout|Neighborhood|Details To Note|Entire Place Use|Rules|Amenities|Getting around|For coffee & slow mornings|For dining|For movement & wellness|For the Beach|Shops & essentials|Guest access|Other things to note|About the property):?$/i.test(
        cleanTextForCheck,
      ) ||
      /^\d+\.\s+[A-Za-z]/i.test(cleanTextForCheck) ||
      /^(?:<strong>|<b>)(.*?)(?:<\/strong>|<\/b>):?$/i.test(trimmed);

    const isListItem =
      !isHeading &&
      (plainText.startsWith("-") ||
        plainText.startsWith("*") ||
        plainText.startsWith("•") ||
        plainText.startsWith("·"));

    if (isHeading) {
      closeList();
      result += `<h3 class="description-heading">${escapeHtml(cleanTextForCheck)}</h3>\n`;
    } else if (isListItem) {
      const content = plainText.replace(/^[-*•·\s]+/, "").trim();
      if (!content) continue;
      if (!inList) {
        result += `<ul class="description-list">\n`;
        inList = true;
      }
      if (content.endsWith(":")) {
        result += `  <li class="description-list-heading"><strong>${escapeHtml(content)}</strong></li>\n`;
      } else {
        result += `  <li>${escapeHtml(content)}</li>\n`;
      }
    } else {
      closeList();
      result += `<p>${escapeHtml(plainText)}</p>\n`;
    }
  }

  closeList();

  return result;
}

export function formatAmenityName(name: string): string {
  if (!name) return "";
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();
}

export function formatBedroomLabel(bedrooms: number): string {
  return `${bedrooms} ${bedrooms === 1 ? "bed" : "beds"}`;
}

export function buildGoogleMapsExternalUrl(mapQuery: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
}

export function isMonthBeforeToday(month: Date, todayMonth: Date): boolean {
  const monthIndex = month.getFullYear() * 12 + month.getMonth();
  const todayIndex = todayMonth.getFullYear() * 12 + todayMonth.getMonth();
  return monthIndex < todayIndex;
}

export function formatCalendarDayAriaLabel(
  date: Date,
  status: CalendarDayStatus,
  flags: CalendarDayAriaFlags = {},
): string {
  const baseDate = `${fullDayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  const notes: string[] = [];

  if (flags.isSelectedStart) {
    notes.push("selected check-in");
  } else if (flags.isSelectedEnd) {
    notes.push("selected check-out");
  } else if (flags.isInRange) {
    notes.push("in selected range");
  }

  const isUnavailableStatus = status === "unavailable" || status === "booked" || status === "blocked";
  if (flags.isDisabled === false && isUnavailableStatus) {
    if (!flags.isSelectedEnd) {
      notes.push("available for check-out");
    }
  } else if (flags.isDisabled || isUnavailableStatus) {
    notes.push("unavailable");
  } else if (status === "available") {
    notes.push("available");
  }

  return notes.length > 0 ? `${baseDate}, ${notes.join(", ")}` : baseDate;
}

export type AmenityHighlight = {
  groupKey: string;
  groupTitle: string;
  item: string;
};

const AMENITY_GROUP_PRIORITY = [
  "internet",
  "heating",
  "outdoor",
  "sleeping",
  "kitchen",
  "bathroom",
  "parking",
] as const;

function amenityGroupRank(groupKey: string): number {
  const normalized = groupKey.toLowerCase();
  const match = AMENITY_GROUP_PRIORITY.findIndex((token) => normalized.includes(token));
  return match === -1 ? AMENITY_GROUP_PRIORITY.length : match;
}

export function selectAmenityHighlights(
  groups: ReadonlyArray<{ key: string; title: string; items: string[] }>,
  limit = 10,
): AmenityHighlight[] {
  if (limit <= 0 || groups.length === 0) return [];

  const orderedGroups = groups
    .map((group, index) => ({ group, index }))
    .sort((a, b) => {
      const aRank = amenityGroupRank(a.group.key);
      const bRank = amenityGroupRank(b.group.key);
      return aRank !== bRank ? aRank - bRank : a.index - b.index;
    })
    .map(({ group }) => group);

  const cursors = orderedGroups.map(() => 0);
  const seen = new Set<string>();
  const result: AmenityHighlight[] = [];

  while (result.length < limit) {
    let addedInPass = false;

    for (let groupIndex = 0; groupIndex < orderedGroups.length && result.length < limit; groupIndex += 1) {
      const group = orderedGroups[groupIndex];
      while (cursors[groupIndex] < group.items.length) {
        const rawItem = group.items[cursors[groupIndex]];
        cursors[groupIndex] += 1;
        const normalized = formatAmenityName(rawItem).toLowerCase();
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push({
          groupKey: group.key,
          groupTitle: group.title,
          item: rawItem,
        });
        addedInPass = true;
        break;
      }
    }

    if (!addedInPass) break;
  }

  return result;
}

// Parts of a place name ("Jl. Pantai Berawa 12, Canggu, Bali" -> "jl. pantai berawa 12", "canggu"). Island and country
// names are dropped: every villa shares them, so they would make every villa "nearby".
const SHARED_PLACE_NAMES = new Set(["bali", "indonesia"]);
function areaParts(value: string): string[] {
  return value
    .split(/[-,]/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part && !SHARED_PLACE_NAMES.has(part));
}

export function selectNearbyVillas(
  summaries: ReadonlyArray<VillaSummary>,
  currentId: string | number,
  currentArea: string,
  limit = 3,
): VillaSearchResult[] {
  if (limit <= 0 || summaries.length === 0) return [];

  const excludedId = String(currentId);
  const targetParts = new Set(areaParts(currentArea));
  const sameArea: VillaSummary[] = [];
  const otherAreas: VillaSummary[] = [];

  for (const summary of summaries) {
    if (String(summary.id) === excludedId) continue;
    if (areaParts(summary.location).some((part) => targetParts.has(part))) {
      sameArea.push(summary);
    } else {
      otherAreas.push(summary);
    }
  }

  return [...sameArea, ...otherAreas].slice(0, limit).map((summary) => ({
    ...summary,
    name: summary.name.split("|")[0]?.trim() || summary.name,
    capacity: summary.guests ?? 0,
    amenitiesPreview: [],
    rating: 0,
    isAvailableForSearch: true,
    availabilityStatus: "unknown",
    availabilityReason: "not_checked",
  }));
}

export function isLongReviewText(text: string, threshold = 280): boolean {
  return text.trim().length > threshold;
}

const DEFAULT_GUEST_LIMIT = 12;
const MAX_GUEST_LIMIT = 20;

/** The guest limit the booking controls offer: the villa's capacity (1-20), or 12 when Lodgify sent none. */
export function normalizeGuestLimit(maxGuests?: number | null): number {
  if (typeof maxGuests !== "number" || !Number.isFinite(maxGuests) || maxGuests < 1) return DEFAULT_GUEST_LIMIT;
  return Math.min(MAX_GUEST_LIMIT, Math.trunc(maxGuests));
}

/** One guest count for every booking control, link and request: at least 1, at most the villa's limit. */
export function clampGuestCount(guests: number | null | undefined, maxGuests?: number | null): number {
  const count = typeof guests === "number" && Number.isFinite(guests) ? Math.trunc(guests) : 1;
  return Math.max(1, Math.min(count, normalizeGuestLimit(maxGuests)));
}

export function formatGuestCountLabel(guests: number): string {
  const count = Number.isFinite(guests) ? Math.max(1, Math.trunc(guests)) : 1;
  return `${count} ${count === 1 ? "guest" : "guests"}`;
}

/** The one day in a month that Tab reaches: the first preferred date that is enabled, else the month's first enabled day. */
export function resolveCalendarTabStopDate(
  enabledDates: ReadonlyArray<string>,
  preferred: ReadonlyArray<string | null | undefined>,
): string | null {
  if (enabledDates.length === 0) return null;
  const enabled = new Set(enabledDates);
  return preferred.find((date): date is string => Boolean(date) && enabled.has(date as string)) ?? enabledDates[0];
}
