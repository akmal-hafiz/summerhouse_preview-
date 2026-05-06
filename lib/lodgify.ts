const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY;
const BASE_URL = process.env.LODGIFY_API_BASE_URL || 'https://api.lodgify.com/v2';

if (!LODGIFY_API_KEY) {
  console.warn('Warning: LODGIFY_API_KEY is not defined in environment variables.');
}

/**
 * Helper to ensure image URLs have https protocol
 */
const ensureProtocol = (url: string) => {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
};

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
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Properties API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (data && data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        ...item,
        image_url: ensureProtocol(item.image_url)
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
  if (!id) return null;
  
  try {
    const url = `${BASE_URL}/properties/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Lodgify Property Detail error for ID ${id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data) {
      data.image_url = ensureProtocol(data.image_url);
    }
    return data;
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

    if (!response.ok) return null;
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
  if (!id) return [];

  try {
    const url = `${BASE_URL}/properties/${id}/images`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Images error for ID ${id}: ${response.status}`);
      return [];
    }

    const images = await response.json();
    if (Array.isArray(images)) {
      return images.map((img: any) => ({
        ...img,
        url: ensureProtocol(img.url)
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching images for property ${id}:`, error);
    return [];
  }
}

/**
 * Fetch rooms for a specific property (includes amenities info)
 */
export async function getPropertyRooms(id: string | number) {
  if (!id) return [];

  try {
    const url = `${BASE_URL}/properties/${id}/rooms`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ApiKey': LODGIFY_API_KEY || '',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`Lodgify Rooms error for ID ${id}: ${response.status}`);
      return [];
    }

    const rooms = await response.json();
    if (Array.isArray(rooms)) {
      return rooms.map((room: any) => ({
        ...room,
        image_url: ensureProtocol(room.image_url)
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching rooms for property ${id}:`, error);
    return [];
  }
}
