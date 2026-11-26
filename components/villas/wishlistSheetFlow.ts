import { filledHeartAction, saveMode, type WishlistSummary } from "@/lib/wishlist-rules";

export type HeartTap =
  | { kind: "auth-note" }
  | { kind: "wait" }
  | { kind: "create" }
  | { kind: "quick-save"; listId: number }
  | { kind: "ask" }
  | { kind: "remove"; listId?: number };

/**
 * What one tap on a villa's heart does (owner decisions, 2026-11-20): guests get the sign-in note; an empty heart
 * creates the first wishlist, quick-saves into the only one, or asks; a filled heart removes from its one wishlist or
 * asks when the villa is in several; inside a wishlist it removes from that wishlist only. Pure.
 */
export function heartTap(input: { signedIn: boolean; isSaved: boolean; lists: WishlistSummary[]; holding: number[]; insideListId?: number; ready?: boolean }): HeartTap {
  if (!input.signedIn) return { kind: "auth-note" };
  // Until the member's wishlists have loaded, lists are empty and every heart looks unsaved: wait, never guess.
  if (input.ready === false) return { kind: "wait" };
  if (input.isSaved) {
    if (input.insideListId != null) return { kind: "remove", listId: input.insideListId };
    return filledHeartAction(input.holding) === "ask" ? { kind: "ask" } : { kind: "remove", listId: input.holding[0] };
  }
  const mode = saveMode(input.lists);
  return mode === "quick" ? { kind: "quick-save", listId: input.lists[0].id } : { kind: mode };
}
