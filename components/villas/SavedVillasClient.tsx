"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { VillaSearchResult } from "@/lib/lodgify";
import { WISHLIST_COPY as COPY } from "@/lib/notifications/guest-messages";
import type { WishlistSummary } from "@/lib/wishlist-rules";
import PremiumVillaCard from "./PremiumVillaCard";
import WishlistCard from "./WishlistCard";
import WishlistEditDialog from "./WishlistEditDialog";
import { readSavedVillaIds, readWishlistMeta, removeFromLists, subscribeSavedVillas, type WishlistState } from "./savedVillas";
import { coverPhotos, listVillaIds } from "./wishlistCards";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useToast } from "@/components/providers/ToastProvider";

type SavedVillasClientProps = {
  villas: VillaSearchResult[];
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * Saved villas: the member's wishlists as cards, and one wishlist's villas at `?list=<id>` (so Back returns to the
 * grid). Inside a wishlist the heart removes a villa from that wishlist only.
 */
export default function SavedVillasClient({ villas }: SavedVillasClientProps) {
  const [state, setState] = useState<WishlistState>({ ids: [], lists: [], holding: {} });
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, wishlistStatus, refreshWishlist } = useAuth();
  const { openAuth } = useAuthModal();
  const reduce = usePrefersReducedMotion();
  const router = useRouter();
  const toast = useToast();
  // Rename/Delete live here, outside the view swap, so Delete still plays its exit when the page returns to the grid.
  // The dialog keeps the wishlist it opened with, since a deleted one is no longer in the state.
  const [dialog, setDialog] = useState<{ mode: "rename" | "delete"; list: WishlistSummary } | null>(null);
  const listParam = Number(useSearchParams().get("list"));
  const listId = Number.isInteger(listParam) && listParam > 0 ? listParam : null;
  const list = listId != null ? state.lists.find((item) => item.id === listId) : undefined;
  // A wishlist that disappears while it is open (deleted here or in another tab) returns to the grid at once,
  // instead of flashing "could not find" before the route changes. Only an unknown id gets that message.
  const knownLists = useRef(new Set<number>());
  const vanished = listId != null && !list && knownLists.current.has(listId);

  useEffect(() => {
    setState({ ids: readSavedVillaIds(), ...readWishlistMeta() });
    setIsReady(true);
    return subscribeSavedVillas(({ ids, lists, holding }) => setState({ ids, lists: lists ?? [], holding: holding ?? {} }));
  }, []);

  useEffect(() => { for (const item of state.lists) knownLists.current.add(item.id); }, [state.lists]);
  useEffect(() => { if (vanished) router.replace("/saved-villas"); }, [vanished, router]);

  if (!isReady || isLoading) {
    return (
      <div className="villa-saved-empty">
        <p>Loading your saved villas...</p>
      </div>
    );
  }

  // Only signed-in members save villas (owner decision 2026-11-19).
  if (!isAuthenticated) {
    return (
      <div className="villa-saved-empty">
        <p>Sign in to see the villas you have saved for later.</p>
        <button type="button" onClick={() => openAuth("login")}>Sign in</button>
      </div>
    );
  }

  if (wishlistStatus === "loading") {
    return <div className="villa-saved-empty" role="status"><p>Loading your saved villas...</p></div>;
  }

  if (wishlistStatus === "error") {
    return (
      <div className="villa-saved-empty" role="alert">
        <p>We could not load your saved villas. Your choices have not been changed.</p>
        <button type="button" onClick={() => void refreshWishlist()}>Try again</button>
      </div>
    );
  }

  // The view swap (grid to one wishlist and back) is the page's one authored moment: a short rise into place.
  const viewMotion = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px)" },
    animate: reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" },
    transition: { duration: 0.24, ease: EASE_OUT },
  };

  const showGrid = listId == null || vanished;
  return (
    <>
      <motion.div key={showGrid ? "all" : listId} {...viewMotion}>
        {showGrid ? (
          <WishlistGrid state={state} villas={villas} />
        ) : list ? (
          <WishlistView list={list} villas={villas} onEdit={(mode) => setDialog({ mode, list })} />
        ) : (
          <div className="villa-saved-empty">
            <p>{COPY.listGone}</p>
            <Link href="/saved-villas">{COPY.allWishlists}</Link>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {dialog ? (
          <WishlistEditDialog
            key={dialog.mode}
            mode={dialog.mode}
            list={dialog.list}
            onClose={() => setDialog(null)}
            onDeleted={() => {
              setDialog(null);
              toast.success(COPY.deleted(dialog.list.name));
              router.replace("/saved-villas");
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function WishlistGrid({ state, villas }: { state: WishlistState; villas: VillaSearchResult[] }) {
  const { lists } = state;
  if (lists.length === 0) {
    return (
      <div className="villa-saved-empty">
        <p>{COPY.noWishlists}</p>
        <Link href="/villas">Explore villas</Link>
      </div>
    );
  }
  return (
    <div className="villa-collection-grid wishlist-grid">
      {lists.map((list, index) => (
        <WishlistCard
          key={list.id}
          list={list}
          photos={coverPhotos(listVillaIds(list), villas)}
          href={`/saved-villas?list=${list.id}`}
          priority={index < 2}
        />
      ))}
    </div>
  );
}

function WishlistView({ list, villas, onEdit }: { list: WishlistSummary; villas: VillaSearchResult[]; onEdit: (mode: "rename" | "delete") => void }) {
  const toast = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const byId = useMemo(() => new Map(villas.map((villa) => [String(villa.id), villa])), [villas]);
  const ids = listVillaIds(list);
  const available = ids.flatMap((id) => byId.get(id) ?? []);
  const missing = ids.filter((id) => !byId.has(id));

  const removeMissing = async (villaId: string) => {
    setRemovingId(villaId);
    const answer = await removeFromLists(villaId, list.id);
    setRemovingId(null);
    if (!answer || "error" in answer) toast.error({ title: COPY.failed });
  };

  return (
    <>
      <header className="wishlist-view__head">
        <Link href="/saved-villas" className="wishlist-view__back">
          <FiArrowLeft aria-hidden="true" />
          {COPY.allWishlists}
        </Link>
        <div className="wishlist-view__title-row">
          <div className="wishlist-view__title">
            <h2>{list.name}</h2>
            <p>{COPY.villaCount(list.count)}</p>
          </div>
          <div className="wishlist-view__actions">
            <button type="button" className="wishlist-view__action" onClick={() => onEdit("rename")}>{COPY.rename}</button>
            <button type="button" className="wishlist-view__action" onClick={() => onEdit("delete")}>{COPY.deleteWishlist}</button>
          </div>
        </div>
      </header>

      {ids.length === 0 ? (
        <div className="villa-saved-empty">
          <p>{COPY.emptyList}</p>
          <Link href="/villas">Explore villas</Link>
        </div>
      ) : (
        <SavedGrid villas={available} listId={list.id} />
      )}

      {missing.length > 0 ? (
        <section className="wishlist-missing" aria-labelledby={`wishlist-missing-${list.id}`}>
          <h3 id={`wishlist-missing-${list.id}`}>{COPY.missingTitle}</h3>
          <p>{COPY.missingBody}</p>
          <ul>
            {missing.map((id) => (
              <li key={id}>
                <span>{COPY.missingVilla(id)}</span>
                <button
                  type="button"
                  aria-label={`${COPY.remove} ${COPY.missingVilla(id).toLowerCase()} from ${list.name}`}
                  disabled={removingId !== null}
                  onClick={() => void removeMissing(id)}
                >
                  {removingId === id ? COPY.removing : COPY.remove}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

    </>
  );
}

/**
 * One wishlist's villa cards. Removing a heart lets that card fade and settle away (fast, it is the system answering)
 * while the cards after it slide into its place, so the grid never jumps. Reduced motion keeps only the fade.
 */
function SavedGrid({ villas, listId }: { villas: VillaSearchResult[]; listId: number }) {
  const reduce = usePrefersReducedMotion();
  return (
    <div className="villa-collection-grid villa-saved-grid">
      <AnimatePresence initial={false} mode="popLayout">
        {villas.map((villa, index) => (
          <motion.div
            key={villa.id}
            className="villa-saved-item"
            layout={!reduce}
            exit={reduce ? { opacity: 0, transition: { duration: 0.15 } }
              : { opacity: 0, transform: "scale(0.96)", filter: "blur(4px)", transition: { duration: 0.2, ease: EASE_OUT } }}
            transition={{ layout: { duration: 0.32, ease: EASE_IN_OUT } }}
          >
            <PremiumVillaCard villa={villa} priority={index < 2} initialSaved insideListId={listId} headingLevel="h3" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
