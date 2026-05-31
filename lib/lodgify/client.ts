import { asRecordArray, isRecord } from "./runtime";
import type { LodgifyProperty, LodgifyRoom } from "./types";
import { normalizeProperty, normalizeRoom } from "./normalizers";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || "https://api.lodgify.com/v2";

if (!LODGIFY_API_KEY) {
  console.warn("Warning: LODGIFY_API_KEY is not defined in environment variables.");
}

type FetchOptions = {
  revalidate?: number;
};

async function lodgifyFetch(path: string, options: FetchOptions = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "X-ApiKey": LODGIFY_API_KEY || "",
      Accept: "application/json",
    },
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Lodgify API error ${response.status} for ${path}`);
  }

  return response.json() as Promise<unknown>;
}

export async function fetchProperties(): Promise<LodgifyProperty[]> {
  try {
    const data = await lodgifyFetch("/properties", { revalidate: 3600 });
    const items = isRecord(data) && Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    return asRecordArray(items).map(normalizeProperty).filter((item) => item.id && item.name);
  } catch (error) {
    console.error("Error fetching Lodgify properties:", error);
    return [];
  }
}

export async function fetchPropertyById(id: string | number): Promise<LodgifyProperty | null> {
  if (!id) return null;

  try {
    const data = await lodgifyFetch(`/properties/${id}`);
    return isRecord(data) ? normalizeProperty(data) : null;
  } catch (error) {
    console.error(`Error fetching Lodgify property ${id}:`, error);
    return null;
  }
}

export async function fetchPropertyRooms(id: string | number): Promise<LodgifyRoom[]> {
  if (!id) return [];

  try {
    const data = await lodgifyFetch(`/properties/${id}/rooms`, { revalidate: 3600 });
    return asRecordArray(data).map(normalizeRoom);
  } catch (error) {
    console.error(`Error fetching rooms for property ${id}:`, error);
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
    console.error(`Error fetching images for property ${id}:`, error);
    return [];
  }
}

export async function fetchAvailabilityItems(startDate: string, endDate: string) {
  try {
    const data = await lodgifyFetch(`/availability?start=${startDate}&end=${endDate}`, { revalidate: 60 });
    return asRecordArray(data);
  } catch (error) {
    console.error("Error fetching Lodgify availability:", error);
    return null;
  }
}

export async function fetchRateCalendar(params: URLSearchParams) {
  try {
    return await lodgifyFetch(`/rates/calendar?${params.toString()}`, { revalidate: 60 });
  } catch (error) {
    console.error("Error fetching Lodgify rate calendar:", error);
    return null;
  }
}
