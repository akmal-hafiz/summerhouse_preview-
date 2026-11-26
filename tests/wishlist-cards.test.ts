import assert from "node:assert/strict";
import test from "node:test";
import { coverPhotos, listVillaIds } from "../components/villas/wishlistCards";

const villa = (id: number) => ({ id, imageUrl: `https://img.test/${id}.jpg` });

test("coverPhotos keeps villas still in the collection, in order", () => {
  assert.deepEqual(coverPhotos(["3", "9", "1"], [villa(1), villa(3)]), ["https://img.test/3.jpg", "https://img.test/1.jpg"]);
});

test("coverPhotos returns at most three photos", () => {
  assert.equal(coverPhotos(["1", "2", "3", "4"], [villa(1), villa(2), villa(3), villa(4)]).length, 3);
});

test("coverPhotos shows a shared fallback image once", () => {
  const fallback = (id: number) => ({ id, imageUrl: "/homepage_villa/VillaZen.webp" });
  assert.deepEqual(coverPhotos(["1", "2", "3"], [fallback(1), fallback(2), villa(3)]), ["/homepage_villa/VillaZen.webp", "https://img.test/3.jpg"]);
});

test("coverPhotos of nothing is empty", () => {
  assert.deepEqual(coverPhotos([], [villa(1)]), []);
  assert.deepEqual(coverPhotos(["1"], []), []);
});

test("listVillaIds follows the wishlist's own order, newest added first", () => {
  assert.deepEqual(listVillaIds({ villaIds: ["7", "3"] }), ["7", "3"]);
});

test("listVillaIds of an older cached wishlist without villaIds is empty", () => {
  assert.deepEqual(listVillaIds({} as { villaIds?: string[] }), []);
});
