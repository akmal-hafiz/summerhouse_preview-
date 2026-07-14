import { sanitizeHtml, stripHtml } from "@/lib/sanitize";
import { asArray, asBoolean, asNumber, asOptionalString, asRecordArray, asString, getRecord, isRecord, unique } from "./runtime";
import type { LodgifyId, LodgifyProperty, LodgifyRoom } from "./types";

export function ensureProtocol(url?: string | null) {
  const value = url?.trim();
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  const normalized = value.startsWith("//") ? `https:${value}` : value;

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function formatPrice(price: unknown, currencyCode = "IDR") {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currencyCode || "IDR",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function normalizeProperty(value: Record<string, unknown>): LodgifyProperty {
  const location = getRecord(value, "location");

  return {
    id: (typeof value.id === "string" || typeof value.id === "number") ? value.id : undefined,
    name: asOptionalString(value.name),
    internal_name: asOptionalString(value.internal_name),
    description: sanitizeHtml(asString(value.description)),
    image_url: ensureProtocol(asOptionalString(value.image_url)),
    amenities: value.amenities,
    original_min_price: asNumber(value.original_min_price),
    original_max_price: asNumber(value.original_max_price),
    min_price: asNumber(value.min_price),
    max_price: asNumber(value.max_price),
    currency_code: asOptionalString(value.currency_code) || "IDR",
    city: asOptionalString(value.city),
    country: asOptionalString(value.country),
    country_code: asOptionalString(value.country_code),
    state: asOptionalString(value.state),
    address: asOptionalString(value.address),
    latitude: asNumber(value.latitude),
    longitude: asNumber(value.longitude),
    location: {
      name: asOptionalString(location.name),
    },
    is_active: value.is_active === undefined ? undefined : asBoolean(value.is_active),
    is_featured: asBoolean(value.is_featured),
    rating: asNumber(value.rating),
    max_people: asNumber(value.max_people),
    max_guests: asNumber(value.max_guests),
    bedrooms: asNumber(value.bedrooms),
    bathrooms: asNumber(value.bathrooms),
    rooms_count: asNumber(value.rooms_count),
    bathrooms_count: asNumber(value.bathrooms_count),
    contact: value.contact,
  };
}

export function normalizeRoom(value: Record<string, unknown>): LodgifyRoom {
  const images = asRecordArray(value.images).map((image) => ({
    url: ensureProtocol(asOptionalString(image.url)),
    text: asOptionalString(image.text),
  }));

  return {
    id: (typeof value.id === "string" || typeof value.id === "number") ? value.id : undefined,
    name: asOptionalString(value.name),
    image_url: ensureProtocol(asOptionalString(value.image_url)),
    images,
    amenities: value.amenities,
    max_people: asNumber(value.max_people),
    bedrooms: asNumber(value.bedrooms),
    bathrooms: asNumber(value.bathrooms),
  };
}

export function flattenAmenities(amenities: unknown): string[] {
  if (!amenities) return [];

  if (Array.isArray(amenities)) {
    return amenities
      .map((amenity) => {
        if (typeof amenity === "string") return amenity;
        if (!isRecord(amenity)) return "";
        return asString(amenity.text) || asString(amenity.name);
      })
      .filter(Boolean);
  }

  if (isRecord(amenities)) {
    return Object.values(amenities)
      .flatMap((group) => asArray(group))
      .map((amenity) => {
        if (typeof amenity === "string") return amenity;
        if (!isRecord(amenity)) return "";
        return asString(amenity.text) || asString(amenity.name);
      })
      .filter(Boolean);
  }

  return [];
}

const amenityGroupTitle: Record<string, string> = {
  "bathroom-laundry": "Bathroom & laundry",
  "kitchen-dining": "Kitchen & dining",
  "internet-office": "Internet & office",
  "heating-cooling": "Heating & cooling",
  sleeping: "Bedroom & sleeping",
  parking: "Parking",
  services: "Services",
  outdoor: "Outdoor",
  entertainment: "Entertainment",
  "room-features": "Room features",
  essentials: "Essentials",
};

const amenityGroupOrder = [
  "bathroom-laundry",
  "kitchen-dining",
  "internet-office",
  "heating-cooling",
  "sleeping",
  "parking",
  "services",
  "outdoor",
  "entertainment",
  "room-features",
  "essentials",
];

function normalizeAmenityGroupKey(key: string) {
  const value = key.toLowerCase();
  if (["sanitary", "laundry", "bathroom"].includes(value)) return "bathroom-laundry";
  if (["cooking", "kitchen", "dining"].includes(value)) return "kitchen-dining";
  if (["internet", "office", "entertainment"].includes(value)) return "internet-office";
  if (["heating", "cooling"].includes(value)) return "heating-cooling";
  if (["sleeping", "bedroom"].includes(value)) return "sleeping";
  if (["parking"].includes(value)) return "parking";
  if (["service", "services", "further-info"].includes(value)) return "services";
  if (["outside", "outdoor"].includes(value)) return "outdoor";
  if (["room", "rooms"].includes(value)) return "room-features";
  return "essentials";
}

export function getAmenityGroups(property: LodgifyProperty, rooms: LodgifyRoom[] = []) {
  const grouped = new Map<string, Set<string>>();
  const addToGroup = (sourceKey: string, amenities: unknown) => {
    const groupKey = normalizeAmenityGroupKey(sourceKey);
    const items = flattenAmenities(amenities).map((item) => item.replace(/^\d+\s+/, ""));

    if (!grouped.has(groupKey)) grouped.set(groupKey, new Set());
    items.forEach((item) => grouped.get(groupKey)?.add(item));
  };

  if (isRecord(property.amenities)) {
    Object.entries(property.amenities).forEach(([key, value]) => addToGroup(key, value));
  }

  rooms.forEach((room) => {
    if (isRecord(room.amenities)) {
      Object.entries(room.amenities).forEach(([key, value]) => addToGroup(key, value));
    }
  });

  return Array.from(grouped.entries())
    .map(([key, items]) => ({
      key,
      title: amenityGroupTitle[key] || key,
      items: Array.from(items).filter(Boolean),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => {
      const aIndex = amenityGroupOrder.indexOf(a.key);
      const bIndex = amenityGroupOrder.indexOf(b.key);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
}

export function getAmenityPreview(rooms: LodgifyRoom[] = [], limit = 4) {
  const amenities = unique(rooms.flatMap((room) => flattenAmenities(room.amenities)));
  const preferred = [
    "Kitchen",
    "Wifi",
    "Wireless Broadband Internet",
    "Washing machine",
    "Pool",
    "Air conditioning",
    "Hot Tub",
  ];

  const selected = preferred
    .map((label) => amenities.find((amenity) => amenity.toLowerCase().includes(label.toLowerCase())))
    .filter(Boolean) as string[];

  return unique([...selected, ...amenities]).slice(0, limit).map((amenity) => {
    if (/wireless|internet/i.test(amenity)) return "Wifi";
    if (/kitchen/i.test(amenity)) return "Kitchen";
    if (/air conditioning/i.test(amenity)) return "Air conditioning";
    return amenity.replace(/^\d+\s+/, "");
  });
}

export function getRealPriceLabel(property: LodgifyProperty) {
  return formatPrice(property.original_min_price, property.currency_code || "IDR")
    || formatPrice(property.min_price, property.currency_code || "IDR");
}

export function getComparablePrice(property: LodgifyProperty) {
  const price = Number(property.original_min_price || property.min_price || 0);
  return Number.isFinite(price) ? price : 0;
}

export function getRoomFacts(rooms: LodgifyRoom[] = [], property: LodgifyProperty = {}) {
  const firstRoom = rooms[0] || {};
  const roomAmenities = flattenAmenities(firstRoom.amenities);
  const bedCount = roomAmenities.filter((item) => /bed/i.test(item)).length;

  return {
    guests: firstRoom.max_people || property.max_people || property.max_guests || 2,
    bedrooms: firstRoom.bedrooms || property.bedrooms || property.rooms_count || Math.max(bedCount, 1),
    bathrooms: firstRoom.bathrooms || property.bathrooms || property.bathrooms_count || 1,
  };
}

export function getCapacityFromRooms(rooms: LodgifyRoom[] = [], property: LodgifyProperty = {}) {
  const roomCapacities = rooms
    .map((room) => Number(room.max_people || 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  return Math.max(Number(property.max_people || property.max_guests || 0), ...roomCapacities, 0);
}

export function getPrimaryRoomTypeId(rooms: LodgifyRoom[] = []): LodgifyId | null {
  const room = rooms.find((item) => item.id) || rooms[0];
  return room?.id || null;
}

export function getImageSet(property: LodgifyProperty, rooms: LodgifyRoom[] = []) {
  return unique([
    ensureProtocol(property.image_url),
    ...rooms.map((room) => ensureProtocol(room.image_url)),
    ...rooms.flatMap((room) => room.images?.map((image) => ensureProtocol(image.url)) || []),
  ]).filter(Boolean);
}

export function getImageGallery(property: LodgifyProperty, rooms: LodgifyRoom[] = []) {
  const images = [
    {
      url: ensureProtocol(property.image_url),
      caption: property.name || "Villa image",
    },
    ...rooms.map((room) => ({
      url: ensureProtocol(room.image_url),
      caption: room.name || property.name || "Villa image",
    })),
    ...rooms.flatMap((room) => {
      if (!Array.isArray(room.images)) return [];
      return room.images.map((image) => ({
        url: ensureProtocol(image.url),
        caption: image.text || room.name || property.name || "Villa image",
      }));
    }),
  ].filter((image) => image.url);

  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

export function getDescriptionText(property: LodgifyProperty) {
  return stripHtml(property.description);
}
