import type { AvailabilityDay as CoreAvailabilityDay, AvailabilityStatus as CoreAvailabilityStatus } from "./availability";

export type LodgifyId = string | number;
export type AvailabilityStatus = CoreAvailabilityStatus;
export type AvailabilityDay = CoreAvailabilityDay;

export type LodgifyAmenity = {
  text?: string;
  name?: string;
};

export type LodgifyImage = {
  url?: string;
  text?: string;
};

export type LodgifyRoom = {
  id?: LodgifyId;
  name?: string;
  image_url?: string;
  images?: LodgifyImage[];
  amenities?: unknown;
  max_people?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export type LodgifyProperty = {
  id?: LodgifyId;
  name?: string;
  internal_name?: string;
  description?: string;
  image_url?: string;
  images?: LodgifyImage[];
  amenities?: unknown;
  original_min_price?: number;
  original_max_price?: number;
  min_price?: number;
  max_price?: number;
  currency_code?: string;
  city?: string;
  country?: string;
  country_code?: string;
  state?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location?: { name?: string };
  is_active?: boolean;
  is_featured?: boolean;
  rating?: number;
  max_people?: number;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  rooms_count?: number;
  bathrooms_count?: number;
  contact?: unknown;
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
  source: "lodgify-rates-calendar";
  propertyId: LodgifyId;
  roomTypeId?: LodgifyId | null;
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

export type VillaSummary = {
  id: LodgifyId;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  priceLabel: string | null;
  originalPriceLabel: string | null;
  priceValue: number;
  currencyCode: string;
  isFeatured: boolean;
  guests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
};

export type VillaSearchResult = VillaSummary & {
  capacity: number;
  amenitiesPreview: string[];
  rating: number;
  isAvailableForSearch: boolean;
};

export type FeaturedCollectionVilla = {
  id: LodgifyId;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  priceLabel: string | null;
  guests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  href: string;
  images?: string[];
};

export type HomepageStayVilla = FeaturedCollectionVilla & {
  amenitiesPreview: string[];
  priceValue: number;
};

export type HomepageStayGroup = {
  id: "short-stays" | "extended-stays" | "featured-homes";
  label: string;
  description: string;
  villas: HomepageStayVilla[];
};

export type SignatureVilla = HomepageStayVilla & {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** CMS-editable "Why this home" copy. Falls back to subtitle when empty. */
  whyThisHome: string;
  address: string;
  images: string[];
};

export type VillaDetail = {
  id: LodgifyId;
  name: string;
  internalName?: string;
  descriptionHtml: string;
  descriptionText: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  images: string[];
  imageGallery: Array<{ url: string; caption: string }>;
  amenities: string[];
  amenityGroups: Array<{ key: string; title: string; items: string[] }>;
  amenitiesPreview: string[];
  rating: number;
  priceLabel: string | null;
  originalPriceLabel: string | null;
  maxPriceLabel: string | null;
  currencyCode: string;
  bookingUrl: string;
  contact: unknown;
  roomTypeId: LodgifyId | null;
  rooms: LodgifyRoom[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
};

export type PortfolioStats = {
  /** Count of unique, active, publicly displayable Lodgify properties. Null when Lodgify is unreachable and no cached data exists. */
  homesCount: number | null;
};
