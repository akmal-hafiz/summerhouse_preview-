import { getStoredAuthToken } from "@/lib/auth-client";

export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";
export const SAVED_VILLAS_CHANGED_EVENT = "summerhouses:saved-villas-changed";

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

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

export function getSavedVillasCount() {
  return readSavedVillaIds().length;
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const token = getStoredAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${CMS_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
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
    if (isSaved) {
      pushWishlistRemove(id).catch(() => undefined);
    } else {
      pushWishlistAdd(id).catch(() => undefined);
    }
  }

  return {
    saved: !isSaved,
    ids: nextIds,
    count: nextIds.length,
  };
}

export async function hydrateWishlistFromRemote(): Promise<void> {
  if (!isAuthenticated()) return;

  const localIds = readSavedVillaIds();
  const merged = localIds.length
    ? await syncWishlistMerge(localIds)
    : await fetchRemoteWishlist();

  if (merged) {
    writeSavedVillaIds(merged);
  }
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
