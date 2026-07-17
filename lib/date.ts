export const DAY_IN_MS = 86_400_000;

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function isISODate(value?: string | null): value is string {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISODate(value);
  return formatISODate(date) === value;
}

export function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isPastDate(date: Date, today = new Date()) {
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  return date < current;
}

export function isValidDateRange(checkIn?: string, checkOut?: string) {
  if (!isISODate(checkIn) || !isISODate(checkOut)) return false;
  return parseISODate(checkOut) > parseISODate(checkIn);
}

export function eachDateInclusive(start: string, end: string) {
  if (!isISODate(start) || !isISODate(end)) return [];

  const dates: string[] = [];
  let cursor = parseISODate(start);
  const finalDate = parseISODate(end);

  while (cursor <= finalDate) {
    dates.push(formatISODate(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function eachNightInRange(checkIn: string, checkOut: string) {
  if (!isValidDateRange(checkIn, checkOut)) return [];

  const nights: string[] = [];
  let cursor = parseISODate(checkIn);
  const finalDate = parseISODate(checkOut);

  while (cursor < finalDate) {
    nights.push(formatISODate(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

export function nightsBetween(checkIn?: string, checkOut?: string) {
  if (!isValidDateRange(checkIn, checkOut)) return 0;
  return eachNightInRange(checkIn as string, checkOut as string).length;
}

export function buildMonthCells(month: Date) {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: Date[] = [];

  for (let i = startOffset; i > 0; i -= 1) cells.push(addDays(first, -i));
  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));

  return cells;
}
