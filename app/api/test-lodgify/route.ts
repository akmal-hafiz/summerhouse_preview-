import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/lodgify';

export async function GET() {
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
