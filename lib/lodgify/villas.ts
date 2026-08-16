import { isValidDateRange } from "@/lib/date";
import { cache } from "react";
import {
  CMS_LODGIFY_REVALIDATE,
  getCmsBaliCollections,
  getCmsSection,
  getHomepageVillaSelections,
  type CmsHomepageSlots,
} from "@/lib/cms";
import { fetchAvailabilityItems, fetchProperties, fetchPropertyById, fetchPropertyImages, fetchPropertyRooms } from "./client";
import { buildAvailabilityMapFromItems, isRangeAvailable } from "./availability";
import { getDirectBookingUrl } from "./booking";
import {
  ensureProtocol,
  flattenAmenities,
  formatPrice,
  getAmenityGroups,
  getAmenityPreview,
  getCapacityFromRooms,
  getComparablePrice,
  getDescriptionText,
  getImageGallery,
  getImageSet,
  getPrimaryRoomTypeId,
  getRealPriceLabel,
  getRoomFacts,
} from "./normalizers";
import { compact, unique } from "./runtime";
import type {
  HomepageVillaCard,
  HomepageStayGroup,
  HomepageStayVilla,
  LodgifyProperty,
  LodgifyRoom,
  PortfolioStats,
  SignatureVilla,
  VillaDetail,
  VillaSearchParams,
  VillaSearchResult,
  VillaSummary,
} from "./types";
import type { BaliCollectionItem } from "@/data/baliCollections";

export const getProperties = fetchProperties;
export const getPropertyById = fetchPropertyById;
export const getPropertyRooms = fetchPropertyRooms;
export const getPropertyImages = fetchPropertyImages;

const DEFAULT_FEATURED_HOME_IDS = ["796460", "475365", "475372"];
const DEFAULT_SHORT_STAY_IDS = ["703452", "475366", "761507"];
const DEFAULT_EXTENDED_STAY_IDS = ["796460", "761507", "762712"];
const FALLBACK_COLLECTION_IMAGES = [
  "/homepage_villa/VillaZen.webp",
  "/homepage_villa/curated-3-corner.webp",
  "/homepage_villa/CactusEstate.webp",
  "/homepage_villa/curated-8.webp",
  "/homepage_villa/rumahmimosa.webp",
];

function getSlotIds(slots: CmsHomepageSlots | null, slot: keyof CmsHomepageSlots): string[] {
  if (!slots?.[slot]?.length) return [];
  return slots[slot]!.map((row) => row.lodgify_property_id).filter(Boolean);
}

type SlotSource = "cms" | "env" | "default";

async function resolveSlotConfig(
  slot: keyof CmsHomepageSlots,
  envKey: string,
  fallback: string[],
  cachedSlots?: CmsHomepageSlots | null,
): Promise<{ ids: string[]; source: SlotSource }> {
  const slots = cachedSlots !== undefined ? cachedSlots : await getHomepageVillaSelections();
  const cmsIds = getSlotIds(slots, slot);
  if (cmsIds.length) return { ids: cmsIds, source: "cms" };

  const envRaw = (process.env[envKey] || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (envRaw.length) return { ids: envRaw, source: "env" };

  return { ids: fallback, source: "default" };
}

async function resolveConfiguredProperties(
  properties: LodgifyProperty[],
  configuredIds: string[],
): Promise<LodgifyProperty[]> {
  const activeById = new Map(
    properties
      .filter((property) => property.id && property.is_active !== false)
      .map((property) => [String(property.id), property]),
  );

  return configuredIds
    .map((id) => activeById.get(String(id)))
    .filter((property): property is LodgifyProperty => Boolean(property));
}

function normalizeGuestCount(params: VillaSearchParams) {
  if (params.guests) return params.guests;
  return Number(params.adults || 0) + Number(params.children || 0) || 1;
}

function normalizeLocation(value?: string | null) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ");
}

export function matchesLocation(
  property: LodgifyProperty,
  location?: string,
  match: VillaSearchParams["match"] = "fuzzy",
) {
  if (!location || location.toLowerCase() === "all") return true;

  const needle = normalizeLocation(location);
  if (match === "exact") {
    return [property.city, property.location?.name]
      .filter(Boolean)
      .some((value) => normalizeLocation(value) === needle);
  }

  const haystack = [
    property.country,
    property.country_code,
    property.state,
    property.city,
    property.address,
    property.name,
  ]
    .filter(Boolean)
    .map((value) => normalizeLocation(String(value)))
    .join(" ");

  return haystack.includes(needle);
}

