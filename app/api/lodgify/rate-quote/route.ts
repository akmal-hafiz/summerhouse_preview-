import { NextRequest, NextResponse } from "next/server";
import { isValidDateRange } from "@/lib/date";
import { getRateQuoteForProperty } from "@/lib/lodgify";

const PUBLIC_ERROR = "Lodgify rates are temporarily unavailable. Final pricing will be confirmed at checkout.";

function isValidPropertyId(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9_-]+$/.test(value));
}

function clampGuests(value: string | null) {
  const numeric = Number(value || 1);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(40, Math.max(1, Math.floor(numeric)));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = clampGuests(searchParams.get("guests") || searchParams.get("adults"));

  if (!isValidPropertyId(propertyId) || !isValidDateRange(checkIn || undefined, checkOut || undefined)) {
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
        { success: false, error: "Unable to load Lodgify rate quote for those dates." },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("[lodgify:rate-quote]", {
      propertyId,
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      guests,
      message: error instanceof Error ? error.message : "Unknown rate quote error",
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
