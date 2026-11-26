import assert from "node:assert/strict";
import test from "node:test";
import { heartTap } from "../components/villas/wishlistSheetFlow";
import type { WishlistSummary } from "../lib/wishlist-rules";

const list = (id: number): WishlistSummary => ({ id, name: `L${id}`, count: 1, lastUsedAt: "2026-11-20T00:00:00.000Z", coverIds: [], villaIds: [] });
const tap = (over: Partial<Parameters<typeof heartTap>[0]>) =>
  heartTap({ signedIn: true, isSaved: false, lists: [], holding: [], ...over });

test("a guest always gets the sign-in note", () => {
  assert.deepEqual(tap({ signedIn: false }), { kind: "auth-note" });
  assert.deepEqual(tap({ signedIn: false, isSaved: true, lists: [list(1)], holding: [1] }), { kind: "auth-note" });
});

test("an empty heart creates, quick-saves or asks, by the member's wishlists", () => {
  assert.deepEqual(tap({}), { kind: "create" });
  assert.deepEqual(tap({ lists: [list(7)] }), { kind: "quick-save", listId: 7 });
  assert.deepEqual(tap({ lists: [list(7), list(8)] }), { kind: "ask" });
});

test("a filled heart removes from its one wishlist, and asks when the villa is in several", () => {
  assert.deepEqual(tap({ isSaved: true, lists: [list(7), list(8)], holding: [8] }), { kind: "remove", listId: 8 });
  assert.deepEqual(tap({ isSaved: true, lists: [list(7), list(8)], holding: [7, 8] }), { kind: "ask" });
});

test("a member's heart waits while the wishlists are still loading", () => {
  assert.deepEqual(tap({ ready: false }), { kind: "wait" });
  assert.deepEqual(tap({ ready: false, isSaved: true, lists: [list(7)], holding: [7] }), { kind: "wait" });
  assert.deepEqual(tap({ signedIn: false, ready: false }), { kind: "auth-note" }, "a guest still gets the sign-in note");
});

test("inside a wishlist the heart removes from that wishlist only", () => {
  assert.deepEqual(tap({ isSaved: true, lists: [list(7), list(8)], holding: [7, 8], insideListId: 8 }), { kind: "remove", listId: 8 });
});
