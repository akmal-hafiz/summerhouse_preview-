/** Shown when neither copy route works. The code is left selected, so the person only has to copy it. */
export const COPY_FAILED = "Copy did not work here. The code is selected, so you can copy it yourself.";

/**
 * Copies a coupon code. The Clipboard API is tried first; where a browser refuses it (some in-app browsers and
 * embedded views do), the code element is selected and copied the older way. If that fails too, the selection
 * stays on the code. Shared by the member Offers page and the CMS coupon manager.
 */
export async function copyCode(text: string, codeNode?: HTMLElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall through to the selection route.
  }
  const selection = typeof window === "undefined" ? null : window.getSelection();
  if (!codeNode || !selection) return false;
  const range = document.createRange();
  range.selectNodeContents(codeNode);
  selection.removeAllRanges();
  selection.addRange(range);
  try {
    if (document.execCommand("copy")) {
      selection.removeAllRanges();
      return true;
    }
  } catch {
    // Leave the code selected.
  }
  return false;
}
