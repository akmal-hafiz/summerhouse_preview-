"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  readSavedVillaIds,
  SAVED_VILLAS_ERROR_EVENT,
  subscribeSavedVillas,
} from "@/components/villas/savedVillas";

export function useDashboardWishlist() {
  const { wishlistStatus, refreshWishlist } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [mutationError, setMutationError] = useState(false);

  useEffect(() => {
    setIds(readSavedVillaIds());
    const unsubscribe = subscribeSavedVillas(({ ids: nextIds }) => setIds(nextIds));
    const onError = () => setMutationError(true);
    window.addEventListener(SAVED_VILLAS_ERROR_EVENT, onError);
    return () => {
      unsubscribe();
      window.removeEventListener(SAVED_VILLAS_ERROR_EVENT, onError);
    };
  }, []);

  const retry = async () => {
    setMutationError(false);
    await refreshWishlist();
  };

  return { ids, status: wishlistStatus, mutationError, setMutationError, retry };
}
