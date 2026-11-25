/** Pixels between the bottom of the layout viewport and the bottom of the visible area (the keyboard). */
export function keyboardInset(
  layoutHeight: number,
  vv: { height: number; offsetTop: number },
): number {
  return Math.max(0, Math.round(layoutHeight - (vv.offsetTop + vv.height)));
}
