import { NextRequest, NextResponse } from "next/server";
import { getRateQuoteForProperty } from "@/lib/lodgify";
import { logServerError } from "@/lib/security/logger";
import { rateLimitRequest } from "@/lib/security/rateLimit";
import { clampInteger, isValidPublicId, validateStayRange } from "@/lib/security/validation";

const PUBLIC_ERROR = "Rates are temporarily unavailable. Final pricing will be confirmed at checkout.";

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: "lodgify-rate-quote", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = clampInteger(searchParams.get("guests") || searchParams.get("adults"), 1, 40, 1);

  if (!isValidPublicId(propertyId) || !validateStayRange(checkIn, checkOut, 90)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid villa, check-in, and check-out date." },
      { status: 400 }
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
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
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
      { status: 500 }
    );
  }
}
