import assert from "node:assert/strict";
import test from "node:test";
import { clearStoredAuth, setStoredAuth } from "../lib/auth-client";
import {
  clearSavedVillaIds,
  GUEST_SAVED_VILLAS_KEY,
  hydrateWishlistFromRemote,
  readGuestSavedVillaIds,
  readSavedVillaIds,
  restoreSavedVillaId,
  SAVED_VILLAS_MERGED_EVENT,
  SAVED_VILLAS_STORAGE_KEY,
  toggleSavedVillaId,
} from "../components/villas/savedVillas";

function browser() {
  const values = new Map<string, string>();
  const events = new EventTarget();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: Object.assign(events, { localStorage: storage }),
  });
  return storage;
}

test("guests cannot use the account save path or read a legacy account wishlist", async () => {
  const storage = browser();
  clearStoredAuth();
  storage.setItem(SAVED_VILLAS_STORAGE_KEY, JSON.stringify(["123"]));
  assert.deepEqual(readSavedVillaIds(), []);
  assert.equal(await toggleSavedVillaId("456"), null);
  assert.equal(storage.getItem(SAVED_VILLAS_STORAGE_KEY), null);
  clearSavedVillaIds();
  assert.equal(storage.getItem(SAVED_VILLAS_STORAGE_KEY), null);
});

test("guests save nothing; a list from before sign-in-only saving still moves to the account at sign-in", async () => {
  const storage = browser();
  clearStoredAuth();
  // Owner decision 2026-11-19: only signed-in members save. An older guest list stays out of sight until sign-in.
  storage.setItem(GUEST_SAVED_VILLAS_KEY, JSON.stringify(["475366"]));
  assert.deepEqual(readSavedVillaIds(), [], "no filled hearts for a guest");
  assert.equal(await restoreSavedVillaId("475366"), false, "undo never saves for a guest");
  assert.equal(storage.getItem(GUEST_SAVED_VILLAS_KEY), JSON.stringify(["475366"]));
  assert.deepEqual(readGuestSavedVillaIds(), ["475366"]);

  const merged: number[] = [];
  globalThis.window.addEventListener(SAVED_VILLAS_MERGED_EVENT, (event) => merged.push((event as CustomEvent).detail.merged));
  const originalFetch = globalThis.fetch;
  const calls: { url: string; body?: string }[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, body: init?.body ? String(init.body) : undefined });
    if (url.includes("/csrf")) return Response.json({ csrfToken: "test" });
    if (url.includes("wishlist/sync")) return Response.json({ success: true, ids: ["475366", "475390"], merged: 1 });
    return Response.json({ success: false }, { status: 500 });
  };
  try {
    setStoredAuth("cookie-session", { id: 1, name: "Guest", email: "guest@example.test", role: "user", isAdmin: false });
    assert.equal(await hydrateWishlistFromRemote(1), true);
    const sync = calls.find((call) => call.url.includes("wishlist/sync"));
    assert.deepEqual(JSON.parse(sync?.body ?? "{}"), { ids: ["475366"] });
    assert.deepEqual(readSavedVillaIds(), ["475366", "475390"]);
    assert.deepEqual(merged, [1]);
    assert.equal(storage.getItem(GUEST_SAVED_VILLAS_KEY), null);
    assert.deepEqual(readGuestSavedVillaIds(), []);
  } finally {
    globalThis.fetch = originalFetch;
    clearStoredAuth();
    clearSavedVillaIds();
  }
});

test("undo puts a removed villa back with the same save call", async () => {
  browser();
  setStoredAuth("cookie-session", { id: 1, name: "Guest", email: "guest@example.test", role: "user", isAdmin: false });
  const originalFetch = globalThis.fetch;
  const calls: { url: string; method?: string }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), method: init?.method });
    if (String(input).includes("/csrf")) return Response.json({ csrfToken: "test" });
    return Response.json({ success: true, ids: ["475366"], lists: [], holding: { "475366": [1] } });
  };
  try {
    assert.equal(await restoreSavedVillaId("475366"), true);
    assert.deepEqual(readSavedVillaIds(), ["475366"]);
    assert.ok(calls.some((call) => call.url.endsWith("/api/session/wishlist") && call.method === "POST"));
  } finally {
    globalThis.fetch = originalFetch;
    clearStoredAuth();
    clearSavedVillaIds();
  }
});

test("the heart changes only after the authenticated API confirms success", async () => {
  browser();
  clearSavedVillaIds();
  setStoredAuth("cookie-session", { id: 1, name: "Guest", email: "guest@example.test", role: "user", isAdmin: false });
  const originalFetch = globalThis.fetch;
  let confirmSave: ((response: Response) => void) | undefined;
  globalThis.fetch = async (input) => {
    if (String(input).includes("/csrf")) return Response.json({ csrfToken: "test" });
    return new Promise<Response>((resolve) => { confirmSave = resolve; });
  };
  try {
    const pending = toggleSavedVillaId("456");
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(readSavedVillaIds(), []);
    assert.ok(confirmSave);
    // The save answers with the member's whole wishlist state (named wishlists, 2026-11-20).
    confirmSave(Response.json({ success: true, ids: ["456"], lists: [], holding: { "456": [1] } }));
    assert.equal((await pending)?.saved, true);
    assert.deepEqual(readSavedVillaIds(), ["456"]);
  } finally {
    globalThis.fetch = originalFetch;
    clearStoredAuth();
    clearSavedVillaIds();
  }
});

test("a failed authenticated save leaves the heart unsaved", async () => {
  browser();
  setStoredAuth("cookie-session", { id: 1, name: "Guest", email: "guest@example.test", role: "user", isAdmin: false });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: false }, { status: 401 });
  try {
    assert.equal(await toggleSavedVillaId("789"), null);
    assert.deepEqual(readSavedVillaIds(), []);
  } finally {
    globalThis.fetch = originalFetch;
    clearStoredAuth();
    clearSavedVillaIds();
  }
});
