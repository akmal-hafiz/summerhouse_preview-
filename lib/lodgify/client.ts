import { asRecordArray, isRecord } from "./runtime";
import type { LodgifyProperty, LodgifyRoom } from "./types";
import { ensureProtocol, normalizeProperty, normalizeRoom } from "./normalizers";
import { logServerError, logServerWarning } from "@/lib/security/logger";
import { errorKindForStatus, isRetriableStatus, LodgifyError, normalizeLodgifyError } from "./errors";
import { lodgifyResilienceConfig, withLodgifyResilience } from "./resilience";
import { getCmsLodgifySnapshot } from "@/lib/cms";

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || "https://api.lodgify.com/v2";
let catalogUnavailableWarned = false;

if (!LODGIFY_API_KEY) {
  logServerWarning("[lodgify:config]", { message: "LODGIFY_API_KEY is not defined." });
}

type FetchOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

async function lodgifyFetch(path: string, options: FetchOptions = {}) {
  const operation = path.split("?")[0];
  return withLodgifyResilience(operation, async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || lodgifyResilienceConfig.timeoutMs);
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "X-ApiKey": LODGIFY_API_KEY || "", Accept: "application/json" },
        next: options.revalidate ? { revalidate: options.revalidate } : undefined,
        cache: options.revalidate ? undefined : "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new LodgifyError(
          `Lodgify API returned ${response.status}`,
          errorKindForStatus(response.status),
          operation,
          response.status,
          isRetriableStatus(response.status),
        );
      }
      try {
        return await response.json() as unknown;
      } catch (error) {
        throw new LodgifyError("Lodgify returned invalid JSON", "invalid_response", operation, response.status, false, { cause: error });
      }
    } catch (error) {
      throw normalizeLodgifyError(error, operation);
    } finally {
      clearTimeout(timeout);
    }
  });
}

export async function fetchProperties(): Promise<LodgifyProperty[]> {
  const snapshot = await getCmsLodgifySnapshot();
  if (!snapshot?.success) {
    const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
    if (!catalogUnavailableWarned && !isProductionBuild) {
      catalogUnavailableWarned = true;
      logServerWarning("[lodgify:catalog-unavailable]", {
        operation: "fetch_public_catalog",
        fallback_used: false,
        message: "No policy-filtered Lodgify catalog is available.",
      });
    }
    return [];
  }

  catalogUnavailableWarned = false;

  return snapshot.properties
    .map((item) => normalizeProperty(item.property))
    .filter((item) => item.id && item.name && item.is_active !== false);
}

export async function fetchPropertyById(id: string | number): Promise<LodgifyProperty | null> {
  if (!id) return null;
  const properties = await fetchProperties();
  return properties.find((property) => String(property.id) === String(id)) ?? null;
}

export async function fetchPropertyRooms(id: string | number): Promise<LodgifyRoom[]> {
  if (!id) return [];
  const propertyId = encodeURIComponent(String(id));

  try {
    const data = await lodgifyFetch(`/properties/${propertyId}/rooms`, { revalidate: 3600 });
    return asRecordArray(data).map(normalizeRoom);
  } catch (error) {
    const normalized = normalizeLodgifyError(error, "/properties/:id/rooms");
    if (normalized.kind === "authentication") {
      logServerError("[lodgify:rooms]", normalized, { propertyId: String(id), kind: normalized.kind });
    }
    const snapshot = await getCmsLodgifySnapshot();
    const cached = snapshot?.properties.find((item) => String(item.property.id) === String(id));
    return (cached?.rooms || []).map(normalizeRoom);
  }
}

export async function fetchPropertyImages(id: string | number) {
  if (!id) return [];
  const propertyId = encodeURIComponent(String(id));

  try {
    const data = await lodgifyFetch(`/properties/${propertyId}/images`, { revalidate: 3600 });
    return asRecordArray(data).map((image) => ({
      ...image,
      url: typeof image.url === "string" ? ensureProtocol(image.url) : image.url,
    }));
  } catch (error) {
    logServerError("[lodgify:images]", error, { propertyId: String(id) });
    return [];
  }
}

export async function fetchAvailabilityItems(startDate: string, endDate: string) {
  try {
    const params = new URLSearchParams({ start: startDate, end: endDate });
    const data = await lodgifyFetch(`/availability?${params.toString()}`, { revalidate: 60 });
    return asRecordArray(data);
  } catch (error) {
    const normalized = normalizeLodgifyError(error, "/availability");
    const meta = { startDate, endDate, kind: normalized.kind, status: normalized.status };
    if (normalized.kind === "authentication") logServerError("[lodgify:availability-fetch]", normalized, meta);
    else logServerWarning("[lodgify:availability-fetch]", { ...meta, message: normalized.message });
    return null;
  }
}

export async function fetchRateCalendar(params: URLSearchParams) {
  try {
    return await lodgifyFetch(`/rates/calendar?${params.toString()}`);
  } catch (error) {
    logServerError("[lodgify:rates-calendar]", error);
    return null;
  }
}
