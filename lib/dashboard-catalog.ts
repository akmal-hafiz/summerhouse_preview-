import { getCmsLodgifySnapshot } from "@/lib/cms";
import { searchAvailableVillas } from "@/lib/lodgify";

export async function getDashboardCatalog() {
  try {
    const snapshot = await getCmsLodgifySnapshot();
    if (!snapshot?.success) {
      return { villas: [], status: "unavailable" as const };
    }

    return { villas: await searchAvailableVillas(), status: "ready" as const };
  } catch {
    return { villas: [], status: "unavailable" as const };
  }
}
