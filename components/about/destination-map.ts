// Geometry for the About destination map: two static, label-free maps drawn from OpenStreetMap data
// (© OpenStreetMap contributors, ODbL) in the brand palette, plus Web Mercator projection onto them.
// shortcut: the coast map covers Pererenan down to the airport and the locator the whole island; regenerate them
// (carved-frames skill, brand map script) if Summerhouse adds areas outside both.

export type MapBounds = { west: number; north: number; east: number; south: number };
export type StaticMap = { src: string; width: number; height: number; bounds: MapBounds };
export type GeoPoint = { longitude: number; latitude: number };

export const COAST_MAP: StaticMap = {
  src: "/about/destination-map-coast.webp",
  width: 1500,
  height: 1811,
  bounds: { west: 115.06, north: -8.605, east: 115.215, south: -8.79 },
};

export const BALI_MAP: StaticMap = {
  src: "/about/destination-map-bali.webp",
  width: 495,
  height: 324,
  bounds: { west: 114.4, north: -8.02, east: 115.76, south: -8.9 },
};

/** Ngurah Rai International Airport (DPS), the one place every guest knows: the map's reference point. */
export const AIRPORT: GeoPoint & { name: string } = { name: "Ngurah Rai Airport", longitude: 115.1675, latitude: -8.7482 };

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Position of a coordinate on a map as fractions (0 to 1) of its width and height, or null when it falls outside. */
export function projectToMap(bounds: MapBounds, longitude: number, latitude: number) {
  const x = (longitude - bounds.west) / (bounds.east - bounds.west);
  const y = (mercator(bounds.north) - mercator(latitude)) / (mercator(bounds.north) - mercator(bounds.south));
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

/** Labels sit right of their dot. They flip left when another dot is close on the right at the same height,
 *  and sit above the dot in the east third, which the frame crops first on narrow screens. */
export function labelSides(points: { x: number; y: number }[]): ("left" | "right" | "top")[] {
  return points.map((point, index) => {
    if (point.x > 0.68) return "top";
    const crowded = points.some((other, otherIndex) => otherIndex !== index
      && other.x > point.x && other.x - point.x < 0.13
      && Math.abs(other.y - point.y) < 0.035);
    return crowded ? "left" : "right";
  });
}

/** Straight-line distance in whole kilometres (haversine). */
export function kmBetween(a: GeoPoint, b: GeoPoint) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
