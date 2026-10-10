import assert from "node:assert/strict";
import test from "node:test";
import { resolveAccordionIndex } from "../lib/services/scrollAccordion";

const base = {
  activeIndex: 2,
  candidateIndex: 3,
  direction: "down" as const,
  hasObserved: true,
  keyboardFocused: false,
  reducedMotion: false,
  manualAnchorY: null,
  currentScrollY: 500,
  itemCount: 6,
};

test("scroll-driven accordion advances in the current direction", () => {
  assert.equal(resolveAccordionIndex(base), 3);
  assert.equal(resolveAccordionIndex({ ...base, candidateIndex: 1 }), 2);
  assert.equal(resolveAccordionIndex({ ...base, direction: "up", candidateIndex: 1 }), 1);
  assert.equal(resolveAccordionIndex({ ...base, direction: "up", candidateIndex: 4 }), 2);
});

test("first observation supports entering a section from either direction", () => {
  assert.equal(resolveAccordionIndex({ ...base, activeIndex: 0, candidateIndex: 5, direction: "up", hasObserved: false }), 5);
});

test("manual, keyboard and reduced-motion policies prevent surprise activation", () => {
  assert.equal(resolveAccordionIndex({ ...base, manualAnchorY: 480 }), 2);
  assert.equal(resolveAccordionIndex({ ...base, keyboardFocused: true }), 2);
  assert.equal(resolveAccordionIndex({ ...base, reducedMotion: true }), 2);
  assert.equal(resolveAccordionIndex({ ...base, manualAnchorY: 300 }), 3);
});

test("indices remain bounded when content changes", () => {
  assert.equal(resolveAccordionIndex({ ...base, activeIndex: 8, candidateIndex: 9, itemCount: 4 }), 3);
  assert.equal(resolveAccordionIndex({ ...base, itemCount: 0 }), 0);
});
