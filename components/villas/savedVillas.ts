import { getStoredAuthToken, sessionFetch } from "@/lib/auth-client";

export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";
export const SAVED_VILLAS_CHANGED_EVENT = "summerhouses:saved-villas-changed";
export const SAVED_VILLAS_ERROR_EVENT = "summerhouses:saved-villas-error";
export const SAVED_VILLAS_SESSION_EXPIRED_EVENT = "summerhouses:saved-villas-session-expired";
export const SAVED_VILLAS_MERGED_EVENT = "summerhouses:saved-villas-merged";
/**
 * A guest's saves live apart from any account cache, under their own key in this browser's local storage, so they
 * survive reloads and new tabs. The account cache is never shown to a guest. They move to the account through
 * `wishlist/sync` at the next sign-in and are then cleared.
 */
export const GUEST_SAVED_VILLAS_KEY = "summerhouses:guest-saved-villas";
const SAVED_VILLAS_OWNER_KEY = "summerhouses:saved-villas-owner";
const MAX_SYNC_IDS = 200;
let wishlistGeneration = 0;
let savedVillaIdsMemory: string[] = [];
let guestVillaIdsMemory: string[] = [];

export type SavedVillasMerged = { merged: number };

export type SavedVillasChange = {
  ids: string[];
  count: number;
};

export function readSavedVillaIds() {
  if (typeof window === "undefined") return [];
  if (!getStoredAuthToken()) {
    savedVillaIdsMemory = [];
    try {
      window.localStorage.removeItem(SAVED_VILLAS_STORAGE_KEY);
      window.localStorage.removeItem(SAVED_VILLAS_OWNER_KEY);
    } catch {
      // Private browsing can block storage; the account cache still never reaches a guest.
    }
    return readGuestSavedVillaIds();
  }

  try {
    const stored = window.localStorage.getItem(SAVED_VILLAS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : savedVillaIdsMemory;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return savedVillaIdsMemory;
  }
}

export function writeSavedVillaIds(ids: string[]) {
  if (typeof window === "undefined") return;

  const nextIds = Array.from(new Set(ids.map(String).filter(Boolean)));
  savedVillaIdsMemory = nextIds;
  try { window.localStorage.setItem(SAVED_VILLAS_STORAGE_KEY, JSON.stringify(nextIds)); } catch { /* Keep the confirmed state in memory. */ }
  window.dispatchEvent(new CustomEvent<SavedVillasChange>(SAVED_VILLAS_CHANGED_EVENT, {
    detail: {
      ids: nextIds,
      count: nextIds.length,
    },
  }));
}

function guestStorage(): Storage | null {
  try { return window.localStorage ?? null; } catch { return null; }
}

export function readGuestSavedVillaIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = guestStorage()?.getItem(GUEST_SAVED_VILLAS_KEY);
    const parsed = stored ? JSON.parse(stored) : guestVillaIdsMemory;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return guestVillaIdsMemory;
  }
}

function writeGuestSavedVillaIds(ids: string[]) {
  const nextIds = Array.from(new Set(ids.map(String).filter(Boolean)));
  guestVillaIdsMemory = nextIds;
  try {
    if (nextIds.length) guestStorage()?.setItem(GUEST_SAVED_VILLAS_KEY, JSON.stringify(nextIds));
    else guestStorage()?.removeItem(GUEST_SAVED_VILLAS_KEY);
  } catch { /* Memory keeps the guest's choice for this page view. */ }
  if (!getStoredAuthToken()) {
    window.dispatchEvent(new CustomEvent<SavedVillasChange>(SAVED_VILLAS_CHANGED_EVENT, {
      detail: { ids: nextIds, count: nextIds.length },
    }));
  }
}

/** Saves or unsaves a villa for a guest, in this browser only. Returns null when someone is signed in. */
export function toggleGuestSavedVillaId(villaId: string | number): SavedVillasChange & { saved: boolean } | null {
  if (typeof window === "undefined" || isAuthenticated()) return null;
  const id = String(villaId);
  const current = readGuestSavedVillaIds();
  const saved = !current.includes(id);
  const nextIds = saved ? [...current, id] : current.filter((item) => item !== id);
  writeGuestSavedVillaIds(nextIds);
  return { saved, ids: nextIds, count: nextIds.length };
}

