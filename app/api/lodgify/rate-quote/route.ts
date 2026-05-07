import { NextRequest, NextResponse } from "next/server";
import { getRateQuoteForProperty } from "@/lib/lodgify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("propertyId");
  const roomTypeId = searchParams.get("roomTypeId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = Number(searchParams.get("guests") || searchParams.get("adults") || 1);

  if (!propertyId || !checkIn || !checkOut) {
    return NextResponse.json(
      { success: false, error: "propertyId, checkIn, and checkOut are required." },
      { status: 400 }
    );
  }

  try {
    const quote = await getRateQuoteForProperty({
      propertyId,
      roomTypeId,
      checkIn,
      checkOut,
      guests: Number.isFinite(guests) ? guests : 1,
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Unable to load Lodgify rate quote for those dates." },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to load rate quote.",
      },
      { status: 500 }
    );
  }
}
