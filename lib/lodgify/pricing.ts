import { eachNightInRange, isValidDateRange } from "@/lib/date";
import { asNumber, asRecordArray, isRecord } from "./runtime";
import { fetchPropertyById, fetchPropertyRooms, fetchRateCalendar } from "./client";
import { formatPrice, getPrimaryRoomTypeId } from "./normalizers";
import type { LodgifyId, LodgifyProperty, LodgifyRateQuote, LodgifyRateResult, LodgifyStayRestriction } from "./types";

function pickPriceRule(prices: unknown[] = [], nights: number) {
  return asRecordArray(prices).find((price) => {
    const minStay = price.min_stay == null ? 1 : asNumber(price.min_stay, NaN);
    const maxStay = price.max_stay == null ? 9999 : asNumber(price.max_stay, NaN);
    return Number.isInteger(minStay) && Number.isInteger(maxStay)
      && minStay >= 1 && maxStay >= minStay && nights >= minStay && nights <= maxStay;
  }) || null;
}

/** Preserve known stay restrictions without inventing a rate when no rule matches. */
export function getStayRestrictionFromCalendar(calendar: unknown, checkIn: string, checkOut: string): LodgifyStayRestriction | null {
  if (!isRecord(calendar) || !isValidDateRange(checkIn, checkOut)) return null;
  const nights = eachNightInRange(checkIn, checkOut);
  if (nights.length < 1 || nights.length > 90) return null;
  const items = asRecordArray(calendar.calendar_items);
  const defaults = items.filter((item) => item.is_default === true);
  if (defaults.length > 1) return null;
  const byDate = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    if (typeof item.date !== "string") continue;
    if (byDate.has(item.date)) return null;
    byDate.set(item.date, item);
  }

  let minimum = 1;
  let maximum = 9999;
  for (const date of nights) {
    const item = byDate.get(date) || defaults[0];
    const rules = asRecordArray(item?.prices).filter((rule) => {
      const min = rule.min_stay == null ? 1 : asNumber(rule.min_stay, NaN);
      const max = rule.max_stay == null ? 9999 : asNumber(rule.max_stay, NaN);
      const rate = asNumber(rule.price_per_day, NaN);
      return Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max >= min && Number.isFinite(rate) && rate > 0;
    });
    if (!rules.length) return null;
    minimum = Math.max(minimum, Math.min(...rules.map((rule) => rule.min_stay == null ? 1 : asNumber(rule.min_stay))));
    maximum = Math.min(maximum, Math.max(...rules.map((rule) => rule.max_stay == null ? 9999 : asNumber(rule.max_stay))));
  }

  if (minimum > maximum) return null;
  if (nights.length < minimum) return {
    success: true,
    isMinimumStayValid: false,
    minStay: minimum,
    maxStay: maximum === 9999 ? null : maximum,
    message: `This villa requires at least ${minimum} nights for these dates.`,
  };
  if (nights.length > maximum) return {
    success: true,
    isMinimumStayValid: false,
    minStay: minimum === 1 ? null : minimum,
    maxStay: maximum,
    message: `This villa allows up to ${maximum} nights for these dates.`,
  };
  return null;
}

