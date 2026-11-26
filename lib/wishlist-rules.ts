// Wishlist rules shared by the browser (sheet, counter, heart) and the server (validation). No imports, so Payload's
// CLI scripts and the client bundle can both load it.

/** `villaIds`: every villa in the list, newest added first; `coverIds` is its first three (kept for older clients). */
export type WishlistSummary = { id: number; name: string; count: number; lastUsedAt: string; coverIds: string[]; villaIds: string[] };

export const WISHLIST_NAME_MAX = 50;

/** NFKC, invisible control/format characters removed, inner spaces collapsed, trimmed; length in characters. */
export function normalizeWishlistName(raw: string): { name: string; key: string; length: number } {
  const name = raw.normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}]/gu, (char) => (char === "\u200C" || char === "\u200D" ? char : ""))
    // A joiner is part of the writing between emoji (ZWJ: the family emoji) or letters (ZWNJ: Persian); elsewhere it is
    // invisible noise that would make "Bali" and "Bali" + U+200D two names.
    .replace(/(?<![\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F])\u200D|\u200D(?!\p{Extended_Pictographic})/gu, "")
    .replace(/(?<![\p{L}\p{M}])\u200C|\u200C(?!\p{L})/gu, "")
    .replace(/\s+/g, " ").trim();
  return { name, key: name.toLowerCase(), length: [...name].length };
}

export function wishlistNameProblem(raw: string): string | null {
  const { length } = normalizeWishlistName(raw);
  if (length === 0) return "Give your wishlist a name.";
  if (length > WISHLIST_NAME_MAX) return `Use ${WISHLIST_NAME_MAX} characters or fewer.`;
  return null;
}

/** Empty heart: no wishlist yet creates one, one wishlist saves straight into it, two or more ask. */
export function saveMode(lists: WishlistSummary[]): "create" | "quick" | "ask" {
  return lists.length === 0 ? "create" : lists.length === 1 ? "quick" : "ask";
}

const byUse = (a: WishlistSummary, b: WishlistSummary) => b.count - a.count || Date.parse(b.lastUsedAt) - Date.parse(a.lastUsedAt);

/**
 * The sheet's rows: every list already holding the villa, then the most used (most villas, then most recent) up to
 * `limit`; the rest sit behind "More wishlists".
 */
export function sheetLists(lists: WishlistSummary[], holding: number[], limit = 2): { shown: WishlistSummary[]; more: WishlistSummary[] } {
  const ranked = [...lists].sort(byUse);
  const held = new Set(holding);
  const shown = ranked.filter((list) => held.has(list.id));
  for (const list of ranked) if (shown.length < limit && !held.has(list.id)) shown.push(list);
  const visible = new Set(shown.map((list) => list.id));
  return { shown, more: ranked.filter((list) => !visible.has(list.id)) };
}

/** Filled heart: a villa in one list is removed at once (with Undo); in several, the sheet lets the member choose. */
export function filledHeartAction(holding: number[]): "remove" | "ask" {
  return holding.length > 1 ? "ask" : "remove";
}
