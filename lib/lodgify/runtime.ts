export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asRecordArray(value: unknown): UnknownRecord[] {
  return asArray(value).filter(isRecord);
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function getRecord(value: UnknownRecord, key: string) {
  const next = value[key];
  return isRecord(next) ? next : {};
}

export function compact<T>(values: Array<T | null | undefined | false | "">) {
  return values.filter(Boolean) as T[];
}

export function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
