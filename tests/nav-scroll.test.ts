import assert from "node:assert/strict";
import test from "node:test";
import { nextNavState, type NavScrollState } from "../lib/nav-scroll.ts";

test("overshoot past the bottom keeps the capsule", () => {
  let state: NavScrollState = { compact: true, scrolled: true, anchor: 8633 };
  for (const y of [8663, 8693, 8723, 8703, 8678, 8653, 8638, 8633]) {
    state = nextNavState(state, { y, maxY: 8633, isHome: false });
    assert.equal(state.compact, true, `y=${y}`);
  }
});

test("negative y at the top reads as 0", () => {
  const next = nextNavState({ compact: true, scrolled: true, anchor: 300 }, { y: -80, maxY: 5000, isHome: false });
  assert.equal(next.compact, false);
  assert.equal(next.scrolled, false);
});

test("small moves under 12px do not flip", () => {
  const next = nextNavState({ compact: true, scrolled: true, anchor: 500 }, { y: 490, maxY: 5000, isHome: false });
  assert.equal(next.compact, true);
  assert.equal(next.anchor, 500);
});

test("a real scroll up expands", () => {
  const next = nextNavState({ compact: true, scrolled: true, anchor: 2000 }, { y: 1900, maxY: 5000, isHome: false });
  assert.equal(next.compact, false);
  assert.equal(next.anchor, 1900);
});

test("home: compact from 48px, either direction", () => {
  const start: NavScrollState = { compact: false, scrolled: false, anchor: 0 };
  assert.equal(nextNavState(start, { y: 60, maxY: 5000, isHome: true }).compact, true);
  assert.equal(nextNavState({ compact: true, scrolled: true, anchor: 60 }, { y: 30, maxY: 5000, isHome: true }).compact, false);
});

test("short page stays expanded", () => {
  const next = nextNavState({ compact: false, scrolled: false, anchor: 0 }, { y: 200, maxY: 0, isHome: false });
  assert.equal(next.compact, false);
});
