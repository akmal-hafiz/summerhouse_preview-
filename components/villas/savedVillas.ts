export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";

export function readSavedVillaIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(SAVED_VILLAS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function writeSavedVillaIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_VILLAS_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
}

