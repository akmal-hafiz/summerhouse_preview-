import assert from "node:assert/strict";
import test from "node:test";
import { filledHeartAction, normalizeWishlistName, saveMode, sheetLists, wishlistNameProblem, type WishlistSummary } from "../lib/wishlist-rules.ts";

test("names are normalised the same way in the browser and on the server", () => {
  assert.deepEqual(normalizeWishlistName("  Bali​  trip "), { name: "Bali trip", key: "bali trip", length: 9 });
  assert.equal(normalizeWishlistName("🌴".repeat(50)).length, 50, "emoji count as one character each");
  assert.equal(normalizeWishlistName("Bali​").key, normalizeWishlistName("bali").key, "invisible characters never make a new name");
});

test("joiners that are part of the writing stay; loose invisible ones go", () => {
  const family = "Family \u{1F468}‍\u{1F469}‍\u{1F467}";
  assert.equal(normalizeWishlistName(family).name, family, "the family emoji keeps its zero-width joiners");
  const persian = "می‌خواهم"; // ZWNJ between two letters
  assert.equal(normalizeWishlistName(persian).name, persian, "a ZWNJ between letters is part of the spelling");
  assert.equal(normalizeWishlistName("Bali‍").key, "bali", "a trailing joiner is invisible noise");
  assert.equal(normalizeWishlistName("‮Bali⁦").key, "bali", "bidi controls are removed");
  assert.equal(normalizeWishlistName("Ba­li﻿").key, "bali", "soft hyphen and BOM are removed");
});

test("a name must have 1 to 50 characters", () => {
  assert.equal(wishlistNameProblem("  "), "Give your wishlist a name.");
  assert.equal(wishlistNameProblem("x".repeat(51)), "Use 50 characters or fewer.");
  assert.equal(wishlistNameProblem("🌴".repeat(50)), null);
  assert.equal(wishlistNameProblem("Canggu trip"), null);
});

const list = (id: number, count: number, lastUsedAt: string): WishlistSummary => ({ id, name: `L${id}`, count, lastUsedAt, coverIds: [], villaIds: [] });

test("the heart creates, quick-saves or asks, by how many wishlists the member has", () => {
  assert.equal(saveMode([]), "create");
  assert.equal(saveMode([list(1, 0, "2026-11-20")]), "quick");
  assert.equal(saveMode([list(1, 0, "2026-11-20"), list(2, 0, "2026-11-19"), list(3, 0, "2026-11-18")]), "ask");
});

test("the sheet shows the lists holding the villa first, then the most used, two by default", () => {
  const a = list(1, 6, "2026-11-01"), b = list(2, 3, "2026-11-20"), c = list(3, 3, "2026-11-10");
  assert.deepEqual(sheetLists([b, c, a], [3]), { shown: [c, a], more: [b] });
  assert.deepEqual(sheetLists([c, b, a], []), { shown: [a, b], more: [c] });
  const held = sheetLists([a, b, c], [2, 3]);
  assert.deepEqual(held.shown.map((l) => l.id), [2, 3], "every list holding the villa stays visible");
  assert.deepEqual(held.more.map((l) => l.id), [1]);
});

test("a filled heart removes at once from one list, and asks when the villa is in several", () => {
  assert.equal(filledHeartAction([4]), "remove");
  assert.equal(filledHeartAction([4, 7]), "ask");
});
