"use client";

import { useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { mergedVillasTitle } from "@/lib/notifications/guest-messages";
import { SAVED_VILLAS_MERGED_EVENT, type SavedVillasMerged } from "./savedVillas";

/** One toast after sign-in when villas a guest saved in this browser were added to the account (`wishlist/sync` merged). */
export default function SavedVillasNotifier() {
  const toast = useToast();

  useEffect(() => {
    const onMerged = (event: Event) => {
      const merged = Number((event as CustomEvent<SavedVillasMerged>).detail?.merged) || 0;
      if (merged < 1) return;
      toast.success({ title: mergedVillasTitle(merged), action: { label: "View saved villas", href: "/saved-villas" } });
    };
    window.addEventListener(SAVED_VILLAS_MERGED_EVENT, onMerged);
    return () => window.removeEventListener(SAVED_VILLAS_MERGED_EVENT, onMerged);
  }, [toast]);

  return null;
}
