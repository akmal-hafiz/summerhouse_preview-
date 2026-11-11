import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getVillaSearchOptions } from "@/lib/lodgify";
import { logServerError } from "@/lib/security/logger";
import { rateLimitRequest } from "@/lib/security/rateLimit";

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: "lodgify-search-options", limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const options = await getVillaSearchOptions();
    return NextResponse.json({ success: true, ...options });
  } catch (error) {
    logServerError("[lodgify:search-options]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Search filters are temporarily limited. Please try again.",
      },
      { status: 500 }
    );
  }
}
