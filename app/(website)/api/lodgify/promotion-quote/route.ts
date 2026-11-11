import { NextResponse } from "next/server";

// Client preview: promotion quotes need the member backend, which this preview does not include.
const unavailable = () =>
  NextResponse.json(
    { success: false, message: "Promotion quotes are unavailable in this preview." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );

export const GET = unavailable;
export const POST = unavailable;
