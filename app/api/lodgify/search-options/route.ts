import { NextResponse } from "next/server";
import { getVillaSearchOptions } from "@/lib/lodgify";

export async function GET() {
  try {
    const options = await getVillaSearchOptions();
    return NextResponse.json({ success: true, ...options });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to load search options.",
      },
      { status: 500 }
    );
  }
}
