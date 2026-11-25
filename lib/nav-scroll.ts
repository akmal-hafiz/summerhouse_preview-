export type NavScrollState = { compact: boolean; scrolled: boolean; anchor: number };

// Decides the navbar state for one scroll event. y is clamped to [0, maxY] so
// iOS rubber-band overshoot (above the top or below the bottom) never reads as a scroll direction.
export function nextNavState(prev: NavScrollState, input: { y: number; maxY: number; isHome: boolean }): NavScrollState {
  const y = Math.min(Math.max(0, input.y), Math.max(0, input.maxY));
  let { compact, anchor } = prev;
  if (y < 48) compact = false;
  else if (input.isHome) compact = true;
  else if (Math.abs(y - anchor) > 12) {
    compact = y > 96 && y > anchor;
    anchor = y;
  }
  return { compact, scrolled: y > 50, anchor };
}
