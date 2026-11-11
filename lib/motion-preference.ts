export type MotionPreference = "system" | "full" | "reduced";
export const MOTION_STORAGE_KEY = "summerhouse.motion";

export function parseMotionPreference(value: string | null): MotionPreference | null {
  return value === "system" || value === "full" || value === "reduced" ? value : null;
}

export function initialMotionPreference(hostname: string, stored: string | null, query: string | null): MotionPreference {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".test");
  return parseMotionPreference(query) ?? parseMotionPreference(stored) ?? (local ? "full" : "system");
}

export function resolveReducedMotion(preference: MotionPreference, systemReduced: boolean): boolean {
  return preference === "system" ? systemReduced : preference === "reduced";
}
