"use client";

import { useEffect, useRef, useState } from "react";
import {
  readSavedVillaIds,
  readWishlistMeta,
  removeFromLists,
  restoreToLists,
  saveToList,
  subscribeSavedVillas,
} from "./savedVillas";
import { isWishlistSheetOpen, openWishlistSheet, rememberVillaImage } from "./WishlistSheet";
import { heartTap } from "./wishlistSheetFlow";
import { getStoredAuthToken } from "@/lib/auth-client";
import { SAVE_TOASTS, saveErrorMessage, WISHLIST_COPY } from "@/lib/notifications/guest-messages";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useToast } from "@/components/providers/ToastProvider";

export type VillaHeartTarget = {
  id: string | number;
  name: string;
  image?: string;
};

export type UseVillaHeartOptions = {
  initialSaved?: boolean;
  insideListId?: number;
  onSavedChange?: (villaId: string, saved: boolean) => void;
  /** Optional override for logged-out taps (e.g. a card's anchored sign-in popover). */
  onAuthNote?: () => void;
  /** Show a toast on save errors when the caller does not render an inline error message. */
  toastOnError?: boolean;
};

export function useVillaHeart(
  villa: VillaHeartTarget,
  options: UseVillaHeartOptions = {},
): {
  isSaved: boolean;
  isBusy: boolean;
  saveError: string;
  onHeart: () => void;
} {
  const {
    initialSaved = false,
    insideListId,
    onSavedChange,
    onAuthNote,
    toastOnError = false,
  } = options;
  const villaId = String(villa.id);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isBusy, setIsBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { isAuthenticated, isLoading, wishlistStatus, refreshWishlist } = useAuth();
  /** A member's tap that came before the wishlists loaded; it runs once they are in. */
  const tapWaiting = useRef(false);
  const { openAuth } = useAuthModal();
  const toast = useToast();

  useEffect(() => {
    rememberVillaImage(villaId, villa.image);
    // Inside a wishlist the heart reflects that wishlist; elsewhere, any wishlist.
    const savedIn = (ids: string[], holding?: Record<string, number[]>) =>
      insideListId != null ? Boolean(holding?.[villaId]?.includes(insideListId)) : ids.includes(villaId);
    setIsSaved(savedIn(readSavedVillaIds(), readWishlistMeta().holding));
    return subscribeSavedVillas(({ ids, holding }) => {
      setIsSaved(savedIn(ids, holding));
    });
  }, [villaId, villa.image, insideListId]);

  // Undo outlives the card (the saved list unmounts a removed card), so it uses only module and context helpers.
  const offerUndo = (id: string, name: string, image: string | undefined, listName: string, listIds: number[]) => {
    toast.success({
      ...WISHLIST_COPY.removedFrom(listName),
      message: name,
      image,
      action: {
        label: WISHLIST_COPY.undo,
        onClick: () => {
          void restoreToLists(id, listIds).then((answer) => {
            if (answer && "result" in answer) {
              toast.success({
                ...WISHLIST_COPY.savedTo(answer.result.savedTo[0]?.name ?? listName),
                message: name,
                image,
              });
            } else {
              toast.error({ ...SAVE_TOASTS.undoFailed });
            }
          });
        },
      },
    });
  };

  const reportError = (message: string) => {
    setSaveError(message);
    if (toastOnError) {
      toast.error({ title: message });
    }
  };

  const runHeart = async () => {
    if (isBusy || isLoading || isWishlistSheetOpen()) return;
    setSaveError("");
    const { lists, holding } = readWishlistMeta();
    // Owner decisions 2026-11-19/20: guests get the sign-in note; members create, quick-save, choose or remove.
    const tap = heartTap({
      signedIn: isAuthenticated,
      isSaved,
      lists,
      holding: holding[villaId] ?? [],
      insideListId,
      ready: wishlistStatus === "ready",
    });
    if (tap.kind === "wait") {
      // Still loading: keep the tap and run it once the wishlists are in, so it is never lost. The load failed: say so
      // and load again (the kept tap then runs when it succeeds).
      tapWaiting.current = true;
      if (wishlistStatus === "error") {
        reportError(WISHLIST_COPY.failed);
        void refreshWishlist();
      }
      return;
    }
    if (tap.kind === "auth-note") {
      if (onAuthNote) {
        onAuthNote();
      } else {
        openAuth("login");
      }
      return;
    }
    const sheetVilla = { id: villaId, name: villa.name };
    if (tap.kind === "create" || tap.kind === "ask") {
      openWishlistSheet({ villa: sheetVilla, view: tap.kind === "create" ? "create" : "save" });
      return;
    }
    const wasSaved = isSaved;
    setIsBusy(true);
    try {
      const answer = tap.kind === "quick-save"
        ? await saveToList(villaId, tap.listId)
        : await removeFromLists(villaId, tap.listId);
      if (!answer || "error" in answer) {
        // The server's reason (a cap, a wishlist gone in another tab) beats a generic "try again".
        reportError(
          answer && "error" in answer && answer.status
            ? answer.error
            : saveErrorMessage({ wasSaved, signedOut: !getStoredAuthToken() }),
        );
        return;
      }
      const nowSaved = answer.result.ids.includes(villaId);
      onSavedChange?.(villaId, nowSaved);
      if (tap.kind === "quick-save") {
        const target = answer.result.savedTo[0] ?? { id: tap.listId, name: lists[0]?.name ?? "" };
        toast.success({
          ...WISHLIST_COPY.savedTo(target.name),
          message: villa.name,
          image: villa.image,
          action: {
            label: WISHLIST_COPY.newWishlist,
            onClick: () => openWishlistSheet({ villa: sheetVilla, view: "create", moveFrom: target.id }),
          },
        });
      } else {
        const listName =
          lists.find((list) => list.id === (tap.listId ?? answer.result.listIds[0]))?.name ??
          WISHLIST_COPY.yourWishlist;
        // Nothing was removed (another card or device got there first): no Undo, it would save into a wishlist by guess.
        if (answer.result.listIds.length) {
          offerUndo(villaId, villa.name, villa.image, listName, answer.result.listIds);
        }
      }
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (wishlistStatus !== "ready" || !tapWaiting.current) return;
    tapWaiting.current = false;
    void runHeart();
    // runHeart reads fresh state when it runs; only the status change should replay the kept tap.
  }, [wishlistStatus]);

  return {
    isSaved,
    isBusy,
    saveError,
    onHeart: () => {
      void runHeart();
    },
  };
}
