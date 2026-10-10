import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { allowedSessionRoute, SESSION_MAX_AGE, sessionOriginAllowed } from "@/lib/security/session-policy";
import { getTrustedClientIp, rateLimitRequest } from "@/lib/security/rateLimit";
import { logServerWarning } from "@/lib/security/logger";

export const runtime = "nodejs";
const production = process.env.NODE_ENV === "production";
const sessionName = production ? "__Host-smh-session" : "smh-session";
const csrfName = production ? "__Host-smh-csrf" : "smh-csrf";
const cookieOptions = { httpOnly: true, secure: production, sameSite: "lax" as const, path: "/" };
const noStore = { "Cache-Control": "no-store", "Vary": "Cookie" };

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join("/");
  if (path === "csrf" && request.method === "GET") {
    const nonce = request.cookies.get(csrfName)?.value || randomBytes(32).toString("hex");
    const response = NextResponse.json({ csrfToken: nonce }, { headers: noStore });
    response.cookies.set(csrfName, nonce, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
    return response;
  }
  if (!allowedSessionRoute(path, request.method)) return NextResponse.json({ message: "Not found" }, { status: 404, headers: noStore });
  if (request.method !== "GET") {
    const nonce = request.cookies.get(csrfName)?.value || "";
    const supplied = request.headers.get("x-csrf-token") || "";
    if (!sessionOriginAllowed(request.headers.get("origin"), request.nextUrl.origin) ||
      !/^[a-f0-9]{64}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(supplied) ||
      !timingSafeEqual(Buffer.from(nonce), Buffer.from(supplied))) {
      return NextResponse.json({ message: "Session verification failed. Please refresh and try again." }, { status: 403, headers: noStore });
    }
  }
  const limited = rateLimitRequest(request, { key: "session", limit: 40 });
  if (limited) return limited;
  const token = request.cookies.get(sessionName)?.value;
  if (path === "auth/user" && !token) return NextResponse.json({ success: false, user: null }, { headers: noStore });
  if (path === "auth/logout" && !token) return clearSession(NextResponse.json({ success: true }, { headers: noStore }));
  try {
    const base = process.env.CMS_API_URL || "http://localhost:8000/api";
    const upstream = new URL(`${base.replace(/\/$/, "")}/v1/${path}`);
    if (upstream.username || upstream.password || upstream.search || upstream.hash ||
      (production && upstream.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(upstream.hostname))) {
      throw new Error("Invalid session upstream configuration");
    }
    let body: string | ArrayBuffer | undefined;
    let upstreamContentType = "application/json";
    if (request.method !== "GET" && request.method !== "DELETE") {
      const contentType = request.headers.get("content-type") || "";
      const avatarUpload = path === "auth/avatar" && request.method === "POST";
      if (avatarUpload ? !/^multipart\/form-data;\s*boundary=[\w'()+,./:=?-]+$/i.test(contentType) : !contentType.startsWith("application/json")) {
        return NextResponse.json({ message: "JSON required" }, { status: 415, headers: noStore });
      }
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > (avatarUpload ? 3_300_000 : 16_384)) {
            await reader.cancel();
            return NextResponse.json({ message: "Request too large" }, { status: 413, headers: noStore });
          }
          chunks.push(value);
        }
      }
      const received = Buffer.concat(chunks);
      if (avatarUpload) {
        body = Uint8Array.from(received).buffer;
        upstreamContentType = contentType;
      } else {
      const rawBody = received.toString("utf8");
      let parsed;
      try {
        // Logout has no domain payload. Accept an empty body for compatibility
        // with an older cached frontend bundle, but keep every other JSON write
        // strict so malformed input still fails closed.
        parsed = rawBody.length === 0 && path === "auth/logout" ? {} : JSON.parse(rawBody);
      }
      catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400, headers: noStore }); }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ message: "JSON object required" }, { status: 400, headers: noStore });
      }
      if (parsed && typeof parsed.email === "string") parsed.email = parsed.email.trim().toLowerCase();
      body = JSON.stringify(parsed);
      }
    }
    const result = await fetch(upstream, {
      method: request.method, body, cache: "no-store", redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json", "Content-Type": upstreamContentType, ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(getTrustedClientIp(request) ? { "X-Forwarded-For": getTrustedClientIp(request)! } : {}),
      },
    });
    const payload = await result.json();
    const issuedToken = typeof payload.token === "string" ? payload.token : null;
    delete payload.token;
    const response = NextResponse.json(result.status >= 500 ? { success: false, message: "Service temporarily unavailable. Please try again." } : payload, { status: result.status, headers: noStore });
    if (issuedToken && result.ok && ["auth/login", "auth/register/verify-otp"].includes(path)) {
      response.cookies.set(sessionName, issuedToken, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
    }
    // A logout attempt must remove the browser credential even when the
    // upstream API reports an error. This prevents a stale bearer cookie from
    // silently restoring the session after the user chose to sign out.
    if (path === "auth/logout" || result.status === 401) clearSession(response);
    return response;
  } catch (error) {
    logServerWarning("[session:upstream-failure]", { operation: path, error_type: error instanceof Error ? error.name : "Unknown" });
    const response = NextResponse.json({ success: false, message: "Service temporarily unavailable. Please try again." }, { status: 503, headers: noStore });
    return path === "auth/logout" ? clearSession(response) : response;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.set(sessionName, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export { handle as GET, handle as POST, handle as DELETE };
