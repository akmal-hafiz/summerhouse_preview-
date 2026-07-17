import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimitRequest(
  request: NextRequest,
  {
    key,
    limit = 60,
    windowMs = 60_000,
  }: {
    key: string;
    limit?: number;
    windowMs?: number;
  }
) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(request)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= limit) return null;

  return NextResponse.json(
    { success: false, error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
      },
    }
  );
}
