import type { LodgifyProperty } from "./types";
import { getComparablePrice, getRealPriceLabel } from "./normalizers";

export type LodgifyDestinationSummary = {
  name: string;
  villas: number;
  latitude?: number;
  longitude?: number;
  startingPriceMin: number | null;
  startingPriceMax: number | null;
  currencyCode: string | null;
};

type DestinationAccumulator = {
  villas: number;
  latitudeTotal: number;
  longitudeTotal: number;
  coordinateCount: number;
  prices: Array<{ amount: number; currencyCode: string }>;
};

const REGION_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  canggu: { latitude: -8.6478, longitude: 115.1385 },
  "canggu - berawa": { latitude: -8.6601, longitude: 115.1437 },
  berawa: { latitude: -8.6601, longitude: 115.1437 },
  "canggu - padonan": { latitude: -8.63, longitude: 115.15 },
  padonan: { latitude: -8.63, longitude: 115.15 },
  pererenan: { latitude: -8.6371, longitude: 115.1335 },
  ubud: { latitude: -8.5243, longitude: 115.255 },
  umalas: { latitude: -8.659, longitude: 115.1543 },
  kerobokan: { latitude: -8.65, longitude: 115.17 },
  legian: { latitude: -8.698, longitude: 115.167 },
};

const DESTINATION_PRIORITY = [
  "Canggu",
  "Canggu - Berawa",
  "Canggu - Padonan",
  "Pererenan",
  "Ubud",
  "Umalas",
  "Kerobokan",
  "Legian",
];

function hasValidCoordinates(property: LodgifyProperty) {
  return typeof property.latitude === "number"
    && Number.isFinite(property.latitude)
    && property.latitude >= -90
    && property.latitude <= 90
    && typeof property.longitude === "number"
    && Number.isFinite(property.longitude)
    && property.longitude >= -180
    && property.longitude <= 180;
}

function getRegionCenter(name: string, value: DestinationAccumulator) {
  const knownCenter = REGION_CENTERS[name.trim().toLowerCase()];
  if (knownCenter) return knownCenter;

  if (value.coordinateCount > 0) {
    return {
      latitude: value.latitudeTotal / value.coordinateCount,
      longitude: value.longitudeTotal / value.coordinateCount,
    };
  }

  return null;
}

export function summarizeLodgifyDestinations(
  properties: LodgifyProperty[],
  limit = 8,
): LodgifyDestinationSummary[] {
  const grouped = new Map<string, DestinationAccumulator>();

  properties
    .filter((property) => property.is_active !== false)
    .forEach((property) => {
      const name = String(property.city || property.state || property.country || "Bali").trim() || "Bali";
      const current = grouped.get(name) || {
        villas: 0,
        latitudeTotal: 0,
        longitudeTotal: 0,
        coordinateCount: 0,
        prices: [],
      };

      current.villas += 1;

      if (hasValidCoordinates(property)) {
        current.latitudeTotal += property.latitude as number;
        current.longitudeTotal += property.longitude as number;
        current.coordinateCount += 1;
      }

      const amount = getComparablePrice(property);
      const currencyCode = String(property.currency_code || "").trim().toUpperCase();
      if (amount > 0 && currencyCode && getRealPriceLabel(property)) {
        current.prices.push({ amount, currencyCode });
      }

      grouped.set(name, current);
    });

  return Array.from(grouped.entries())
    .map(([name, value]) => {
      const currencies = new Set(value.prices.map((price) => price.currencyCode));
      const canComparePrices = currencies.size === 1;
      const prices = canComparePrices ? value.prices.map((price) => price.amount) : [];
      const center = getRegionCenter(name, value);

      return {
        name,
        villas: value.villas,
        latitude: center?.latitude,
        longitude: center?.longitude,
        startingPriceMin: prices.length ? Math.min(...prices) : null,
        startingPriceMax: prices.length ? Math.max(...prices) : null,
        currencyCode: canComparePrices ? value.prices[0]?.currencyCode ?? null : null,
      };
    })
    .sort((a, b) => {
      const aIndex = DESTINATION_PRIORITY.indexOf(a.name);
      const bIndex = DESTINATION_PRIORITY.indexOf(b.name);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      return b.villas - a.villas || a.name.localeCompare(b.name);
    })
    .slice(0, Math.max(0, limit));
}

function formatCompactAmount(amount: number, currencyCode: string) {
  if (currencyCode === "IDR") {
    if (amount >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)}bn`;
    }
    if (amount >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}m`;
    }
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return null;
  }
}

export function formatDestinationStartingRates(
  destination: {
    startingPriceMin?: number | null;
    startingPriceMax?: number | null;
    currencyCode?: string | null;
  },
) {
  const { startingPriceMin, startingPriceMax, currencyCode } = destination;
  if (!currencyCode || !startingPriceMin || startingPriceMin <= 0) return null;

  const minimum = formatCompactAmount(startingPriceMin, currencyCode);
  if (!minimum) return null;

  if (!startingPriceMax || startingPriceMax <= startingPriceMin) {
    return `From ${minimum} / night`;
  }

  const maximum = formatCompactAmount(startingPriceMax, currencyCode);
  return maximum ? `${minimum} to ${maximum} / night` : null;
}
