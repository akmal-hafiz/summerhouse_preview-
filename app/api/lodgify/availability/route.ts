import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityMap, isRangeAvailable } from "@/lib/lodgify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;

  if (!propertyId || !start || !end) {
    return NextResponse.json(
      { success: false, error: "propertyId, start, and end are required." },
      { status: 400 }
    );
  }

  try {
    const map = await getAvailabilityMap(propertyId, start, end);

    return NextResponse.json({
      success: true,
      propertyId,
      start,
      end,
      map,
      rangeAvailable: checkIn && checkOut ? isRangeAvailable(map, checkIn, checkOut) : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to load availability.",
      },
      { status: 500 }
    );
  }
}