function propertyToSummary(property: LodgifyProperty): VillaSummary | null {
  if (!property.id || !property.name) return null;

  return {
    id: property.id,
    name: property.name,
    location: property.city || property.location?.name || "Bali",
    description: getDescriptionText(property),
    imageUrl: ensureProtocol(property.image_url) || "/homepage_villa/VillaZen.webp",
    priceLabel: getRealPriceLabel(property),
    originalPriceLabel: formatPrice(property.original_min_price, property.currency_code || "IDR"),
    priceValue: getComparablePrice(property),
    currencyCode: property.currency_code || "IDR",
    isFeatured: Boolean(property.is_featured),
    guests: property.max_people || property.max_guests || null,
    bedrooms: property.bedrooms || property.rooms_count || null,
    bathrooms: property.bathrooms || property.bathrooms_count || null,
  };
}

export async function getVillaSummaries() {
  const properties = await fetchProperties();
  return compact(properties.map(propertyToSummary));
}

/** Publicly eligible properties: unique by ID, active, with a name (same rule used by search/homepage). */
async function getEligibleProperties(): Promise<LodgifyProperty[]> {
  const properties = await fetchProperties();
  return properties.filter((property) => property.is_active !== false);
}

export async function getPortfolioStats(): Promise<PortfolioStats> {
  const properties = await getEligibleProperties();
  return { homesCount: properties.length > 0 ? properties.length : null };
}

export async function getVillaDetail(id: string | number): Promise<VillaDetail | null> {
  const [property, rooms] = await Promise.all([
    fetchPropertyById(id),
    fetchPropertyRooms(id),
  ]);

  if (!property || !property.id || !property.name) return null;

  const facts = getRoomFacts(rooms, property);
  const images = getImageSet(property, rooms);
  const imageGallery = getImageGallery(property, rooms);
  const amenities = unique([
    ...flattenAmenities(property.amenities),
    ...rooms.flatMap((room) => flattenAmenities(room.amenities)),
  ]);
  const realPriceLabel = getRealPriceLabel(property);

  return {
    id: property.id,
    name: property.name,
    internalName: property.internal_name,
    descriptionHtml: property.description || "",
    descriptionText: getDescriptionText(property),
    address: [property.address, property.city, property.country].filter(Boolean).join(", "),
    city: property.city || "Bali",
    country: property.country || "Indonesia",
    latitude: property.latitude,
    longitude: property.longitude,
    imageUrl: images[0] || "/homepage_villa/VillaZen.webp",
    images,
    imageGallery,
    amenities,
    amenityGroups: getAmenityGroups(property, rooms),
    amenitiesPreview: getAmenityPreview(rooms),
    rating: Number(property.rating || 0),
    priceLabel: realPriceLabel,
    originalPriceLabel: formatPrice(property.original_min_price, property.currency_code || "IDR"),
    maxPriceLabel: formatPrice(property.max_price, property.currency_code || "IDR"),
    currencyCode: property.currency_code || "IDR",
    bookingUrl: getDirectBookingUrl(property.id),
    contact: property.contact || null,
    roomTypeId: getPrimaryRoomTypeId(rooms),
    rooms,
    ...facts,
  };
}

export async function getVillaSearchOptions() {
  const properties = await fetchProperties();
  const activeProperties = properties.filter((property) => property.is_active !== false);
  const locationSet = new Set<string>();
  const prices = activeProperties
    .map((property) => getComparablePrice(property))
    .filter((price) => price > 0);

  activeProperties.forEach((property) => {
    if (property.city) {
      locationSet.add(String(property.city).trim());
    }
  });

  const priority = ["Canggu", "Canggu - Berawa", "Canggu - Padonan", "Pererenan", "Umalas", "Ubud", "Kerobokan", "Legian"];
  const locations = Array.from(locationSet).sort((a, b) => {
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }

    return a.localeCompare(b);
  });

  return {
    locations,
    priceRange: {
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
    },
  };
}

