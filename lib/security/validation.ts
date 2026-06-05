import { isISODate, isValidDateRange, parseISODate } from "@/lib/date";

export function safeString(value: string | null | undefined, maxLength = 80) {
  if (!value) return "";
  return value.trim().slice(0, maxLength);
}

export function isValidPublicId(value: string | null | undefined) {
  return Boolean(value && /^[a-zA-Z0-9_-]{1,80}$/.test(value));
}

export function clampInteger(value: string | number | null | undefined, min: number, max: number, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

export function validateDateWindow(start?: string | null, end?: string | null, maxDays = 370) {
  if (!isISODate(start) || !isISODate(end)) return false;
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays <= maxDays;
}

export function validateStayRange(checkIn?: string | null, checkOut?: string | null, maxNights = 90) {
  if (!isValidDateRange(checkIn || undefined, checkOut || undefined)) return false;
  const diffDays = Math.round((parseISODate(checkOut as string).getTime() - parseISODate(checkIn as string).getTime()) / 86_400_000);
  return diffDays >= 1 && diffDays <= maxNights;
}
