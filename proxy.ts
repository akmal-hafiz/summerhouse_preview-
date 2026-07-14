import { NextResponse, type NextRequest } from "next/server";

const LANGUAGE_COOKIE = "summerhouse_language";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

type SiteLanguage = "en" | "id";

function isSiteLanguage(value: string | undefined): value is SiteLanguage {
  return value === "en" || value === "id";
}

/**
 * Layered language detection, strongest signal first:
 * 1. Cookie          — explicit user choice (or a previous detection). Always wins.
 * 2. Geo-IP header   — only present behind a proxy that injects it
 *                      (Cloudflare: cf-ipcountry, Vercel: x-vercel-ip-country).
 *                      Activates automatically once such a proxy is in front.
 * 3. Accept-Language — the browser's own language preference. Works on any host.
 * 4. Default         — "en".
 */
function detectLanguage(request: NextRequest): SiteLanguage {
  const country = (
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();
  if (country === "ID") return "id";
  if (country && country !== "XX" && country !== "T1") return "en";

  const acceptLanguage = (request.headers.get("accept-language") || "").toLowerCase();
  // Matches "id" or "id-ID" as a listed language, not substrings of other tags.
  if (/(^|,)\s*id(-[a-z]{2})?\s*(;|,|$)/.test(acceptLanguage)) return "id";

  return "en";
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const existing = request.cookies.get(LANGUAGE_COOKIE)?.value;
  if (isSiteLanguage(existing)) return response;

  response.cookies.set(LANGUAGE_COOKIE, detectLanguage(request), {
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Skip Next.js internals, API routes, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:webp|png|jpg|jpeg|svg|ico|css|js|woff2?)).*)"],
};