function propertyToHomepageVillaCard(
  property: LodgifyProperty,
  rooms: LodgifyRoom[]
): HomepageVillaCard | null {
  const summary = propertyToSummary(property);
  if (!summary) return null;

  const facts = getRoomFacts(rooms, property);
  const images = getImageSet(property, rooms);
  const capacity = getCapacityFromRooms(rooms, property) || facts.guests || summary.guests;

  return {
    id: summary.id,
    name: summary.name,
    location: property.city || property.location?.name || "Bali",
    description: summary.description,
    imageUrl: images[0] || summary.imageUrl,
    priceLabel: summary.priceLabel,
    guests: capacity,
    bedrooms: facts.bedrooms || summary.bedrooms,
    bathrooms: facts.bathrooms || summary.bathrooms,
    href: `/villas/${summary.id}`,
    images: images,
  };
}

function propertyToHomepageStayVilla(
  property: LodgifyProperty,
  rooms: LodgifyRoom[]
): HomepageStayVilla | null {
  const card = propertyToHomepageVillaCard(property, rooms);
  if (!card) return null;

  return {
    ...card,
    description: getHomepageCardDescription(card.description),
    images: card.images?.slice(0, 4) || [card.imageUrl],
    amenitiesPreview: getAmenityPreview(rooms),
    priceValue: getComparablePrice(property),
  };
}

function getHomepageCardDescription(description: string) {
  const compactDescription = description
    .replace(/[—–]/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  if (compactDescription.length <= 220) return compactDescription;

  const withinLimit = compactDescription.slice(0, 220);
  const sentenceEnd = Math.max(
    withinLimit.lastIndexOf(". "),
    withinLimit.lastIndexOf("! "),
    withinLimit.lastIndexOf("? "),
  );

  if (sentenceEnd >= 80) return withinLimit.slice(0, sentenceEnd + 1);
  return `${withinLimit.slice(0, 217).trimEnd()}...`;
}

async function getHomepageVillaFromProperty(property: LodgifyProperty) {
  if (!property.id) return null;
  const rooms = await getHomepagePropertyRooms(String(property.id));
  return propertyToHomepageStayVilla(property, rooms);
}

const getHomepagePropertyRooms = cache(async (propertyId: string) => fetchPropertyRooms(propertyId));

async function buildStayGroup(
  properties: LodgifyProperty[],
  id: HomepageStayGroup["id"],
  label: string,
  description: string,
  configuredIds: string[],
  fallbackProperties: LodgifyProperty[],
  resolveVilla: (property: LodgifyProperty) => Promise<HomepageStayVilla | null>,
) {
  const configuredProperties = configuredIds
    .map((propertyId) => properties.find((property) => String(property.id) === String(propertyId)))
    .filter((property): property is LodgifyProperty => Boolean(property));
  const seen = new Set<string>();
  const candidates = [...configuredProperties, ...fallbackProperties, ...properties]
    .filter((property) => {
      if (!property.id || property.is_active === false) return false;
      const propertyId = String(property.id);
      if (seen.has(propertyId)) return false;
      seen.add(propertyId);
      return true;
    })
    .slice(0, 6);

  const villas = compact(await Promise.all(candidates.map(resolveVilla))).slice(0, 6);

  return {
    id,
    label,
    description,
    villas,
  };
}

export async function getHomepageStayGroups(): Promise<HomepageStayGroup[]> {
  const [properties, slots] = await Promise.all([
    fetchProperties().then((all) => all.filter((property) => property.is_active !== false)),
    getHomepageVillaSelections(),
  ]);
  const byPriceAsc = [...properties].sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
  const byPriceDesc = [...properties].sort((a, b) => getComparablePrice(b) - getComparablePrice(a));
  const extendedFallback = properties
    .filter((property) => /pererenan|umalas|berawa|canggu/i.test([property.city, property.name].filter(Boolean).join(" ")))
    .sort((a, b) => getComparablePrice(b) - getComparablePrice(a));

  const short = await resolveSlotConfig("short_stays", "SHORT_STAY_PROPERTY_IDS", DEFAULT_SHORT_STAY_IDS, slots);
  const extended = await resolveSlotConfig("extended_stays", "EXTENDED_STAY_PROPERTY_IDS", DEFAULT_EXTENDED_STAY_IDS, slots);
  const featuredHomes = await resolveSlotConfig("featured_homes", "FEATURED_HOME_PROPERTY_IDS", DEFAULT_FEATURED_HOME_IDS, slots);
  const villaPromises = new Map<string, Promise<HomepageStayVilla | null>>();
  const resolveVilla = (property: LodgifyProperty) => {
    const propertyId = String(property.id);
    const existing = villaPromises.get(propertyId);
    if (existing) return existing;

    const pending = getHomepageVillaFromProperty(property);
    villaPromises.set(propertyId, pending);
    return pending;
  };

  return Promise.all([
    buildStayGroup(
      properties,
      "short-stays",
      "Short Stays",
      "Weekend escapes and easy Bali breaks for a lighter, flexible stay.",
      short.ids,
      byPriceAsc,
      resolveVilla,
    ),
    buildStayGroup(
      properties,
      "extended-stays",
      "Extended Stays",
      "Private homes made for settling in, working slowly, and living with more room.",
      extended.ids,
      extendedFallback,
      resolveVilla,
    ),
    buildStayGroup(
      properties,
      "featured-homes",
      "Featured Homes",
      "Handpicked SummerHouse stays with standout design, setting, and guest comfort.",
      featuredHomes.ids,
      byPriceDesc,
      resolveVilla,
    ),
  ]);
}

function getSignatureSubtitle(villa: HomepageStayVilla) {
  const location = villa.location ? ` in ${villa.location}` : "";
  return `Our most exclusive estate in the current SummerHouse collection${location}.`;
}

type SignatureVillaCms = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  why_this_home?: string | null;
};

