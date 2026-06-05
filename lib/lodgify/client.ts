import { asRecordArray, isRecord } from "./runtime";
import type { LodgifyProperty, LodgifyRoom } from "./types";
import { normalizeProperty, normalizeRoom } from "./normalizers";
import { logServerError, logServerWarning } from "@/lib/security/logger";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || "https://api.lodgify.com/v2";
const DEFAULT_TIMEOUT_MS = 12_000;

if (!LODGIFY_API_KEY) {
  logServerWarning("[lodgify:config]", { message: "LODGIFY_API_KEY is not defined." });
}

type FetchOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

async function lodgifyFetch(path: string, options: FetchOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "X-ApiKey": LODGIFY_API_KEY || "",
        Accept: "application/json",
      },
      next: options.revalidate ? { revalidate: options.revalidate } : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Lodgify API error ${response.status} for ${path.split("?")[0]}`);
    }

    return response.json() as Promise<unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchProperties(): Promise<LodgifyProperty[]> {
  try {
    const data = await lodgifyFetch("/properties", { revalidate: 3600 });
    const items = isRecord(data) && Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    return asRecordArray(items).map(normalizeProperty).filter((item) => item.id && item.name);
  } catch (error) {
    logServerError("[lodgify:properties]", error);
    return [];
  }
}

export async function fetchPropertyById(id: string | number): Promise<LodgifyProperty | null> {
  if (!id) return null;

  try {
    const data = await lodgifyFetch(`/properties/${id}`);
    return isRecord(data) ? normalizeProperty(data) : null;
  } catch (error) {
    logServerError("[lodgify:property]", error, { propertyId: String(id) });
    return null;
  }
}

export async function fetchPropertyRooms(id: string | number): Promise<LodgifyRoom[]> {
  if (!id) return [];

  try {
    const data = await lodgifyFetch(`/properties/${id}/rooms`, { revalidate: 3600 });
    return asRecordArray(data).map(normalizeRoom);
  } catch (error) {
    logServerError("[lodgify:rooms]", error, { propertyId: String(id) });
    return [];
  }
}

export async function fetchPropertyImages(id: string | number) {
  if (!id) return [];

  try {
    const data = await lodgifyFetch(`/properties/${id}/images`, { revalidate: 3600 });
    return asRecordArray(data).map((image) => ({
      ...image,
      url: typeof image.url === "string" && image.url.startsWith("//") ? `https:${image.url}` : image.url,
    }));
  } catch (error) {
    logServerError("[lodgify:images]", error, { propertyId: String(id) });
    return [];
  }
}

export async function fetchAvailabilityItems(startDate: string, endDate: string) {
  try {
    const data = await lodgifyFetch(`/availability?start=${startDate}&end=${endDate}`, { revalidate: 60 });
    return asRecordArray(data);
  } catch (error) {
    logServerError("[lodgify:availability-fetch]", error, { startDate, endDate });
    return null;
  }
}

export async function fetchRateCalendar(params: URLSearchParams) {
  try {
    return await lodgifyFetch(`/rates/calendar?${params.toString()}`, { revalidate: 60 });
  } catch (error) {
    logServerError("[lodgify:rates-calendar]", error);
    return null;
  }
}
