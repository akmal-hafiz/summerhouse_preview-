import { getStoredAuthToken, sessionFetch } from "@/lib/auth-client";
import type { WishlistSummary } from "@/lib/wishlist-rules";

export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";
export const SAVED_VILLAS_CHANGED_EVENT = "summerhouses:saved-villas-changed";
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
  /** Named wishlists and which of them hold each villa (empty for a guest or before the first load). */
  lists?: WishlistSummary[];
  holding?: Record<string, number[]>;
};

/** `stateAt`: when the server read this state under the member's lock; an older answer never overwrites a newer one. */
export type WishlistState = { ids: string[]; lists: WishlistSummary[]; holding: Record<string, number[]>; stateAt?: string };
/** Where a save landed, or the lists a removal took the villa out of (for Undo). */
export type WishlistResult = WishlistState & { savedTo: { id: number; name: string }[]; listIds: number[] };

/** Lists and memberships for this browser's signed-in member; read beside the ids so every tab agrees. */
const WISHLIST_META_KEY = "summerhouses:wishlist-lists";
let wishlistMetaMemory: Pick<WishlistState, "lists" | "holding" | "stateAt"> = { lists: [], holding: {} };

/** A wishlist API answer as state, or null when it failed or is malformed. An older server without lists keeps ids. */
export function applyWishlistResponse(body: unknown): WishlistState | null {
  if (!body || typeof body !== "object") return null;
  const data = body as { success?: unknown; ids?: unknown; lists?: unknown; holding?: unknown; stateAt?: unknown };
  if (data.success !== true || !Array.isArray(data.ids)) return null;
  const lists = Array.isArray(data.lists) ? data.lists : [];
  if (!lists.every((item) => item && typeof item === "object" && Number.isInteger((item as { id?: unknown }).id))) return null;
  const holding = data.holding && typeof data.holding === "object" ? data.holding as Record<string, unknown> : {};
  return {
    ids: data.ids.map(String),
    lists: lists as WishlistSummary[],
    holding: Object.fromEntries(Object.entries(holding).map(([villa, ids]) => [villa, Array.isArray(ids) ? ids.map(Number) : []])),
    ...(typeof data.stateAt === "string" ? { stateAt: data.stateAt } : {}),
  };
}

export function readWishlistMeta(): Pick<WishlistState, "lists" | "holding" | "stateAt"> {
  if (typeof window === "undefined" || !getStoredAuthToken()) return { lists: [], holding: {} };
  try {
    const stored = window.localStorage.getItem(WISHLIST_META_KEY);
    return stored ? JSON.parse(stored) : wishlistMetaMemory;
  } catch {
    return wishlistMetaMemory;
  }
}

/** Stores the server's answer (ids for the hearts and the navbar, lists and memberships) and tells every listener. */
function writeWishlistState(state: WishlistState) {
  // Answers can arrive out of order (a slow GET after a save, another tab): keep the newest. A state without a time
  // (a reset, an older server) always applies.
  const current = readWishlistMeta().stateAt;
  if (state.stateAt && current && Date.parse(state.stateAt) < Date.parse(current)) return;
  wishlistMetaMemory = { lists: state.lists, holding: state.holding, ...(state.stateAt ? { stateAt: state.stateAt } : {}) };
  try { window.localStorage.setItem(WISHLIST_META_KEY, JSON.stringify(wishlistMetaMemory)); } catch { /* Kept in memory. */ }
  writeSavedVillaIds(state.ids);
}

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
    // Owner decision 2026-11-19: only signed-in members save, so a guest sees no saved hearts. An older guest list
    // (from before this rule) stays in storage and moves to the account at sign-in.
    return [];
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
      ...readWishlistMeta(),
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

/** Empties the older guest list once it has moved to the account. */
function clearGuestSavedVillaIds() {
  guestVillaIdsMemory = [];
  try { guestStorage()?.removeItem(GUEST_SAVED_VILLAS_KEY); } catch { /* Memory is already empty. */ }
}

/** Puts a just-removed villa back with the same `POST /v1/wishlist` as a save. Members only. */
export async function restoreSavedVillaId(villaId: string | number): Promise<boolean> {
  const answer = await saveToList(villaId);
  return Boolean(answer && "result" in answer);
}

