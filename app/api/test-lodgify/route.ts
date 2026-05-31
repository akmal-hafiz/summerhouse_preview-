import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/lodgify';

export async function GET(request: Request) {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminSecret = process.env.ADMIN_API_SECRET;
  const providedSecret = request.headers.get('x-admin-secret') || new URL(request.url).searchParams.get('secret');

  if (isProduction || adminSecret) {
    if (!adminSecret || providedSecret !== adminSecret) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
  }

  try {
    const properties = await getProperties();
    return NextResponse.json({ 
      success: true, 
      count: Array.isArray(properties) ? properties.length : 'unknown',
      data: properties 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