/** A calendar rate is only an accommodation subtotal, never a checkout total. */
export function buildRateQuoteFromCalendar({
  property,
  calendar,
  propertyId,
  roomTypeId,
  checkIn,
  checkOut,
  guests,
}: {
  property: LodgifyProperty;
  calendar: unknown;
  propertyId: LodgifyId;
  roomTypeId: LodgifyId;
  checkIn: string;
  checkOut: string;
  guests: number;
}): LodgifyRateQuote | null {
  if (!isValidDateRange(checkIn, checkOut) || !isRecord(calendar) || !Number.isInteger(guests) || guests < 1 || guests > 40) return null;
  const nights = eachNightInRange(checkIn, checkOut);
  if (nights.length < 1 || nights.length > 90) return null;

  const currencyCode = property.currency_code;
  if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) return null;

  const calendarItems = asRecordArray(calendar.calendar_items);
  const defaults = calendarItems.filter((item) => item.is_default === true);
  if (defaults.length > 1) return null;
  const defaultItem = defaults[0];
  const itemsByDate = new Map<string, (typeof calendarItems)[number]>();
  for (const item of calendarItems) {
    if (typeof item.date !== "string") continue;
    if (itemsByDate.has(item.date)) return null;
    itemsByDate.set(item.date, item);
  }

  const breakdown: LodgifyRateQuote["breakdown"] = [];
  for (const date of nights) {
    const item = itemsByDate.get(date) || defaultItem;
    const rule = pickPriceRule(Array.isArray(item?.prices) ? item.prices : [], nights.length);
    if (!rule) return null;
    const baseRate = asNumber(rule.price_per_day, NaN);
    if (!Number.isFinite(baseRate) || baseRate <= 0) return null;

    const hasAdditionalRate = rule.price_per_additional_guest != null;
    const hasAdditionalThreshold = rule.additional_guests_starts_from != null;
    if (hasAdditionalRate !== hasAdditionalThreshold) return null;
    const additionalGuestRate = hasAdditionalRate ? asNumber(rule.price_per_additional_guest, NaN) : 0;
    const additionalGuestsStartFrom = hasAdditionalThreshold ? asNumber(rule.additional_guests_starts_from, NaN) : 0;
    if (!Number.isFinite(additionalGuestRate) || additionalGuestRate < 0
      || !Number.isInteger(additionalGuestsStartFrom) || additionalGuestsStartFrom < 0) return null;
    const additionalGuests = hasAdditionalThreshold ? Math.max(0, guests - additionalGuestsStartFrom) : 0;
    const totalRate = baseRate + additionalGuests * additionalGuestRate;
    if (!Number.isFinite(totalRate) || totalRate <= 0) return null;

    breakdown.push({
      date,
      baseRate,
      additionalGuestRate,
      additionalGuests,
      totalRate,
      minStay: rule.min_stay == null ? null : asNumber(rule.min_stay),
      maxStay: rule.max_stay == null ? null : asNumber(rule.max_stay),
    });
  }

  const nightlySubtotal = breakdown.reduce((sum, item) => sum + item.baseRate, 0);
  const additionalGuestSubtotal = breakdown.reduce((sum, item) => sum + item.additionalGuestRate * item.additionalGuests, 0);
  const total = nightlySubtotal + additionalGuestSubtotal;
  if (!Number.isSafeInteger(Math.round(total)) || total <= 0) return null;
  const minStayValues = breakdown.map((item) => item.minStay).filter((value): value is number => value !== null);
  const maxStayValues = breakdown.map((item) => item.maxStay).filter((value): value is number => value !== null);
  const minStay = minStayValues.length ? Math.max(...minStayValues) : null;
  const maxStay = maxStayValues.length ? Math.min(...maxStayValues) : null;

  try {
    return {
      success: true,
      source: "lodgify-rates-calendar",
      propertyId,
      roomTypeId,
      checkIn,
      checkOut,
      guests,
      nights: nights.length,
      currencyCode,
      nightlySubtotal,
      additionalGuestSubtotal,
      total,
      totalLabel: formatPrice(total, currencyCode),
      averageNightlyLabel: formatPrice(total / nights.length, currencyCode),
      minStay,
      maxStay,
      isMinimumStayValid: true,
      message: "Accommodation rate only. Review the final price and any fees before confirming.",
      breakdown,
    };
  } catch {
    return null;
  }
}

export async function getRateQuoteForProperty({
  propertyId,
  roomTypeId,
  checkIn,
  checkOut,
  guests = 1,
}: {
  propertyId: LodgifyId;
  roomTypeId?: LodgifyId | null;
  checkIn: string;
  checkOut: string;
  guests?: number;
}): Promise<LodgifyRateResult | null> {
  if (!isValidDateRange(checkIn, checkOut) || !Number.isInteger(guests) || guests < 1 || guests > 40) return null;

  const [property, rooms] = await Promise.all([
    fetchPropertyById(propertyId),
    fetchPropertyRooms(propertyId),
  ]);

  if (!property) return null;

  const selectedRoomTypeId = roomTypeId || getPrimaryRoomTypeId(rooms);
  const selectedRoom = rooms.find((room) => String(room.id) === String(selectedRoomTypeId));
  if (!selectedRoomTypeId || !selectedRoom) return null;
  const capacities = [property.max_people, property.max_guests, selectedRoom.max_people]
    .filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value > 0);
  if (capacities.length && guests > Math.min(...capacities)) return null;

  const nights = eachNightInRange(checkIn, checkOut);
  if (nights.length < 1 || nights.length > 90) return null;
  const endNight = nights[nights.length - 1];

  const params = new URLSearchParams({
    houseId: String(propertyId),
    roomTypeId: String(selectedRoomTypeId),
    startDate: checkIn,
    endDate: endNight,
  });

  const data = await fetchRateCalendar(params);
  return buildRateQuoteFromCalendar({ property, calendar: data, propertyId, roomTypeId: selectedRoomTypeId, checkIn, checkOut, guests })
    || getStayRestrictionFromCalendar(data, checkIn, checkOut);
}
