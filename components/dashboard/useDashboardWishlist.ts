"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  readWishlistMeta,
  subscribeSavedVillas,
} from "@/components/villas/savedVillas";
import type { WishlistSummary } from "@/lib/wishlist-rules";

export function useDashboardWishlist() {
  const { wishlistStatus, refreshWishlist } = useAuth();
  const [lists, setLists] = useState<WishlistSummary[]>([]);

  useEffect(() => {
    setLists(readWishlistMeta().lists);
    return subscribeSavedVillas(({ lists: nextLists }) => setLists(nextLists ?? []));
  }, []);

  return { lists, status: wishlistStatus, retry: () => void refreshWishlist() };
}
