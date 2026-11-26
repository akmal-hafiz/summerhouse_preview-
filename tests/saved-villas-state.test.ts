import assert from "node:assert/strict";
import test from "node:test";
import { applyWishlistResponse } from "../components/villas/savedVillas";

const list = { id: 4, name: "Saved", count: 1, lastUsedAt: "2026-11-20T00:00:00.000Z", coverIds: ["475365"] };

test("a wishlist answer becomes the hearts' ids, the lists and which lists hold each villa", () => {
  assert.deepEqual(applyWishlistResponse({ success: true, ids: [475365], lists: [list], holding: { "475365": [4] } }),
    { ids: ["475365"], lists: [list], holding: { "475365": [4] } });
});

test("an older server without lists still gives the hearts their ids", () => {
  assert.deepEqual(applyWishlistResponse({ success: true, ids: ["1"] }), { ids: ["1"], lists: [], holding: {} });
});

test("a failed or malformed answer changes nothing", () => {
  assert.equal(applyWishlistResponse({ success: false }), null);
  assert.equal(applyWishlistResponse({ success: true, ids: "1" }), null);
  assert.equal(applyWishlistResponse(null), null);
  assert.equal(applyWishlistResponse({ success: true, ids: [], lists: [{ id: "x" }] }), null, "a list without a numeric id is rejected");
});
