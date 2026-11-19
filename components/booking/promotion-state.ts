/** Where a promotion code stands for the stay on screen. Keys are `propertyId|roomTypeId|checkIn|checkOut|guests`. */
export type PromotionState = {
  appliedCode: string;
  /** The stay Lodgify last priced the code for. */
  quoteKey: string;
  /** The stay the code was last refused (or could not be checked) for. */
  failedKey: string;
  stayKey: string;
  loading: boolean;
};

/**
 * The code a link ("Use code") starts with. Without a room type nothing can price the code, and an applied code that
 * is never priced would hold booking forever, so it starts unapplied (the page still shows "From" and checkout works).
 */
export function initialAppliedCode(code: string, roomTypeId: string | number | null | undefined): string {
  return roomTypeId ? code : "";
}

const pricedForStay =(s: PromotionState) => Boolean(s.appliedCode) && s.quoteKey === s.stayKey && !s.loading;

/** Booking waits only while a code is checked for this stay; a refused code never blocks it (the guest books without it). */
export function canBookWithPromotion(s: PromotionState): boolean {
  return !s.appliedCode || pricedForStay(s) || (!s.loading && s.failedKey === s.stayKey);
}

/** The code checkout should carry: only one Lodgify priced for exactly this stay. */
export function checkoutPromotion(s: PromotionState): string | undefined {
  return pricedForStay(s) ? s.appliedCode : undefined;
}