export async function getHomepageSignatureVilla(): Promise<SignatureVilla | null> {
  const [properties, slots, cms] = await Promise.all([
    fetchProperties().then((all) => all.filter((property) => property.is_active !== false)),
    getHomepageVillaSelections(),
    getCmsSection<SignatureVillaCms>("home", "signature_villa", {
      revalidate: CMS_LODGIFY_REVALIDATE,
    }),
  ]);

  const signatureIds = getSlotIds(slots, "signature");
  const signatureSelection = slots?.signature?.[0];
  let property: LodgifyProperty | undefined;

  if (signatureIds.length) {
    // The bulk list is the source of truth for currently active properties.
    // A removed CMS selection falls back below without issuing a repeated 404.
    const resolved = await resolveConfiguredProperties(properties, [signatureIds[0]]);
    property = resolved[0];
  }

  if (!property) {
    property = [...properties].sort((a, b) => getComparablePrice(b) - getComparablePrice(a))[0];
  }
  if (!property?.id) return null;

  const rooms = await getHomepagePropertyRooms(String(property.id));
  const villa = propertyToHomepageStayVilla(property, rooms);
  if (!villa) return null;

  const images = getImageSet(property, rooms).slice(0, 5);
  const subtitle = getSignatureSubtitle(villa);
  const award = signatureSelection?.show_award && signatureSelection.award_name?.trim()
    ? {
        name: signatureSelection.award_name.trim(),
        issuer: signatureSelection.award_issuer?.trim() || null,
        year: signatureSelection.award_year?.trim() || null,
        url: signatureSelection.award_url?.trim() || null,
        logo: signatureSelection.award_logo?.trim() || null,
      }
    : null;

  return {
    ...villa,
    eyebrow: cms?.eyebrow?.trim() || "Signature Villa",
    title: cms?.title?.trim() || "Most Exclusive Stay",
    subtitle,
    whyThisHome: cms?.why_this_home?.trim() || `${subtitle} Chosen for tropical architecture, privacy, and full-villa comfort.`,
    description: cms?.description?.trim() || `A private ${villa.bedrooms ? `${villa.bedrooms}-bedroom ` : ""}estate with pool, full-villa comfort, and a calm island rhythm.`,
    address: property.city ? `${property.city}, Bali` : "Bali",
    images,
    award,
  };
}

