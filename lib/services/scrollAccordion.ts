export type ScrollDirection = "up" | "down";

type ResolveAccordionIndexInput = {
  activeIndex: number;
  candidateIndex: number;
  direction: ScrollDirection;
  hasObserved: boolean;
  keyboardFocused: boolean;
  reducedMotion: boolean;
  manualAnchorY: number | null;
  currentScrollY: number;
  itemCount: number;
  manualReleaseDistance?: number;
};

export function resolveAccordionIndex({
  activeIndex,
  candidateIndex,
  direction,
  hasObserved,
  keyboardFocused,
  reducedMotion,
  manualAnchorY,
  currentScrollY,
  itemCount,
  manualReleaseDistance = 72,
}: ResolveAccordionIndexInput): number {
  if (itemCount <= 0) return 0;

  const boundedActive = Math.min(Math.max(activeIndex, 0), itemCount - 1);
  const boundedCandidate = Math.min(Math.max(candidateIndex, 0), itemCount - 1);

  if (keyboardFocused || reducedMotion) return boundedActive;

  if (manualAnchorY !== null && Math.abs(currentScrollY - manualAnchorY) < manualReleaseDistance) {
    return boundedActive;
  }

  if (!hasObserved) return boundedCandidate;
  if (direction === "down" && boundedCandidate < boundedActive) return boundedActive;
  if (direction === "up" && boundedCandidate > boundedActive) return boundedActive;

  return boundedCandidate;
}
