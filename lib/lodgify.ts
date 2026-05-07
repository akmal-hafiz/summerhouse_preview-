const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || 'https://api.lodgify.com/v2';

if (!LODGIFY_API_KEY) {
  console.warn('Warning: LODGIFY_API_KEY is not defined in environment variables.');
}

/**
 * Helper to ensure image URLs have https protocol
 */
const ensureProtocol = (url: string) => {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
};

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
};

const flattenAmenities = (amenities: any) => {
  if (!amenities) return [];

  if (Array.isArray(amenities)) {
    return amenities
      .map((amenity) => amenity?.text || amenity?.name || amenity)
      .filter(Boolean);
  }

  if (typeof amenities === 'object') {
    return Object.values(amenities)
      .flatMap((group: any) => Array.isArray(group) ? group : [])
      .map((amenity: any) => amenity?.text || amenity?.name)
      .filter(Boolean);
  }

  return [];
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const formatPrice = (price: any, currencyCode = 'IDR') => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currencyCode || 'IDR',
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const getRoomFacts = (rooms: any[] = [], property: any = {}) => {
  const firstRoom = rooms[0] || {};
  const roomAmenities = flattenAmenities(firstRoom.amenities);
  const bedCount = roomAmenities.filter((item) => /bed/i.test(item)).length;

  return {
    guests: firstRoom.max_people || property.max_people || property.max_guests || 2,
    bedrooms: firstRoom.bedrooms || property.bedrooms || property.rooms_count || Math.max(bedCount, 1),
    bathrooms: firstRoom.bathrooms || property.bathrooms || property.bathrooms_count || 1,
  };
};

const getImageSet = (property: any, rooms: any[] = []) => {
  return unique([
    ensureProtocol(property?.image_url),
    ...rooms.map((room) => ensureProtocol(room?.image_url)),
    ...rooms.flatMap((room) => {
      if (!Array.isArray(room?.images)) return [];
      return room.images.map((image: any) => ensureProtocol(image?.url));
    }),
  ]).filter(Boolean);
};

const getImageGallery = (property: any, rooms: any[] = []) => {
  const images = [
    {
      url: ensureProtocol(property?.image_url),
      caption: property?.name || 'Villa image',
    },
    ...rooms.map((room) => ({
      url: ensureProtocol(room?.image_url),
      caption: room?.name || property?.name || 'Villa image',
    })),
    ...rooms.flatMap((room) => {
      if (!Array.isArray(room?.images)) return [];
      return room.images.map((image: any) => ({
        url: ensureProtocol(image?.url),
        caption: image?.text || room?.name || property?.name || 'Villa image',
      }));
    }),
  ].filter((image) => image.url);

  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
};

const amenityGroupTitle: Record<string, string> = {
  'bathroom-laundry': 'Bathroom & laundry',
  'kitchen-dining': 'Kitchen & dining',
  'internet-office': 'Internet & office',
  'heating-cooling': 'Heating & cooling',
  sleeping: 'Bedroom & sleeping',
  parking: 'Parking',
  services: 'Services',
  outdoor: 'Outdoor',
  entertainment: 'Entertainment',
  'room-features': 'Room features',
  essentials: 'Essentials',
};

const amenityGroupOrder = [
  'bathroom-laundry',
  'kitchen-dining',
  'internet-office',
  'heating-cooling',
  'sleeping',
  'parking',
  'services',
  'outdoor',
  'entertainment',
  'room-features',
  'essentials',
];

const normalizeAmenityGroupKey = (key: string) => {
  const value = key.toLowerCase();
  if (['sanitary', 'laundry', 'bathroom'].includes(value)) return 'bathroom-laundry';
  if (['cooking', 'kitchen', 'dining'].includes(value)) return 'kitchen-dining';
  if (['internet', 'office', 'entertainment'].includes(value)) return 'internet-office';
  if (['heating', 'cooling'].includes(value)) return 'heating-cooling';
  if (['sleeping', 'bedroom'].includes(value)) return 'sleeping';
  if (['parking'].includes(value)) return 'parking';
  if (['service', 'services', 'further-info'].includes(value)) return 'services';
  if (['outside', 'outdoor'].includes(value)) return 'outdoor';
  if (['room', 'rooms'].includes(value)) return 'room-features';
  return 'essentials';
};

const getAmenityGroups = (property: any, rooms: any[] = []) => {
  const grouped = new Map<string, Set<string>>();
  const addToGroup = (sourceKey: string, amenities: any) => {
    const groupKey = normalizeAmenityGroupKey(sourceKey);
    const items = flattenAmenities(amenities).map((item) => item.replace(/^\d+\s+/, ''));

    if (!grouped.has(groupKey)) grouped.set(groupKey, new Set());
    items.forEach((item) => grouped.get(groupKey)?.add(item));
  };

  if (property?.amenities && typeof property.amenities === 'object' && !Array.isArray(property.amenities)) {
    Object.entries(property.amenities).forEach(([key, value]) => addToGroup(key, value));
  }

  rooms.forEach((room) => {
    if (room?.amenities && typeof room.amenities === 'object' && !Array.isArray(room.amenities)) {
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
};

const getAmenityPreview = (rooms: any[] = [], limit = 4) => {
  const amenities = unique(rooms.flatMap((room) => flattenAmenities(room.amenities)));
  const preferred = [
    'Kitchen',
    'Wifi',
    'Wireless Broadband Internet',
    'Washing machine',
    'Pool',
    'Air conditioning',
    'Hot Tub',
  ];

  const selected = preferred
    .map((label) => amenities.find((amenity) => amenity.toLowerCase().includes(label.toLowerCase())))
    .filter(Boolean) as string[];

  return unique([...selected, ...amenities]).slice(0, limit).map((amenity) => {
    if (/wireless|internet/i.test(amenity)) return 'Wifi';
    if (/kitchen/i.test(amenity)) return 'Kitchen';
    if (/air conditioning/i.test(amenity)) return 'Air conditioning';
    return amenity.replace(/^\d+\s+/, '');
  });
};

const getRealPriceLabel = (property: any) => {
  return formatPrice(property.original_min_price, property.currency_code || 'IDR')
    || formatPrice(property.min_price, property.currency_code || 'IDR');
};

export type AvailabilityStatus = 'available' | 'booked' | 'blocked' | 'unavailable' | 'unknown';

export type AvailabilityDay = {
  date: string;
  status: AvailabilityStatus;
  available: boolean;
  reason: 'available' | 'booking' | 'closed_period' | 'unavailable' | 'unknown';
};

export type VillaSearchParams = {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type LodgifyRateQuote = {
  success: boolean;
  source: 'lodgify-rates-calendar';
  propertyId: string | number;
  roomTypeId?: string | number | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  currencyCode: string;
  nightlySubtotal: number;
  additionalGuestSubtotal: number;
  total: number;
  totalLabel: string | null;
  averageNightlyLabel: string | null;
  minStay: number | null;
  maxStay: number | null;
  isMinimumStayValid: boolean;
  message: string;
  breakdown: Array<{
    date: string;
    baseRate: number;
    additionalGuestRate: number;
    additionalGuests: number;
    totalRate: number;
    minStay: number | null;
    maxStay: number | null;
  }>;
};

const toDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const eachDateInclusive = (start: string, end: string) => {
  const dates: string[] = [];
  let cursor = toDate(start);
  const finalDate = toDate(end);

  while (cursor <= finalDate) {
    dates.push(toISODate(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
};

const eachNightInRange = (checkIn: string, checkOut: string) => {
  const nights: string[] = [];
  let cursor = toDate(checkIn);
  const finalDate = toDate(checkOut);

  while (cursor < finalDate) {
    nights.push(toISODate(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
};

const hasDateRange = (checkIn?: string, checkOut?: string) => {
  if (!checkIn || !checkOut) return false;
  return toDate(checkOut) > toDate(checkIn);
};

const normalizeGuestCount = (params: VillaSearchParams) => {
  if (params.guests) return params.guests;
  return Number(params.adults || 0) + Number(params.children || 0) || 1;
};

const getCapacityFromRooms = (rooms: any[] = [], property: any = {}) => {
  const roomCapacities = rooms
    .map((room) => Number(room?.max_people || 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  return Math.max(
    Number(property.max_people || property.max_guests || 0),
    ...roomCapacities,
    0
  );
};

const getComparablePrice = (property: any) => {
  const price = Number(property.original_min_price || property.min_price || 0);
  return Number.isFinite(price) ? price : 0;
};

const pickPriceRule = (prices: any[] = [], nights: number) => {
  return prices.find((price) => {
    const minStay = Number(price?.min_stay || 1);
    const maxStay = Number(price?.max_stay || 9999);
    return nights >= minStay && nights <= maxStay;
  }) || prices[0] || null;
};

const getPrimaryRoomTypeId = (rooms: any[] = []) => {
  const room = rooms.find((item) => item?.id) || rooms[0];
  return room?.id || null;
};

const matchesLocation = (property: any, location?: string) => {
  if (!location || location.toLowerCase() === 'all') return true;

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
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
};

const buildAvailabilityMapFromItems = (
  availabilityItems: any[],
  propertyId: string | number,
  startDate: string,
  endDate: string
) => {
  const map: Record<string, AvailabilityDay> = {};

  eachDateInclusive(startDate, endDate).forEach((date) => {
    map[date] = {
      date,
      status: 'unknown',
      available: false,
      reason: 'unknown',
    };
  });

  availabilityItems
    .filter((item) => String(item.property_id) === String(propertyId))
    .forEach((item: any) => {
      (item.periods || []).forEach((period: any) => {
        const hasBookings = Array.isArray(period.bookings) && period.bookings.length > 0;
        const hasClosedPeriod = Boolean(period.closed_period);
        const isAvailable = Number(period.available || 0) > 0;
        const status: AvailabilityStatus = isAvailable
          ? 'available'
          : hasBookings
            ? 'booked'
            : hasClosedPeriod
              ? 'blocked'
              : 'unavailable';

        const reason = isAvailable
          ? 'available'
          : hasBookings
            ? 'booking'
            : hasClosedPeriod
              ? 'closed_period'
              : 'unavailable';

        eachDateInclusive(period.start, period.end).forEach((date) => {
          if (!map[date]) return;
          map[date] = {
            date,
            status,
            available: isAvailable,
            reason,
          };
        });
      });
    });

  return map;
};

export function buildLodgifyCheckoutUrl({
  propertyId,
  checkIn,
  checkOut,
  guests,
}: {
  propertyId: string | number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const url = new URL('https://lodgify.com/v2/direct-booking');
  url.searchParams.set('propertyId', String(propertyId));

  if (checkIn) {
    url.searchParams.set('checkIn', checkIn);
    url.searchParams.set('check_in', checkIn);
    url.searchParams.set('arrival', checkIn);
  }

  if (checkOut) {
    url.searchParams.set('checkOut', checkOut);
    url.searchParams.set('check_out', checkOut);
    url.searchParams.set('departure', checkOut);
  }

  if (guests) {
    url.searchParams.set('guests', String(guests));
    url.searchParams.set('adults', String(guests));
  }

  return url.toString();
}

export function getDirectBookingUrl(propertyId: string | number) {
  return buildLodgifyCheckoutUrl({ propertyId });
}

/**
 * Fetch all properties from Lodgify
 */
export async function getProperties() {
  try {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Properties API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data && data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        ...item,
        image_url: ensureProtocol(item.image_url)
      }));
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching Lodgify properties:', error);
    return [];
  }
}

/**
 * Fetch a single property details
 */
export async function getPropertyById(id: string | number) {
  if (!id) return null;
  
  try {
    const url = `${BASE_URL}/properties/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Lodgify Property Detail error for ID ${id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data) {
      data.image_url = ensureProtocol(data.image_url);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching Lodgify property ${id}:`, error);
    return null;
  }
}

/**
 * Fetch availability for a specific property
 */
export async function getAvailability(propertyId: number, startDate: string, endDate: string) {
  try {
    const response = await fetch(`${BASE_URL}/availability?start=${startDate}&end=${endDate}`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return null;
    const data = await response.json();

    if (!Array.isArray(data)) return [];
    return data.filter((item: any) => String(item.property_id) === String(propertyId));
  } catch (error) {
    console.error(`Error fetching availability for ${propertyId}:`, error);
    return null;
  }
}

/**
 * Fetch images for a specific property
 */
export async function getPropertyImages(id: string | number) {
  if (!id) return [];

  try {
    const url = `${BASE_URL}/properties/${id}/images`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Images error for ID ${id}: ${response.status}`);
      return [];
    }

    const images = await response.json();
    if (Array.isArray(images)) {
      return images.map((img: any) => ({
        ...img,
        url: ensureProtocol(img.url)
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching images for property ${id}:`, error);
    return [];
  }
}

/**
 * Fetch rooms for a specific property (includes amenities info)
 */
export async function getPropertyRooms(id: string | number) {
  if (!id) return [];

  try {
    const url = `${BASE_URL}/properties/${id}/rooms`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Rooms error for ID ${id}: ${response.status}`);
      return [];
    }

    const rooms = await response.json();
    if (Array.isArray(rooms)) {
      return rooms.map((room: any) => ({
        ...room,
        image_url: ensureProtocol(room.image_url)
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching rooms for property ${id}:`, error);
    return [];
  }
}

export async function getVillaSummaries() {
  const properties = await getProperties();

  if (!Array.isArray(properties)) return [];

  return properties
    .map((property: any) => ({
      id: property.id,
      name: property.name,
      location: property.city || property.location?.name || 'Bali',
      description: stripHtml(property.description),
      imageUrl: ensureProtocol(property.image_url) || '/homepage_villa/VillaZen.webp',
      priceLabel: getRealPriceLabel(property),
      originalPriceLabel: formatPrice(property.original_min_price, property.currency_code || 'IDR'),
      priceValue: getComparablePrice(property),
      currencyCode: property.currency_code || 'IDR',
      isFeatured: Boolean(property.is_featured),
      guests: property.max_people || property.max_guests || null,
      bedrooms: property.bedrooms || property.rooms_count || null,
      bathrooms: property.bathrooms || property.bathrooms_count || null,
    }))
    .filter((villa) => villa.id && villa.name);
}

export async function getVillaDetail(id: string | number) {
  const [property, rooms] = await Promise.all([
    getPropertyById(id),
    getPropertyRooms(id),
  ]);

  if (!property) return null;

  const facts = getRoomFacts(rooms, property);
  const images = getImageSet(property, rooms);
  const imageGallery = getImageGallery(property, rooms);
  const amenities = unique([
    ...flattenAmenities(property.amenities),
    ...rooms.flatMap((room: any) => flattenAmenities(room.amenities)),
  ]);
  const realPriceLabel = getRealPriceLabel(property);

  return {
    id: property.id,
    name: property.name,
    internalName: property.internal_name,
    descriptionHtml: property.description || '',
    descriptionText: stripHtml(property.description),
    address: [property.address, property.city, property.country].filter(Boolean).join(', '),
    city: property.city || 'Bali',
    country: property.country || 'Indonesia',
    latitude: property.latitude,
    longitude: property.longitude,
    imageUrl: images[0] || '/homepage_villa/VillaZen.webp',
    images,
    imageGallery,
    amenities,
    amenityGroups: getAmenityGroups(property, rooms),
    amenitiesPreview: getAmenityPreview(rooms),
    rating: Number(property.rating || 0),
    priceLabel: realPriceLabel,
    originalPriceLabel: formatPrice(property.original_min_price, property.currency_code || 'IDR'),
    maxPriceLabel: formatPrice(property.max_price, property.currency_code || 'IDR'),
    currencyCode: property.currency_code || 'IDR',
    bookingUrl: getDirectBookingUrl(property.id),
    contact: property.contact || null,
    roomTypeId: getPrimaryRoomTypeId(rooms),
    rooms,
    ...facts,
  };
}

export async function getAvailabilityForProperty(
  propertyId: string | number,
  startDate: string,
  endDate: string
) {
  return getAvailability(Number(propertyId), startDate, endDate);
}

export async function getAvailabilityMap(
  propertyId: string | number,
  startDate: string,
  endDate: string
) {
  const availability = await getAvailabilityForProperty(propertyId, startDate, endDate);

  if (!Array.isArray(availability)) {
    return buildAvailabilityMapFromItems([], propertyId, startDate, endDate);
  }

  return buildAvailabilityMapFromItems(availability, propertyId, startDate, endDate);
}

export async function getRateQuoteForProperty({
  propertyId,
  roomTypeId,
  checkIn,
  checkOut,
  guests = 1,
}: {
  propertyId: string | number;
  roomTypeId?: string | number | null;
  checkIn: string;
  checkOut: string;
  guests?: number;
}): Promise<LodgifyRateQuote | null> {
  if (!hasDateRange(checkIn, checkOut)) return null;

  const [property, rooms] = await Promise.all([
    getPropertyById(propertyId),
    roomTypeId ? Promise.resolve([]) : getPropertyRooms(propertyId),
  ]);

  if (!property) return null;

  const selectedRoomTypeId = roomTypeId || getPrimaryRoomTypeId(rooms);
  if (!selectedRoomTypeId) return null;

  const nights = eachNightInRange(checkIn, checkOut);
  const endNight = nights[nights.length - 1];
  const guestCount = Math.max(1, Number(guests || 1));
  const currencyCode = property.currency_code || 'IDR';

  const params = new URLSearchParams({
    houseId: String(propertyId),
    roomTypeId: String(selectedRoomTypeId),
    startDate: checkIn,
    endDate: endNight,
  });

  const response = await fetch(`${BASE_URL}/rates/calendar?${params.toString()}`, {
    method: 'GET',
    headers: {
      'X-ApiKey': LODGIFY_API_KEY || '',
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.error(`Lodgify Rates API error for property ${propertyId}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const calendarItems = Array.isArray(data?.calendar_items) ? data.calendar_items : [];
  const defaultItem = calendarItems.find((item: any) => item?.is_default);
  const itemsByDate = new Map(
    calendarItems
      .filter((item: any) => item?.date)
      .map((item: any) => [item.date, item])
  );

  const breakdown = nights.map((date) => {
    const item: any = itemsByDate.get(date) || defaultItem || {};
    const rule = pickPriceRule(item.prices, nights.length);
    const baseRate = Number(rule?.price_per_day || 0);
    const additionalGuestRate = Number(rule?.price_per_additional_guest || 0);
    const additionalGuestsStartFrom = Number(rule?.additional_guests_starts_from || 0);
    const additionalGuests = additionalGuestRate > 0 && additionalGuestsStartFrom > 0
      ? Math.max(0, guestCount - additionalGuestsStartFrom)
      : 0;
    const additionalGuestTotal = additionalGuests * additionalGuestRate;

    return {
      date,
      baseRate,
      additionalGuestRate,
      additionalGuests,
      totalRate: baseRate + additionalGuestTotal,
      minStay: Number.isFinite(Number(rule?.min_stay)) ? Number(rule.min_stay) : null,
      maxStay: Number.isFinite(Number(rule?.max_stay)) ? Number(rule.max_stay) : null,
    };
  });

  const nightlySubtotal = breakdown.reduce((total, item) => total + item.baseRate, 0);
  const additionalGuestSubtotal = breakdown.reduce(
    (total, item) => total + (item.additionalGuestRate * item.additionalGuests),
    0
  );
  const total = breakdown.reduce((sum, item) => sum + item.totalRate, 0);
  const minStayValues = breakdown.map((item) => item.minStay).filter((value): value is number => Boolean(value));
  const maxStayValues = breakdown.map((item) => item.maxStay).filter((value): value is number => Boolean(value));
  const minStay = minStayValues.length ? Math.max(...minStayValues) : null;
  const maxStay = maxStayValues.length ? Math.min(...maxStayValues) : null;
  const isMinimumStayValid = minStay ? nights.length >= minStay : true;

  return {
    success: true,
    source: 'lodgify-rates-calendar',
    propertyId,
    roomTypeId: selectedRoomTypeId,
    checkIn,
    checkOut,
    guests: guestCount,
    nights: nights.length,
    currencyCode,
    nightlySubtotal,
    additionalGuestSubtotal,
    total,
    totalLabel: formatPrice(total, currencyCode),
    averageNightlyLabel: formatPrice(total / Math.max(1, nights.length), currencyCode),
    minStay,
    maxStay,
    isMinimumStayValid,
    message: isMinimumStayValid
      ? 'Rate total from Lodgify rates calendar. Final taxes, fees, and payment are confirmed by Lodgify checkout.'
      : `Minimum stay is ${minStay} nights for these dates.`,
    breakdown,
  };
}

export function isRangeAvailable(
  availabilityMap: Record<string, AvailabilityDay>,
  checkIn?: string,
  checkOut?: string
) {
  if (!hasDateRange(checkIn, checkOut)) return false;

  return eachNightInRange(checkIn as string, checkOut as string).every((date) => {
    return availabilityMap[date]?.available === true;
  });
}

export async function getVillaSearchOptions() {
  const properties = await getProperties();
  const activeProperties = properties.filter((property: any) => property.is_active !== false);
  const locationSet = new Set<string>();
  const prices = activeProperties
    .map((property: any) => getComparablePrice(property))
    .filter((price: number) => price > 0);

  activeProperties.forEach((property: any) => {
    if (property.country_code === 'ID' || /bali|canggu|ubud|seminyak|legian|kerobokan/i.test([
      property.state,
      property.city,
      property.address,
      property.name,
    ].filter(Boolean).join(' '))) {
      locationSet.add('Indonesia');
    }

    [property.country, property.state, property.city, property.address]
      .filter(Boolean)
      .forEach((value) => locationSet.add(String(value)));
  });

  const priority = ['Indonesia', 'Bali', 'Canggu', 'Canggu - Berawa', 'Canggu - Padonan', 'Kerobokan', 'Legian', 'Ubud'];
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

export async function searchAvailableVillas(params: VillaSearchParams = {}) {
  const properties = await getProperties();
  const hasDates = hasDateRange(params.checkIn, params.checkOut);
  const guests = normalizeGuestCount(params);
  let availabilityByProperty: Record<string, Record<string, AvailabilityDay>> = {};
  let availabilityItems: any[] = [];

  if (hasDates) {
    const availability = await fetch(`${BASE_URL}/availability?start=${params.checkIn}&end=${params.checkOut}`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (availability.ok) {
      const data = await availability.json();
      if (Array.isArray(data)) {
        availabilityItems = data;
      }
    }

    properties.forEach((property: any) => {
      availabilityByProperty[String(property.id)] = buildAvailabilityMapFromItems(
        availabilityItems,
        property.id,
        params.checkIn as string,
        params.checkOut as string
      );
    });
  }

  const detailed = await Promise.all(properties.map(async (property: any) => {
    const rooms = await getPropertyRooms(property.id);
    const facts = getRoomFacts(rooms, property);
    const images = getImageSet(property, rooms);
    const capacity = getCapacityFromRooms(rooms, property) || facts.guests;
    const amenitiesPreview = getAmenityPreview(rooms);

    return {
      id: property.id,
      name: property.name,
      location: property.city || property.location?.name || property.address || 'Bali',
      description: stripHtml(property.description),
      imageUrl: images[0] || ensureProtocol(property.image_url) || '/homepage_villa/VillaZen.webp',
      priceLabel: getRealPriceLabel(property),
      originalPriceLabel: formatPrice(property.original_min_price, property.currency_code || 'IDR'),
      priceValue: getComparablePrice(property),
      currencyCode: property.currency_code || 'IDR',
      capacity,
      amenitiesPreview,
      rating: Number(property.rating || 0),
      isFeatured: Boolean(property.is_featured),
      isAvailableForSearch: hasDates
        ? isRangeAvailable(availabilityByProperty[String(property.id)] || {}, params.checkIn, params.checkOut)
        : true,
      ...facts,
    };
  }));

  return detailed.filter((villa: any) => {
    const property = properties.find((item: any) => String(item.id) === String(villa.id)) || {};
    if (!villa.id || !villa.name) return false;
    if (!matchesLocation(property, params.location)) return false;
    if (guests > villa.capacity) return false;
    if (params.minPrice && villa.priceValue && villa.priceValue < params.minPrice) return false;
    if (params.maxPrice && villa.priceValue && villa.priceValue > params.maxPrice) return false;
    if (!villa.isAvailableForSearch) return false;
    return true;
  });
}
