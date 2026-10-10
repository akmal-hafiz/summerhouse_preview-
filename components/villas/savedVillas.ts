import { getStoredAuthToken, sessionFetch } from "@/lib/auth-client";

export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";
export const SAVED_VILLAS_CHANGED_EVENT = "summerhouses:saved-villas-changed";
export const SAVED_VILLAS_ERROR_EVENT = "summerhouses:saved-villas-error";
const SAVED_VILLAS_OWNER_KEY = "summerhouses:saved-villas-owner";
let wishlistGeneration = 0;

export type SavedVillasChange = {
  ids: string[];
  count: number;
};

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

  const nextIds = Array.from(new Set(ids.map(String).filter(Boolean)));
  window.localStorage.setItem(SAVED_VILLAS_STORAGE_KEY, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent<SavedVillasChange>(SAVED_VILLAS_CHANGED_EVENT, {
    detail: {
      ids: nextIds,
      count: nextIds.length,
    },
  }));
}

export function clearSavedVillaIds() {
  if (typeof window === "undefined") return;
  wishlistGeneration += 1;
  window.localStorage.removeItem(SAVED_VILLAS_OWNER_KEY);
  writeSavedVillaIds([]);
}

export function getSavedVillasCount() {
  return readSavedVillaIds().length;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const response = await sessionFetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers || {}),
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchRemoteWishlist(): Promise<string[] | null> {
  const data = await apiFetch<{ success: boolean; ids: string[] }>("/v1/wishlist");
  return data?.success ? data.ids.map(String) : null;
}

export async function pushWishlistAdd(id: string): Promise<boolean> {
  const data = await apiFetch<{ success: boolean }>("/v1/wishlist", {
    method: "POST",
    body: JSON.stringify({ lodgify_property_id: id }),
  });
  return Boolean(data?.success);
}

export async function pushWishlistRemove(id: string): Promise<boolean> {
  const data = await apiFetch<{ success: boolean }>(`/v1/wishlist/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return Boolean(data?.success);
}

export async function syncWishlistMerge(localIds: string[]): Promise<string[] | null> {
  const data = await apiFetch<{ success: boolean; ids: string[]; merged: number }>("/v1/wishlist/sync", {
    method: "POST",
    body: JSON.stringify({ ids: localIds }),
  });
  return data?.success ? data.ids.map(String) : null;
}

function isAuthenticated(): boolean {
  return Boolean(getStoredAuthToken());
}

export function toggleSavedVillaId(villaId: string | number) {
  const id = String(villaId);
  const savedIds = readSavedVillaIds();
  const isSaved = savedIds.includes(id);
  const nextIds = isSaved ? savedIds.filter((item) => item !== id) : [...savedIds, id];

  writeSavedVillaIds(nextIds);

  if (isAuthenticated()) {
    const generation = wishlistGeneration;
    const request = isSaved ? pushWishlistRemove(id) : pushWishlistAdd(id);
    request.then((success) => {
      if (generation !== wishlistGeneration || !isAuthenticated()) return;
      if (success) return;
      // Roll back only when no newer interaction has changed this villa.
      const current = readSavedVillaIds();
      if (current.includes(id) === !isSaved) {
        writeSavedVillaIds(isSaved ? [...current, id] : current.filter((item) => item !== id));
      }
      window.dispatchEvent(new Event(SAVED_VILLAS_ERROR_EVENT));
    }).catch(() => {
      if (generation === wishlistGeneration && isAuthenticated()) {
        window.dispatchEvent(new Event(SAVED_VILLAS_ERROR_EVENT));
      }
    });
  } else {
    window.localStorage.setItem(SAVED_VILLAS_OWNER_KEY, "guest");
  }

  return {
    saved: !isSaved,
    ids: nextIds,
    count: nextIds.length,
  };
}

export async function hydrateWishlistFromRemote(userId: number): Promise<boolean> {
  if (!isAuthenticated() || typeof window === "undefined") return false;
  const generation = ++wishlistGeneration;

  const localIds = readSavedVillaIds();
  const owner = window.localStorage.getItem(SAVED_VILLAS_OWNER_KEY);
  if (owner !== "guest" && owner !== `user:${userId}` && localIds.length) {
    writeSavedVillaIds([]);
  }
  // Only explicitly guest-owned selections may be imported into an account.
  // A legacy or different account's browser cache is never merged.
  const merged = owner === "guest" && localIds.length
    ? await syncWishlistMerge(localIds)
    : await fetchRemoteWishlist();

  if (generation !== wishlistGeneration || !isAuthenticated()) return false;
  if (merged) {
    writeSavedVillaIds(merged);
    window.localStorage.setItem(SAVED_VILLAS_OWNER_KEY, `user:${userId}`);
    return true;
  }

  return false;
}

export async function removeSavedVillaId(id: string): Promise<boolean> {
  if (!isAuthenticated()) return false;
  const generation = wishlistGeneration;
  const success = await pushWishlistRemove(id);
  if (generation !== wishlistGeneration || !isAuthenticated()) return false;
  if (success) writeSavedVillaIds(readSavedVillaIds().filter((item) => item !== id));
  return success;
}

export function subscribeSavedVillas(callback: (change: SavedVillasChange) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    if (detail && Array.isArray(detail.ids)) {
      callback({
        ids: detail.ids.map(String),
        count: Number(detail.count) || detail.ids.length,
      });
      return;
    }

    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length });
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== SAVED_VILLAS_STORAGE_KEY) return;
    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length });
  };

  window.addEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
