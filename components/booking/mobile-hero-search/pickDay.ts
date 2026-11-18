import { addDays, formatISODate, parseISODate } from "@/lib/date";

export type DateRange = { checkIn: string; checkOut: string; autoCheckOut: boolean };

/**
 * One tap on the search calendar. A new range starts when there is no check-in, when the check-out was chosen by hand,
 * or when the tapped day is not after the check-in; with a usual stay length (`nights`) its check-out is set for the
 * member and marked auto. Any later day tapped after the check-in becomes the check-out, so an auto check-out never
 * blocks picking another one.
 */
export function pickDay(range: DateRange, date: string, nights?: number): DateRange {
  const startsAgain = !range.checkIn || (range.checkOut && !range.autoCheckOut) || date <= range.checkIn;
  if (!startsAgain) return { checkIn: range.checkIn, checkOut: date, autoCheckOut: false };
  return nights
    ? { checkIn: date, checkOut: formatISODate(addDays(parseISODate(date), nights)), autoCheckOut: true }
    : { checkIn: date, checkOut: "", autoCheckOut: false };
}
