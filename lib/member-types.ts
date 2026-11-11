/** Member data shapes used by the dashboard UI. The preview has no member backend; these types only describe the API responses. */
export type SearchEntry = {
  kind: "search" | "view";
  propertyId?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  quotedTotal?: number;
  currency?: string;
};

export type HistoryItem = SearchEntry & { id: number; seenAt: string };

export type MemberCoupon = { code: string; title: string; description: string | null; terms: string | null; expiresAt: string | null };