/** Puts a just-removed villa back: the same `POST /v1/wishlist` as a save for members, the local list for guests. */
export async function restoreSavedVillaId(villaId: string | number): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const id = String(villaId);
  if (!isAuthenticated()) {
    writeGuestSavedVillaIds([...readGuestSavedVillaIds(), id]);
    return true;
  }
  const generation = wishlistGeneration;
  const success = await pushWishlistAdd(id);
  if (generation !== wishlistGeneration || !isAuthenticated() || !success) return false;
  writeSavedVillaIds([...readSavedVillaIds(), id]);
  return true;
}

export function clearSavedVillaIds() {
  if (typeof window === "undefined") return;
  wishlistGeneration += 1;
  savedVillaIdsMemory = [];
  try {
    window.localStorage.removeItem(SAVED_VILLAS_OWNER_KEY);
    window.localStorage.removeItem(SAVED_VILLAS_STORAGE_KEY);
  } catch {
    // The in-memory auth boundary still clears, even if storage is blocked.
  }
  // The account list is gone; once signed out, what remains visible is this tab's guest list (usually empty).
  const remaining = getStoredAuthToken() ? [] : readGuestSavedVillaIds();
  window.dispatchEvent(new CustomEvent<SavedVillasChange>(SAVED_VILLAS_CHANGED_EVENT, {
    detail: { ids: remaining, count: remaining.length },
  }));
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
    if (response.status === 401) {
      window.dispatchEvent(new Event(SAVED_VILLAS_SESSION_EXPIRED_EVENT));
      return null;
    }
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

function isAuthenticated(): boolean {
  return Boolean(getStoredAuthToken());
}

export async function toggleSavedVillaId(villaId: string | number): Promise<SavedVillasChange & { saved: boolean } | null> {
  if (!isAuthenticated()) return null;
  const id = String(villaId);
  const savedIds = readSavedVillaIds();
  const isSaved = savedIds.includes(id);
  const generation = wishlistGeneration;
  const success = await (isSaved ? pushWishlistRemove(id) : pushWishlistAdd(id));
  if (generation !== wishlistGeneration || !isAuthenticated()) return null;
  if (!success) {
    window.dispatchEvent(new Event(SAVED_VILLAS_ERROR_EVENT));
    return null;
  }
  const current = readSavedVillaIds();
  const nextIds = isSaved ? current.filter((item) => item !== id) : [...current, id];
  writeSavedVillaIds(nextIds);
  return {
    saved: !isSaved,
    ids: nextIds,
    count: nextIds.length,
  };
}

async function syncGuestSaves(ids: string[]): Promise<{ ids: string[]; merged: number } | null> {
  const data = await apiFetch<{ success: boolean; ids: string[]; merged?: number }>("/v1/wishlist/sync", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
  return data?.success ? { ids: data.ids.map(String), merged: Number(data.merged) || 0 } : null;
}

export async function hydrateWishlistFromRemote(_userId: number): Promise<boolean> {
  if (!isAuthenticated() || typeof window === "undefined") return false;
  const generation = ++wishlistGeneration;
  // The server is authoritative. A previous account cache is never imported; only this tab's guest saves are
  // offered to the account, through the server's own merge, and then cleared.
  try { window.localStorage.removeItem(SAVED_VILLAS_OWNER_KEY); } catch { /* Storage may be blocked. */ }
  const guestIds = readGuestSavedVillaIds().filter((id) => /^\d{1,20}$/.test(id)).slice(0, MAX_SYNC_IDS);
  writeSavedVillaIds([]);
  const synced = guestIds.length ? await syncGuestSaves(guestIds) : null;
  const remote = synced?.ids ?? await fetchRemoteWishlist();

  if (generation !== wishlistGeneration || !isAuthenticated() || !remote) return false;
  writeSavedVillaIds(remote);
  if (synced) {
    writeGuestSavedVillaIds([]);
    if (synced.merged > 0) {
      window.dispatchEvent(new CustomEvent<SavedVillasMerged>(SAVED_VILLAS_MERGED_EVENT, { detail: { merged: synced.merged } }));
    }
  }
  return true;
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