function getCollectionProfile(city: string) {
  const normalized = city.toLowerCase();
  if (normalized.includes("berawa")) {
    return {
      category: "Cafe Coastline",
      moods: ["Beach", "Cafes", "Design", "Social"],
      description: "Stylish homes close to cafes, beach clubs, and the polished rhythm of Berawa.",
      highlights: ["Beach Clubs", "Cafe Culture", "Design Villas", "Easy Dining"],
      bestFor: ["Friends", "Couples", "Lifestyle Stays"],
      facts: [
        { label: "Mood", value: "Social coastal living" },
        { label: "Pace", value: "Easy and connected" },
        { label: "Stay style", value: "Design villas" },
      ],
    };
  }

  if (normalized.includes("pererenan")) {
    return {
      category: "Quiet Coast",
      moods: ["Surf", "Village", "Privacy", "Slow Living"],
      description: "A quieter coastal pocket for surf mornings, private villas, and slower evenings.",
      highlights: ["Surf Mornings", "Village Calm", "Private Pools", "Dining Nearby"],
      bestFor: ["Longer Stays", "Couples", "Families"],
      facts: [
        { label: "Mood", value: "Quiet coastal calm" },
        { label: "Pace", value: "Slow and spacious" },
        { label: "Stay style", value: "Private estates" },
      ],
    };
  }

  if (normalized.includes("padonan")) {
    return {
      category: "Calm Canggu",
      moods: ["Local", "Quiet", "Modern", "Practical"],
      description: "Design-led homes in a calmer Canggu neighborhood with easy access to the coast.",
      highlights: ["Quiet Lanes", "Modern Lofts", "Local Rhythm", "Canggu Access"],
      bestFor: ["Remote Work", "Couples", "Slow Trips"],
      facts: [
        { label: "Mood", value: "Residential calm" },
        { label: "Pace", value: "Balanced and practical" },
        { label: "Stay style", value: "Modern homes" },
      ],
    };
  }

  if (normalized.includes("umalas")) {
    return {
      category: "Leafy Privacy",
      moods: ["Leafy", "Private", "Central", "Relaxed"],
      description: "Leafy villas with quiet privacy, central access, and a softer rhythm for private downtime.",
      highlights: ["Leafy Streets", "Private Pools", "Central Access", "Quiet Dining"],
      bestFor: ["Families", "Couples", "Long Stays"],
      facts: [
        { label: "Mood", value: "Soft privacy" },
        { label: "Pace", value: "Calm and central" },
        { label: "Stay style", value: "Private villas" },
      ],
    };
  }

  if (normalized.includes("ubud")) {
    return {
      category: "Jungle Retreats",
      moods: ["Jungle", "Wellness", "River", "Culture"],
      description: "Peaceful villas surrounded by rice fields, rivers, and tropical jungle.",
      highlights: ["River Views", "Jungle Calm", "Wellness Rituals", "Cultural Days"],
      bestFor: ["Couples", "Wellness", "Nature Lovers"],
      facts: [
        { label: "Mood", value: "Restorative nature" },
        { label: "Pace", value: "Slow and quiet" },
        { label: "Stay style", value: "Jungle villas" },
      ],
    };
  }

  if (normalized.includes("legian")) {
    return {
      category: "Classic Bali Base",
      moods: ["Beach", "Dining", "Convenient", "Classic"],
      description: "A practical coastal base close to restaurants, beaches, and classic Bali energy.",
      highlights: ["Beach Access", "Restaurants", "Easy Transport", "Classic Bali"],
      bestFor: ["Families", "First Trips", "Beach Days"],
      facts: [
        { label: "Mood", value: "Classic coastal Bali" },
        { label: "Pace", value: "Easy and active" },
        { label: "Stay style", value: "Convenient homes" },
      ],
    };
  }

  if (normalized.includes("kerobokan")) {
    return {
      category: "Connected Hideaway",
      moods: ["Central", "Quiet", "Dining", "Access"],
      description: "A connected Bali hideaway with easy routes to Umalas, Canggu, and nearby dining.",
      highlights: ["Central Access", "Quiet Streets", "Dining Nearby", "Private Villas"],
      bestFor: ["Longer Stays", "Small Groups", "Easy Access"],
      facts: [
        { label: "Mood", value: "Connected calm" },
        { label: "Pace", value: "Flexible and easy" },
        { label: "Stay style", value: "Private homes" },
      ],
    };
  }

  return {
    category: "Bali Living",
    moods: ["Private", "Comfort", "Design", "Ease"],
    description: "A SummerHouse destination shaped by comfort, privacy, and thoughtful Bali living.",
    highlights: ["Private Villas", "Calm Design", "Guest Comfort", "Easy Stays"],
    bestFor: ["Couples", "Families", "Friends"],
    facts: [
      { label: "Mood", value: "Private Bali living" },
      { label: "Pace", value: "Easy and personal" },
      { label: "Stay style", value: "Curated homes" },
    ],
  };
}

