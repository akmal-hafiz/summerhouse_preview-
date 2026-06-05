import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityMap, isRangeAvailable } from "@/lib/lodgify";
import { logServerError } from "@/lib/security/logger";
import { rateLimitRequest } from "@/lib/security/rateLimit";
import { isValidPublicId, validateDateWindow, validateStayRange } from "@/lib/security/validation";

const PUBLIC_ERROR = "Availability is temporarily unavailable. Please try again.";

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: "lodgify-availability", limit: 90, windowMs: 60_000 });
  if (limited) return limited;

  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;

  if (!isValidPublicId(propertyId) || !validateDateWindow(start, end, 370)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid villa and date window." },
      { status: 400 }
    );
  }

  const safePropertyId = propertyId as string;
  const safeStart = start as string;
  const safeEnd = end as string;

  if (checkIn || checkOut) {
    if (!validateStayRange(checkIn, checkOut, 90)) {
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
    logServerError("[lodgify:availability]", error, {
      propertyId,
      start: safeStart,
      end: safeEnd,
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
