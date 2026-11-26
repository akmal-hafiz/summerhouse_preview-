import assert from "node:assert/strict";
import test from "node:test";
import { deckGesture, MAX_VISIBLE_TOASTS, shouldSwipeDismiss, stackLayout, toastDuration, toastReducer, type ToastItem } from "../lib/notifications/toast-queue";

const item = (id: number, extra: Partial<ToastItem> = {}): ToastItem => ({ id, variant: "success", title: `Toast ${id}`, ...extra });

test("new toasts join the end of the stack and the oldest leave beyond three", () => {
  let state: ToastItem[] = [];
  for (let id = 1; id <= 5; id += 1) state = toastReducer(state, { type: "push", toast: item(id) });
  assert.equal(MAX_VISIBLE_TOASTS, 3);
  // The oldest are kept while they play their exit (leaving), then the provider dismisses them.
  assert.deepEqual(state.filter((toast) => !toast.leaving).map((toast) => toast.id), [3, 4, 5]);
});

test("a repeat of the same notice replaces the older copy instead of stacking", () => {
  let state = toastReducer([], { type: "push", toast: item(1, { title: "Saved to your villas", message: "Villa Asri" }) });
  state = toastReducer(state, { type: "push", toast: item(2) });
  state = toastReducer(state, { type: "push", toast: item(3, { title: "Saved to your villas", message: "Villa Asri" }) });
  assert.deepEqual(state.map((toast) => toast.id), [2, 3]);
});

test("dismiss removes only the named toast and ignores unknown ids", () => {
  const state = [item(1), item(2), item(3)];
  assert.deepEqual(toastReducer(state, { type: "dismiss", id: 2 }).map((toast) => toast.id), [1, 3]);
  assert.equal(toastReducer(state, { type: "dismiss", id: 9 }), state);
});

test("errors and toasts with an action stay long enough to read and reach", () => {
  assert.equal(toastDuration(item(1)), 4200);
  assert.equal(toastDuration(item(1, { variant: "info" })), 4200);
  assert.equal(toastDuration(item(1, { variant: "error" })), 6200);
  assert.equal(toastDuration(item(1, { action: { label: "Undo", onClick: () => undefined } })), 7000);
  assert.equal(toastDuration(item(1, { variant: "error", action: { label: "Sign in", href: "/?auth=login" } })), 7000);
});

test("leave marks one toast as leaving and keeps it until dismissed", () => {
  const next = toastReducer([item(1), item(2)], { type: "leave", id: 1 });
  assert.deepEqual(next.map((toast) => [toast.id, Boolean(toast.leaving)]), [[1, true], [2, false]]);
  assert.deepEqual(toastReducer(next, { type: "dismiss", id: 1 }).map((toast) => toast.id), [2]);
});

test("a fourth toast pushes the oldest visible one out; leaving toasts do not count", () => {
  let state = [item(1), item(2), item(3)];
  state = toastReducer(state, { type: "leave", id: 1 });
  state = toastReducer(state, { type: "push", toast: item(4) });
  assert.deepEqual(state.filter((toast) => !toast.leaving).map((toast) => toast.id), [2, 3, 4]);
});

test("collapsed stack: the front at rest, the next peeks 14px higher and smaller, a third hidden", () => {
  const layout = (index: number) => stackLayout({ index, count: 3, expanded: false, heights: [60, 60, 60] });
  assert.deepEqual(layout(2), { y: 0, scale: 1, opacity: 1 });
  assert.deepEqual(layout(1), { y: -14, scale: 0.95, opacity: 1 });
  assert.deepEqual(layout(0), { y: -28, scale: 0.9, opacity: 0 });
});

test("expanded stack: cards spread by the heights in front of them plus an 8px gap", () => {
  const layout = (index: number) => stackLayout({ index, count: 3, expanded: true, heights: [50, 70, 60] });
  assert.deepEqual(layout(2), { y: 0, scale: 1, opacity: 1 });
  assert.deepEqual(layout(1), { y: -68, scale: 1, opacity: 1 });
  assert.deepEqual(layout(0), { y: -146, scale: 1, opacity: 1 });
});

test("a swipe dismisses past 45px or on a quick flick, not on a slow short drag or the wrong way", () => {
  assert.equal(shouldSwipeDismiss(45, 1000), true);
  assert.equal(shouldSwipeDismiss(20, 100), true);
  assert.equal(shouldSwipeDismiss(20, 400), false);
  assert.equal(shouldSwipeDismiss(-60, 100), false);
});

test("a held press or a swipe away from the edge opens a deck of two or more", () => {
  assert.equal(deckGesture({ distance: 0, elapsedMs: 600, held: true, open: false, count: 2 }), "open");
  assert.equal(deckGesture({ distance: -30, elapsedMs: 600, held: false, open: false, count: 3 }), "open");
  assert.equal(deckGesture({ distance: -12, elapsedMs: 80, held: false, open: false, count: 2 }), "open", "a flick");
  assert.equal(deckGesture({ distance: 0, elapsedMs: 600, held: true, open: false, count: 1 }), "none", "one card has no deck");
});

test("on an open deck a swipe toward the edge closes it; on a closed deck it dismisses the front card", () => {
  assert.equal(deckGesture({ distance: 50, elapsedMs: 400, held: false, open: true, count: 3 }), "close");
  assert.equal(deckGesture({ distance: 50, elapsedMs: 400, held: false, open: false, count: 3 }), "dismiss");
});

test("short slow movements and plain taps do nothing", () => {
  assert.equal(deckGesture({ distance: -10, elapsedMs: 400, held: false, open: false, count: 3 }), "none");
  assert.equal(deckGesture({ distance: 0, elapsedMs: 120, held: false, open: false, count: 3 }), "none");
  assert.equal(deckGesture({ distance: -40, elapsedMs: 300, held: false, open: true, count: 3 }), "none", "already open");
});