export async function getHomepageBaliCollections(limit = 6): Promise<BaliCollectionItem[]> {
  const cms = await getCmsBaliCollections();
  if (cms && cms.length) {
    return cms.slice(0, limit);
  }

  const properties = (await fetchProperties()).filter((property) => property.is_active !== false && property.city);
  const grouped = new Map<string, LodgifyProperty[]>();

  properties.forEach((property) => {
    const city = String(property.city).trim();
    if (!city) return;
    if (!grouped.has(city)) grouped.set(city, []);
    grouped.get(city)?.push(property);
  });

  const cityEntries = Array.from(grouped.entries())
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .slice(0, limit);

  const collections = await Promise.all(cityEntries.map(async ([city, cityProperties], index) => {
    const profile = getCollectionProfile(city);
    const sortedByPrice = [...cityProperties].sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
    const minPrice = sortedByPrice.find((property) => getComparablePrice(property) > 0);
    const imageSources = await Promise.all(
      cityProperties.slice(0, 3).map(async (property) => {
        if (!property.id) return [];
        const rooms = await fetchPropertyRooms(property.id);
        return getImageSet(property, rooms);
      })
    );
    const galleryImages = unique([...imageSources.flat(), ...FALLBACK_COLLECTION_IMAGES]).slice(0, 7);
    const id = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    return {
      id,
      location: city,
      category: profile.category,
      tag: profile.category,
      moods: profile.moods,
      description: profile.description,
      highlights: profile.highlights,
      bestFor: profile.bestFor,
      facts: profile.facts,
      villaCount: `${cityProperties.length} ${cityProperties.length === 1 ? "villa" : "villas"}`,
      price: minPrice ? `From ${getRealPriceLabel(minPrice)} / night` : "Price confirmed at booking",
      cta: `Explore Villas in ${city}`,
      href: `/villas?location=${encodeURIComponent(city)}&match=exact`,
      mediaType: "image" as const,
      image: galleryImages[0] || FALLBACK_COLLECTION_IMAGES[index % FALLBACK_COLLECTION_IMAGES.length],
      imageAlt: `SummerHouse villa collection in ${city}`,
      galleryImages,
    };
  }));

  return collections;
}

async function getSearchResultForProperty(
  property: LodgifyProperty,
  rooms: LodgifyRoom[],
  availabilityByProperty: Record<string, ReturnType<typeof buildAvailabilityMapFromItems>>,
  hasDates: boolean,
  params: VillaSearchParams
): Promise<VillaSearchResult | null> {
  const summary = propertyToSummary(property);
  if (!summary) return null;

  const facts = getRoomFacts(rooms, property);
  const images = getImageSet(property, rooms);
  const capacity = getCapacityFromRooms(rooms, property) || facts.guests;
  const amenitiesPreview = getAmenityPreview(rooms);

  return {
    ...summary,
    location: property.city || property.location?.name || property.address || "Bali",
    imageUrl: images[0] || summary.imageUrl,
    capacity,
    amenitiesPreview,
    rating: Number(property.rating || 0),
    isAvailableForSearch: hasDates
      ? isRangeAvailable(availabilityByProperty[String(property.id)] || {}, params.checkIn, params.checkOut)
      : true,
    ...facts,
  };
}

export async function searchAvailableVillas(params: VillaSearchParams = {}) {
  const properties = (await fetchProperties()).filter((property) => property.is_active !== false);
  const hasDates = isValidDateRange(params.checkIn, params.checkOut);
  const guests = normalizeGuestCount(params);
  const availabilityByProperty: Record<string, ReturnType<typeof buildAvailabilityMapFromItems>> = {};
  const candidateProperties = properties.filter((property) => {
    if (!matchesLocation(property, params.location, params.match)) return false;

    const comparablePrice = getComparablePrice(property);
    if (params.minPrice && comparablePrice && comparablePrice < params.minPrice) return false;
    if (params.maxPrice && comparablePrice && comparablePrice > params.maxPrice) return false;

    return true;
  });

  if (hasDates) {
    const availabilityItems = await fetchAvailabilityItems(params.checkIn as string, params.checkOut as string);
    candidateProperties.forEach((property) => {
      if (!property.id) return;
      availabilityByProperty[String(property.id)] = buildAvailabilityMapFromItems(
        availabilityItems || [],
        property.id,
        params.checkIn as string,
        params.checkOut as string
      );
    });
  }

  const detailed = await Promise.all(candidateProperties.map(async (property) => {
    if (!property.id) return null;
    const rooms = await fetchPropertyRooms(property.id);
    return getSearchResultForProperty(property, rooms, availabilityByProperty, hasDates, params);
  }));

  return compact(detailed).filter((villa) => {
    if (guests > villa.capacity) return false;
    if (!villa.isAvailableForSearch) return false;
    return true;
  });
}
