import { NextRequest, NextResponse } from "next/server";
import { isISODate, isValidDateRange, parseISODate } from "@/lib/date";
import { getAvailabilityMap, isRangeAvailable } from "@/lib/lodgify";

const PUBLIC_ERROR = "Availability is temporarily unavailable. Please try again.";

function isValidPropertyId(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9_-]+$/.test(value));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;

  if (!isValidPropertyId(propertyId) || !isISODate(start) || !isISODate(end)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid villa and date window." },
      { status: 400 }
    );
  }

  if (parseISODate(end) < parseISODate(start)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid availability window." },
      { status: 400 }
    );
  }

  const safePropertyId = propertyId as string;
  const safeStart = start as string;
  const safeEnd = end as string;

  if (checkIn || checkOut) {
    if (!isValidDateRange(checkIn, checkOut)) {
      return NextResponse.json(
        { success: false, error: "Please choose a valid check-in and check-out date." },
        { status: 400 }
      );
    }
  }

  try {
    const map = await getAvailabilityMap(safePropertyId, safeStart, safeEnd);

    return NextResponse.json({
      success: true,
      propertyId: safePropertyId,
      start: safeStart,
      end: safeEnd,
      map,
      rangeAvailable: checkIn && checkOut ? isRangeAvailable(map, checkIn, checkOut) : null,
    });
  } catch (error) {
    console.error("[lodgify:availability]", {
      propertyId,
      start: safeStart,
      end: safeEnd,
      message: error instanceof Error ? error.message : "Unknown availability error",
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