export function clearSavedVillaIds() {
  if (typeof window === "undefined") return;
  wishlistGeneration += 1;
  savedVillaIdsMemory = [];
  wishlistMetaMemory = { lists: [], holding: {} };
  try {
    window.localStorage.removeItem(SAVED_VILLAS_OWNER_KEY);
    window.localStorage.removeItem(SAVED_VILLAS_STORAGE_KEY);
    window.localStorage.removeItem(WISHLIST_META_KEY);
  } catch {
    // The in-memory auth boundary still clears, even if storage is blocked.
  }
  // The account list is gone; a signed-out visitor sees no saved hearts.
  const remaining: string[] = [];
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

function isAuthenticated(): boolean {
  return Boolean(getStoredAuthToken());
}

/**
 * One wishlist call: the server answers with the whole state, which is stored and broadcast, so the browser never
 * guesses. `error` carries the server's message (a duplicate name, a cap) for the sheet to show.
 */
async function wishlistCall(path: string, init: RequestInit = {}): Promise<{ result: WishlistResult; created?: { id: number; name: string } } | { error: string; status?: number } | null> {
  if (typeof window === "undefined" || !isAuthenticated()) return null;
  const generation = wishlistGeneration;
  try {
    const response = await sessionFetch(path, { ...init, headers: { "Content-Type": "application/json", Accept: "application/json", ...(init.headers || {}) } });
    if (response.status === 401) { window.dispatchEvent(new Event(SAVED_VILLAS_SESSION_EXPIRED_EVENT)); return null; }
    const body = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (generation !== wishlistGeneration || !isAuthenticated()) return null;
    if (!response.ok) {
      // A list gone in another tab, a cap or a name clash: refresh, so the next tap works from the server's lists.
      if (init.method && init.method !== "GET" && [404, 409].includes(response.status)) void fetchWishlistState();
      return { error: typeof body?.message === "string" ? body.message : "Something went wrong. Please try again.", status: response.status };
    }
    const state = applyWishlistResponse(body);
    if (!state) return { error: "Something went wrong. Please try again." };
    writeWishlistState(state);
    const ref = (value: unknown) => value as { id: number; name: string };
    return {
      result: { ...state, savedTo: Array.isArray(body?.savedTo) ? body.savedTo.map(ref) : [], listIds: Array.isArray(body?.listIds) ? body.listIds.map(Number) : [] },
      ...(body?.created ? { created: ref(body.created) } : {}),
    };
  } catch {
    // The change may have landed before the answer was lost: refresh, so a retry does not meet a false duplicate.
    if (init.method && init.method !== "GET") void fetchWishlistState();
    return { error: "We could not reach the server. Check your connection and try again." };
  }
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const fetchWishlistState = () => wishlistCall("/v1/wishlist");
/** Saves into a wishlist; without one, into the most recently used (quick save). */
export const saveToList = (villaId: string | number, listId?: number) =>
  wishlistCall("/v1/wishlist", post({ lodgify_property_id: String(villaId), ...(listId ? { list_id: listId } : {}) }));
export const createWishlist = (name: string, villaId?: string | number, moveFrom?: number) =>
  wishlistCall("/v1/wishlist/lists", post({ name, ...(villaId != null ? { lodgify_property_id: String(villaId) } : {}), ...(moveFrom ? { move_from: moveFrom } : {}) }));
/** Removes from one wishlist, or from all of them; the answer's `listIds` feed Undo. */
export const removeFromLists = (villaId: string | number, listId?: number) =>
  wishlistCall("/v1/wishlist/remove", post({ lodgify_property_id: String(villaId), ...(listId ? { list_id: listId } : {}) }));
export const restoreToLists = (villaId: string | number, listIds: number[]) =>
  wishlistCall("/v1/wishlist/restore", post({ lodgify_property_id: String(villaId), list_ids: listIds }));
export const renameWishlist = (listId: number, name: string) => wishlistCall("/v1/wishlist/rename", post({ list_id: listId, name }));
export const deleteWishlist = (listId: number) => wishlistCall(`/v1/wishlist/lists/${listId}`, { method: "DELETE" });

/** Older single-list callers: a save goes to the most recently used wishlist, a removal takes the villa out of all. */
export async function toggleSavedVillaId(villaId: string | number): Promise<SavedVillasChange & { saved: boolean } | null> {
  if (!isAuthenticated()) return null;
  const isSaved = readSavedVillaIds().includes(String(villaId));
  const answer = await (isSaved ? removeFromLists(villaId) : saveToList(villaId));
  if (!answer) return null;
  if ("error" in answer) return null;
  return { saved: !isSaved, ids: answer.result.ids, count: answer.result.ids.length, lists: answer.result.lists, holding: answer.result.holding };
}

/** The guest merge: its state and count; "refused" when the server said no for good (4xx), so it is not retried. */
async function syncGuestSaves(ids: string[]): Promise<{ state: WishlistState; merged: number } | "refused" | null> {
  try {
    const response = await sessionFetch("/v1/wishlist/sync", {
      method: "POST",
      body: JSON.stringify({ ids }),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    if (response.status === 401) { window.dispatchEvent(new Event(SAVED_VILLAS_SESSION_EXPIRED_EVENT)); return null; }
    if (response.status >= 400 && response.status < 500) return "refused";
    const data = await response.json().catch(() => null) as { merged?: unknown } | null;
    const state = response.ok ? applyWishlistResponse(data) : null;
    return state ? { state, merged: Number(data?.merged) || 0 } : null;
  } catch {
    return null;
  }
}

export async function hydrateWishlistFromRemote(userId: number): Promise<boolean> {
  if (!isAuthenticated() || typeof window === "undefined") return false;
  const generation = ++wishlistGeneration;
  // The server is authoritative. Another account's cache is never shown: it is blanked before the load. The same
  // member's cache stays while this tab loads, because blanking it would empty every other open tab (storage events).
  let owner: string | null = null;
  try { owner = window.localStorage.getItem(SAVED_VILLAS_OWNER_KEY); } catch { /* Storage may be blocked. */ }
  if (owner !== String(userId)) writeWishlistState({ ids: [], lists: [], holding: {} });
  // Only an older guest list (from before sign-in-only saving) is offered to the account, through the server's merge.
  const guestIds = readGuestSavedVillaIds().filter((id) => /^\d{1,20}$/.test(id)).slice(0, MAX_SYNC_IDS);
  const answer = guestIds.length ? await syncGuestSaves(guestIds) : null;
  if (answer === "refused") clearGuestSavedVillaIds();
  const synced = answer === "refused" ? null : answer;
  const remote = synced?.state ?? applyWishlistResponse(await apiFetch("/v1/wishlist"));

  if (generation !== wishlistGeneration || !isAuthenticated() || !remote) return false;
  try { window.localStorage.setItem(SAVED_VILLAS_OWNER_KEY, String(userId)); } catch { /* Kept in memory only. */ }
  writeWishlistState(remote);
  if (synced) {
    clearGuestSavedVillaIds();
    if (synced.merged > 0) {
      window.dispatchEvent(new CustomEvent<SavedVillasMerged>(SAVED_VILLAS_MERGED_EVENT, { detail: { merged: synced.merged } }));
    }
  }
  return true;
}

/** Takes a villa out of every wishlist (the dashboard's Remove). */
export async function removeSavedVillaId(id: string): Promise<boolean> {
  const answer = await removeFromLists(id);
  return Boolean(answer && "result" in answer);
}

export function subscribeSavedVillas(callback: (change: SavedVillasChange) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    if (detail && Array.isArray(detail.ids)) {
      callback({
        ids: detail.ids.map(String),
        count: Number(detail.count) || detail.ids.length,
        lists: Array.isArray(detail.lists) ? detail.lists : readWishlistMeta().lists,
        holding: detail.holding && typeof detail.holding === "object" ? detail.holding : readWishlistMeta().holding,
      });
      return;
    }

    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length, ...readWishlistMeta() });
  };

  // Another tab changed the saves or the wishlists: both keys feed the same picture.
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== SAVED_VILLAS_STORAGE_KEY && event.key !== WISHLIST_META_KEY) return;
    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length, ...readWishlistMeta() });
  };

  window.addEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
