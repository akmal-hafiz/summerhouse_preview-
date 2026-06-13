import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { baliCollections } from "@/data/baliCollections";
import { getVillaSummaries } from "@/lib/lodgify";
import { logServerError } from "@/lib/security/logger";
import { rateLimitRequest } from "@/lib/security/rateLimit";

const AREA_ALIASES: Record<string, string[]> = {
  ubud: ["ubud"],
  canggu: ["canggu"],
  "canggu-berawa": ["canggu berawa", "berawa"],
  "canggu-padonan": ["canggu padonan", "padonan"],
  pererenan: ["pererenan"],
  umalas: ["umalas"],
  kerobokan: ["kerobokan"],
  legian: ["legian"],
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function isUsableImage(value: string | null | undefined): value is string {
  return Boolean(value && /^(https?:\/\/|\/)/i.test(value));
}

function uniqueImages(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return values.filter((value): value is string => {
    if (!isUsableImage(value)) return false;
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function matchesCollection(villa: { name: string; location: string; description: string }, collectionId: string) {
  const aliases = AREA_ALIASES[collectionId] || [collectionId];
  const haystack = normalizeText([villa.name, villa.location, villa.description].join(" "));
  return aliases.some((alias) => haystack.includes(normalizeText(alias)));
}

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: "lodgify-collection-images", limit: 90, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const villas = await getVillaSummaries();
    const globalImagePool = uniqueImages(villas.map((villa) => villa.imageUrl));
    const collections = await Promise.all(
      baliCollections.map(async (collection, index) => {
        const matchingVillas = villas.filter((villa) => matchesCollection(villa, collection.id)).slice(0, 3);
        const fallbackImages = [
          ...globalImagePool.slice(index * 3),
          ...globalImagePool.slice(0, index * 3),
        ];
        const images = uniqueImages([
          ...matchingVillas.map((villa) => villa.imageUrl),
          ...fallbackImages,
        ]).slice(0, 8);

        return {
          id: collection.id,
          location: collection.location,
          images,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        collections,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    logServerError("[lodgify:collection-images]", error);

    return NextResponse.json(
      {
        success: false,
        collections: [],
        error: "Collection images are temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}
