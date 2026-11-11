import type { LodgifyRateResult } from "./types";

export function toPublicRateCheck(quote: LodgifyRateResult) {
  return {
    success: true,
    isMinimumStayValid: quote.isMinimumStayValid,
    minStay: quote.minStay,
    maxStay: quote.maxStay,
    message: quote.message,
  };
}
