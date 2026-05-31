import { eachDateInclusive, eachNightInRange, isValidDateRange } from "@/lib/date";
import { asNumber, asRecordArray, asString, isRecord, type UnknownRecord } from "./runtime";
import { fetchAvailabilityItems } from "./client";
import type { LodgifyId } from "./types";

export type AvailabilityStatus = "available" | "booked" | "blocked" | "unavailable" | "unknown";

export type AvailabilityDay = {
  date: string;
  status: AvailabilityStatus;
  available: boolean;
  reason: "available" | "booking" | "closed_period" | "unavailable" | "unknown";
};

function emptyAvailabilityMap(startDate: string, endDate: string) {
  const map: Record<string, AvailabilityDay> = {};

  eachDateInclusive(startDate, endDate).forEach((date) => {
    map[date] = {
      date,
      status: "unknown",
      available: false,
      reason: "unknown",
    };
  });

  return map;
}

function getPeriodStatus(period: UnknownRecord): AvailabilityDay["reason"] {
  const hasBookings = asRecordArray(period.bookings).length > 0;
  const hasClosedPeriod = Boolean(period.closed_period);
  const isAvailable = asNumber(period.available) > 0;

  if (isAvailable) return "available";
  if (hasBookings) return "booking";
  if (hasClosedPeriod) return "closed_period";
  return "unavailable";
}

function reasonToStatus(reason: AvailabilityDay["reason"]): AvailabilityStatus {
  if (reason === "available") return "available";
  if (reason === "booking") return "booked";
  if (reason === "closed_period") return "blocked";
  if (reason === "unavailable") return "unavailable";
  return "unknown";
}

export function buildAvailabilityMapFromItems(
  availabilityItems: UnknownRecord[],
  propertyId: LodgifyId,
  startDate: string,
  endDate: string
) {
  const map = emptyAvailabilityMap(startDate, endDate);

  availabilityItems
    .filter((item) => String(item.property_id) === String(propertyId))
    .forEach((item) => {
      asRecordArray(item.periods).forEach((period) => {
        const start = asString(period.start);
        const end = asString(period.end);
        if (!start || !end) return;

        const reason = getPeriodStatus(period);
        const status = reasonToStatus(reason);
        const available = reason === "available";

        eachDateInclusive(start, end).forEach((date) => {
          if (!map[date]) return;
          map[date] = {
            date,
            status,
            available,
            reason,
          };
        });
      });
    });

  return map;
}

export async function getAvailability(propertyId: number, startDate: string, endDate: string) {
  const data = await fetchAvailabilityItems(startDate, endDate);
  if (!Array.isArray(data)) return null;
  return data.filter((item) => String(item.property_id) === String(propertyId));
}

export async function getAvailabilityForProperty(
  propertyId: LodgifyId,
  startDate: string,
  endDate: string
) {
  return getAvailability(Number(propertyId), startDate, endDate);
}

export async function getAvailabilityMap(
  propertyId: LodgifyId,
  startDate: string,
  endDate: string
) {
  const availability = await getAvailabilityForProperty(propertyId, startDate, endDate);

  if (!Array.isArray(availability)) {
    return buildAvailabilityMapFromItems([], propertyId, startDate, endDate);
  }

  return buildAvailabilityMapFromItems(availability.filter(isRecord), propertyId, startDate, endDate);
}

export function isRangeAvailable(
  availabilityMap: Record<string, AvailabilityDay>,
  checkIn?: string,
  checkOut?: string
) {
  if (!isValidDateRange(checkIn, checkOut)) return false;

  return eachNightInRange(checkIn as string, checkOut as string).every((date) => {
    return availabilityMap[date]?.available === true;
  });
}
