export const SAVED_VILLAS_STORAGE_KEY = "summerhouses:saved-villas";
export const SAVED_VILLAS_CHANGED_EVENT = "summerhouses:saved-villas-changed";

export type SavedVillasChange = {
  ids: string[];
  count: number;
};

export function readSavedVillaIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(SAVED_VILLAS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function writeSavedVillaIds(ids: string[]) {
  if (typeof window === "undefined") return;

  const nextIds = Array.from(new Set(ids.map(String).filter(Boolean)));
  window.localStorage.setItem(SAVED_VILLAS_STORAGE_KEY, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent<SavedVillasChange>(SAVED_VILLAS_CHANGED_EVENT, {
    detail: {
      ids: nextIds,
      count: nextIds.length,
    },
  }));
}

export function getSavedVillasCount() {
  return readSavedVillaIds().length;
}

export function toggleSavedVillaId(villaId: string | number) {
  const id = String(villaId);
  const savedIds = readSavedVillaIds();
  const isSaved = savedIds.includes(id);
  const nextIds = isSaved ? savedIds.filter((item) => item !== id) : [...savedIds, id];

  writeSavedVillaIds(nextIds);
  return {
    saved: !isSaved,
    ids: nextIds,
    count: nextIds.length,
  };
}

export function subscribeSavedVillas(callback: (change: SavedVillasChange) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleCustomEvent = (event: Event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    if (detail && Array.isArray(detail.ids)) {
      callback({
        ids: detail.ids.map(String),
        count: Number(detail.count) || detail.ids.length,
      });
      return;
    }

    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length });
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== SAVED_VILLAS_STORAGE_KEY) return;
    const ids = readSavedVillaIds();
    callback({ ids, count: ids.length });
  };

  window.addEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(SAVED_VILLAS_CHANGED_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
