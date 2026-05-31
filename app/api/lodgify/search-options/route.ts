import { NextResponse } from "next/server";
import { getVillaSearchOptions } from "@/lib/lodgify";

export async function GET() {
  try {
    const options = await getVillaSearchOptions();
    return NextResponse.json({ success: true, ...options });
  } catch (error) {
    console.error("[lodgify:search-options]", {
      message: error instanceof Error ? error.message : "Unknown search options error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Search filters are temporarily limited. Please try again.",
      },
      { status: 500 }
    );
  }
}
