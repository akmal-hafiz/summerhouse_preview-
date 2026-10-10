import { NextRequest, NextResponse } from "next/server";
import { getRateQuoteForProperty } from "@/lib/lodgify";
import { logServerError } from "@/lib/security/logger";
import { rateLimitRequest } from "@/lib/security/rateLimit";
import { isValidPublicId, validateStayRange } from "@/lib/security/validation";
import type { LodgifyRateResult } from "@/lib/lodgify/types";

const PUBLIC_ERROR = "Rates are temporarily unavailable. Final pricing will be confirmed at checkout.";
const NO_STORE = { "Cache-Control": "no-store" };

export function toPublicRateCheck(quote: LodgifyRateResult) {
  return {
    success: true,
    isMinimumStayValid: quote.isMinimumStayValid,
    minStay: quote.minStay,
    maxStay: quote.maxStay,
    message: quote.message,
  };
}

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: "lodgify-rate-quote", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const searchParams = request.nextUrl.searchParams;
  const duplicateInput = ["propertyId", "roomTypeId", "checkIn", "checkOut", "guests", "adults"]
    .some((key) => searchParams.getAll(key).length > 1);
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const rawGuests = searchParams.get("guests") ?? searchParams.get("adults") ?? "1";
  const guests = /^[1-9]\d?$/.test(rawGuests) ? Number(rawGuests) : NaN;

  if (duplicateInput || (searchParams.has("guests") && searchParams.has("adults"))
    || !isValidPublicId(propertyId) || (roomTypeId !== null && !isValidPublicId(roomTypeId))
    || !validateStayRange(checkIn, checkOut, 90) || !Number.isInteger(guests) || guests > 40) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid villa, check-in, and check-out date." },
      { status: 400, headers: NO_STORE }
    );
  }

  const safePropertyId = propertyId as string;
  const safeCheckIn = checkIn as string;
  const safeCheckOut = checkOut as string;

  try {
    const quote = await getRateQuoteForProperty({
      propertyId: safePropertyId,
      roomTypeId,
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      guests,
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Unable to load rates for those dates." },
        { status: 404, headers: NO_STORE }
      );
    }

    // The calendar does not include every checkout fee. Do not expose its subtotal as a payable total.
    return NextResponse.json(toPublicRateCheck(quote), { headers: NO_STORE });
  } catch (error) {
    logServerError("[lodgify:rate-quote]", error, {
      propertyId,
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      guests,
    });

    return NextResponse.json(
      {
        success: false,
        error: PUBLIC_ERROR,
      },
      { status: 500, headers: NO_STORE }
    );
  }
}
