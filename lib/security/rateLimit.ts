import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isIP } from "node:net";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function getTrustedClientIp(request: NextRequest): string | null {
  // Only enable when ingress strips and overwrites this header and origin is private.
  const header = process.env.TRUSTED_CLIENT_IP_HEADER;
  if (!header || !/^[a-z0-9-]+$/i.test(header)) return null;
  const value = request.headers.get(header)?.trim();
  if (!value || value.length > 64 || !isIP(value)) return null;
  return value;
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
  if (buckets.size >= MAX_BUCKETS) {
    for (const [id, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(id);
    }
  }
  const bucketKey = `${key}:${getTrustedClientIp(request) || "shared"}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    if (!current && buckets.size >= MAX_BUCKETS) {
      return NextResponse.json({ success: false, error: "Please try again shortly." }, {
        status: 429, headers: { "Retry-After": "60" },
      });
    }
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
