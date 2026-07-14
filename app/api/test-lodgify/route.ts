import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getProperties } from '@/lib/lodgify';
import { logServerError } from '@/lib/security/logger';
import { rateLimitRequest } from '@/lib/security/rateLimit';

function hasValidAdminSecret(providedSecret: string | null, adminSecret: string | undefined) {
  if (!providedSecret || !adminSecret) return false;

  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(adminSecret);

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function GET(request: NextRequest) {
  const limited = rateLimitRequest(request, { key: 'test-lodgify', limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const adminSecret = process.env.ADMIN_API_SECRET;
  const providedSecret = request.headers.get('x-admin-secret');

  if (!hasValidAdminSecret(providedSecret, adminSecret)) {
    return NextResponse.json(
      { success: false, error: 'Not found' },
      { status: 404 }
    );
  }

  try {
    const properties = await getProperties();
    const safeProperties = Array.isArray(properties)
      ? properties.slice(0, 25).map((property) => ({
          id: property.id,
          name: property.name,
          city: property.city,
          country: property.country,
          is_active: property.is_active,
          has_coordinates: typeof property.latitude === 'number' && typeof property.longitude === 'number',
        }))
      : [];

    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(properties) ? properties.length : 'unknown',
      sample: safeProperties,
    });
  } catch (error) {
    logServerError('[test-lodgify]', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unable to verify Lodgify connection right now.'
    }, { status: 500 });
  }
}
