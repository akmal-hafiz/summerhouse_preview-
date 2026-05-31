import { isValidDateRange } from "@/lib/date";
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
import type { LodgifyProperty, LodgifyRoom, VillaDetail, VillaSearchParams, VillaSearchResult, VillaSummary } from "./types";

export const getProperties = fetchProperties;
export const getPropertyById = fetchPropertyById;
export const getPropertyRooms = fetchPropertyRooms;
export const getPropertyImages = fetchPropertyImages;

function normalizeGuestCount(params: VillaSearchParams) {
  if (params.guests) return params.guests;
  return Number(params.adults || 0) + Number(params.children || 0) || 1;
}

function matchesLocation(property: LodgifyProperty, location?: string) {
  if (!location || location.toLowerCase() === "all") return true;

  const needle = location.toLowerCase();
  const haystack = [
    property.country,
    property.country_code,
    property.state,
    property.city,
    property.address,
    property.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

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
    if (property.country_code === "ID" || /bali|canggu|ubud|seminyak|legian|kerobokan/i.test([
      property.state,
      property.city,
      property.address,
      property.name,
    ].filter(Boolean).join(" "))) {
      locationSet.add("Indonesia");
    }

    [property.country, property.state, property.city, property.address]
      .filter(Boolean)
      .forEach((value) => locationSet.add(String(value)));
  });

  const priority = ["Indonesia", "Bali", "Canggu", "Canggu - Berawa", "Canggu - Padonan", "Kerobokan", "Legian", "Ubud"];
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
  const properties = await fetchProperties();
  const hasDates = isValidDateRange(params.checkIn, params.checkOut);
  const guests = normalizeGuestCount(params);
  const availabilityByProperty: Record<string, ReturnType<typeof buildAvailabilityMapFromItems>> = {};

  if (hasDates) {
    const availabilityItems = await fetchAvailabilityItems(params.checkIn as string, params.checkOut as string);
    properties.forEach((property) => {
      if (!property.id) return;
      availabilityByProperty[String(property.id)] = buildAvailabilityMapFromItems(
        availabilityItems || [],
        property.id,
        params.checkIn as string,
        params.checkOut as string
      );
    });
  }

  const detailed = await Promise.all(properties.map(async (property) => {
    if (!property.id) return null;
    const rooms = await fetchPropertyRooms(property.id);
    return getSearchResultForProperty(property, rooms, availabilityByProperty, hasDates, params);
  }));

  return compact(detailed).filter((villa) => {
    const property = properties.find((item) => String(item.id) === String(villa.id)) || {};
    if (!matchesLocation(property, params.location)) return false;
    if (guests > villa.capacity) return false;
    if (params.minPrice && villa.priceValue && villa.priceValue < params.minPrice) return false;
    if (params.maxPrice && villa.priceValue && villa.priceValue > params.maxPrice) return false;
    if (!villa.isAvailableForSearch) return false;
    return true;
  });
}
