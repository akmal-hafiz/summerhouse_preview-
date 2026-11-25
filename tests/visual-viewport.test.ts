import assert from "node:assert/strict";
import test from "node:test";
import { keyboardInset } from "../lib/visual-viewport.ts";

test("no keyboard", () => {
  assert.equal(keyboardInset(844, { height: 844, offsetTop: 0 }), 0);
});

test("keyboard, no pan", () => {
  assert.equal(keyboardInset(664, { height: 328, offsetTop: 0 }), 336);
});

test("keyboard with Safari pan", () => {
  assert.equal(keyboardInset(664, { height: 328, offsetTop: 120 }), 216);
});

test("never negative", () => {
  assert.equal(keyboardInset(664, { height: 700, offsetTop: 0 }), 0);
});
