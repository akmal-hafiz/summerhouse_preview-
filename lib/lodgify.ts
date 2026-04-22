const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || 'https://api.lodgify.com/v2';

if (!LODGIFY_API_KEY) {
  console.warn('Warning: LODGIFY_API_KEY is not defined in environment variables.');
}

export interface LodgifyProperty {
  id: number;
  name: string;
  description: string;
  image_url: string;
  // Tambahkan field lain sesuai kebutuhan dari Lodgify API
}

/**
 * Fetch all properties from Lodgify
 */
export async function getProperties() {
  try {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Lodgify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Lodgify returns { count, items: [...] }
    if (data && data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        ...item,
        // Ensure image URL has https: protocol if it starts with //
        image_url: item.image_url && item.image_url.startsWith('//') 
          ? `https:${item.image_url}` 
          : item.image_url
      }));
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching Lodgify properties:', error);
    return [];
  }
}

/**
 * Fetch a single property details
 */
export async function getPropertyById(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lodgify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Lodgify property ${id}:`, error);
    return null;
  }
}

/**
 * Fetch availability for a specific property
 */
export async function getAvailability(propertyId: number, startDate: string, endDate: string) {
  try {
    const response = await fetch(`${BASE_URL}/availability/${propertyId}?start=${startDate}&end=${endDate}`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Lodgify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching availability for ${propertyId}:`, error);
    return null;
  }
}

/**
 * Fetch images for a specific property
 */
export async function getPropertyImages(id: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/properties/${id}/images`, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Lodgify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching images for property ${id}:`, error);
    return [];
  }
}
