import { eachNightInRange, isValidDateRange } from "@/lib/date";
import { asNumber, asRecordArray, isRecord } from "./runtime";
import { fetchPropertyById, fetchPropertyRooms, fetchRateCalendar } from "./client";
import { formatPrice, getPrimaryRoomTypeId } from "./normalizers";
import type { LodgifyId, LodgifyRateQuote } from "./types";

function pickPriceRule(prices: unknown[] = [], nights: number) {
  return asRecordArray(prices).find((price) => {
    const minStay = asNumber(price.min_stay, 1);
    const maxStay = asNumber(price.max_stay, 9999);
    return nights >= minStay && nights <= maxStay;
  }) || asRecordArray(prices)[0] || null;
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
}): Promise<LodgifyRateQuote | null> {
  if (!isValidDateRange(checkIn, checkOut)) return null;

  const [property, rooms] = await Promise.all([
    fetchPropertyById(propertyId),
    roomTypeId ? Promise.resolve([]) : fetchPropertyRooms(propertyId),
  ]);

  if (!property) return null;

  const selectedRoomTypeId = roomTypeId || getPrimaryRoomTypeId(rooms);
  if (!selectedRoomTypeId) return null;

  const nights = eachNightInRange(checkIn, checkOut);
  const endNight = nights[nights.length - 1];
  const guestCount = Math.max(1, Number(guests || 1));
  const currencyCode = property.currency_code || "IDR";

  const params = new URLSearchParams({
    houseId: String(propertyId),
    roomTypeId: String(selectedRoomTypeId),
    startDate: checkIn,
    endDate: endNight,
  });

  const data = await fetchRateCalendar(params);
  if (!isRecord(data)) return null;

  const calendarItems = asRecordArray(data.calendar_items);
  const defaultItem = calendarItems.find((item) => Boolean(item.is_default));
  const itemsByDate = new Map(
    calendarItems
      .filter((item) => typeof item.date === "string")
      .map((item) => [String(item.date), item])
  );

  const breakdown = nights.map((date) => {
    const item = itemsByDate.get(date) || defaultItem || {};
    const rule = pickPriceRule(Array.isArray(item.prices) ? item.prices : [], nights.length);
    const baseRate = asNumber(rule?.price_per_day);
    const additionalGuestRate = asNumber(rule?.price_per_additional_guest);
    const additionalGuestsStartFrom = asNumber(rule?.additional_guests_starts_from);
    const additionalGuests = additionalGuestRate > 0 && additionalGuestsStartFrom > 0
      ? Math.max(0, guestCount - additionalGuestsStartFrom)
      : 0;
    const additionalGuestTotal = additionalGuests * additionalGuestRate;

    return {
      date,
      baseRate,
      additionalGuestRate,
      additionalGuests,
      totalRate: baseRate + additionalGuestTotal,
      minStay: Number.isFinite(asNumber(rule?.min_stay, NaN)) ? asNumber(rule?.min_stay) : null,
      maxStay: Number.isFinite(asNumber(rule?.max_stay, NaN)) ? asNumber(rule?.max_stay) : null,
    };
  });

  const nightlySubtotal = breakdown.reduce((total, item) => total + item.baseRate, 0);
  const additionalGuestSubtotal = breakdown.reduce(
    (total, item) => total + (item.additionalGuestRate * item.additionalGuests),
    0
  );
  const total = breakdown.reduce((sum, item) => sum + item.totalRate, 0);
  const minStayValues = breakdown.map((item) => item.minStay).filter((value): value is number => Boolean(value));
  const maxStayValues = breakdown.map((item) => item.maxStay).filter((value): value is number => Boolean(value));
  const minStay = minStayValues.length ? Math.max(...minStayValues) : null;
  const maxStay = maxStayValues.length ? Math.min(...maxStayValues) : null;
  const isMinimumStayValid = minStay ? nights.length >= minStay : true;

  return {
    success: true,
    source: "lodgify-rates-calendar",
    propertyId,
    roomTypeId: selectedRoomTypeId,
    checkIn,
    checkOut,
    guests: guestCount,
    nights: nights.length,
    currencyCode,
    nightlySubtotal,
    additionalGuestSubtotal,
    total,
    totalLabel: formatPrice(total, currencyCode),
    averageNightlyLabel: formatPrice(total / Math.max(1, nights.length), currencyCode),
    minStay,
    maxStay,
    isMinimumStayValid,
    message: isMinimumStayValid
      ? "Rate total prepared. Final taxes, fees, and payment are confirmed at checkout."
      : `Minimum stay is ${minStay} nights for these dates.`,
    breakdown,
  };
}
