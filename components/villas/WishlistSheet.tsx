"use client";

/**
 * The one wishlist sheet every heart opens: "Create wishlist" (the first wishlist, or a new one) and "Save to
 * wishlist" (ticks, the two most used wishlists first). A bottom sheet on phones, a centred dialog from 768 px,
 * following the mobile search sheet. Mounted once in the website layout; hearts open it with openWishlistSheet().
 */
import { useEffect, useId, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import ModalLayer from "@/components/common/ModalLayer";
import { useToast } from "@/components/providers/ToastProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { WISHLIST_COPY as COPY } from "@/lib/notifications/guest-messages";
import { normalizeWishlistName, sheetLists, WISHLIST_NAME_MAX, wishlistNameProblem, type WishlistSummary } from "@/lib/wishlist-rules";
import { createWishlist, readSavedVillaIds, readWishlistMeta, removeFromLists, saveToList, subscribeSavedVillas } from "./savedVillas";

export type WishlistSheetRequest = {
  villa: { id: string; name: string };
  view: "create" | "save";
  /** The toast's "New wishlist": the villa moves out of this wishlist into the new one. */
  moveFrom?: number;
};

const OPEN_EVENT = "summerhouses:wishlist-sheet";
const MODAL_QUERY = "(min-width: 768px) and (min-height: 600px)";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
let sheetOpen = false;
const villaImages = new Map<string, string>();

/** Hearts do nothing while the sheet is open, so one sheet never swaps villas under the member. */
export const isWishlistSheetOpen = () => sheetOpen;
export function openWishlistSheet(request: WishlistSheetRequest) {
  window.dispatchEvent(new CustomEvent<WishlistSheetRequest>(OPEN_EVENT, { detail: request }));
}
/** Cards on the page lend their photo, so a wishlist row can show its newest villa. */
export function rememberVillaImage(villaId: string, url?: string | null) {
  if (url) villaImages.set(villaId, url);
}

export default function WishlistSheetHost() {
  const [request, setRequest] = useState<WishlistSheetRequest | null>(null);
  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<WishlistSheetRequest>).detail;
      if (!detail || sheetOpen) return;
      sheetOpen = true;
      setRequest(detail);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);
  return (
    <AnimatePresence onExitComplete={() => { sheetOpen = false; }}>
      {request ? <WishlistSheet key="wishlist-sheet" request={request} onClose={() => setRequest(null)} /> : null}
    </AnimatePresence>
  );
}

function WishlistSheet({ request, onClose }: { request: WishlistSheetRequest; onClose: () => void }) {
  const toast = useToast();
  const reduce = usePrefersReducedMotion();
  const titleId = useId();
  const [view, setView] = useState(request.view);
  const [state, setState] = useState(() => ({ ids: readSavedVillaIds(), ...readWishlistMeta() }));
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | "create" | null>(null);
  const [showMore, setShowMore] = useState(false);
  // Spoken after a tick changes: the visual circle alone says nothing to a screen reader.
  const [announce, setAnnounce] = useState("");
  // Views crossfade only after the first swap, so opening the sheet plays one entrance, not two.
  const [swapped, setSwapped] = useState(false);
  const villaId = request.villa.id;
  const goTo = (next: "create" | "save") => { setSwapped(true); setView(next); setError(""); };

  useEffect(() => subscribeSavedVillas((change) => setState({ ids: change.ids, lists: change.lists ?? [], holding: change.holding ?? {} })), []);

  const holding = state.holding[villaId] ?? [];
  const { shown, more } = sheetLists(state.lists, holding);
  const rows = showMore ? [...shown, ...more] : shown;
  const { length } = normalizeWishlistName(name);
  const nameProblem = wishlistNameProblem(name);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (nameProblem || busy) return;
    setBusy("create");
    setError("");
    const answer = await createWishlist(name, villaId, request.moveFrom);
    setBusy(null);
    if (!answer) return onClose();
    if ("error" in answer) return setError(answer.error);
    toast.success({ ...COPY.savedTo(answer.created?.name ?? normalizeWishlistName(name).name), message: request.villa.name, image: villaImages.get(villaId) });
    onClose();
  };

  const toggle = async (list: WishlistSummary) => {
    if (busy) return;
    setBusy(list.id);
    setError("");
    const removing = holding.includes(list.id);
    const answer = removing ? await removeFromLists(villaId, list.id) : await saveToList(villaId, list.id);
    setBusy(null);
    if (answer && "error" in answer) setError(answer.error);
    else if (answer) setAnnounce((removing ? COPY.removedFrom(list.name) : COPY.savedTo(list.name)).title);
  };

  const viewMotion = {
    initial: swapped ? (reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }) : false,
    animate: reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" },
    transition: { duration: 0.18, ease: EASE_OUT },
  } as const;

  return (
    <WishlistSheetFrame titleId={titleId} onClose={onClose}>
      {(startDrag) => (
        <>
          <p className="wishlist-sheet__sr" role="status">{announce}</p>
          {view === "create" ? (
            <motion.form key="create" className="wishlist-sheet__form" onSubmit={create} noValidate {...viewMotion}>
              <h2 id={titleId} className="wishlist-sheet__title" onPointerDown={startDrag}>{COPY.createTitle}</h2>
              <div className="wishlist-sheet__body">
                <label className="wishlist-sheet__field">
                  <span className="wishlist-sheet__sr">{COPY.nameLabel}</span>
                  <input
                    autoFocus
                    name="name"
                    value={name}
                    placeholder={COPY.nameLabel}
                    autoComplete="off"
                    enterKeyHint="done"
                    aria-invalid={Boolean(error) || length > WISHLIST_NAME_MAX}
                    aria-describedby={`${titleId}-count${error ? ` ${titleId}-error` : ""}`}
                    onChange={(event) => { setName(event.target.value); setError(""); }}
                  />
                </label>
                <p id={`${titleId}-count`} className={`wishlist-sheet__count ${length > WISHLIST_NAME_MAX ? "is-over" : ""}`}>
                  {COPY.counter(length, WISHLIST_NAME_MAX)}
                </p>
                {error ? <p id={`${titleId}-error`} className="wishlist-sheet__error" role="alert">{error}</p> : null}
              </div>
              <div className="wishlist-sheet__footer">
                <button type="button" className="wishlist-sheet__text-button"
                  onClick={() => (request.view === "save" ? goTo("save") : onClose())}>
                  {COPY.cancel}
                </button>
                <button type="submit" className="wishlist-sheet__primary" disabled={Boolean(nameProblem) || busy === "create"}>
                  {busy === "create" ? COPY.creating : COPY.create}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="save" className="wishlist-sheet__form" {...viewMotion}>
              <div className="wishlist-sheet__head" onPointerDown={startDrag}>
                <h2 id={titleId} className="wishlist-sheet__title">{COPY.saveTitle}</h2>
                <p className="wishlist-sheet__villa">{request.villa.name}</p>
                <button type="button" className="wishlist-sheet__close" aria-label={COPY.close} onClick={onClose}>
                  <FiX aria-hidden="true" />
                </button>
              </div>
              <ul className="wishlist-sheet__lists">
                {rows.map((list) => {
                  const ticked = holding.includes(list.id);
                  const cover = list.coverIds.map((id) => villaImages.get(id)).find(Boolean);
                  return (
                    <li key={list.id}>
                      <button type="button" className={`wishlist-sheet__row ${ticked ? "is-ticked" : ""}`} aria-pressed={ticked}
                        aria-busy={busy === list.id || undefined} onClick={() => toggle(list)}>
                        <span className="wishlist-sheet__cover" aria-hidden="true">
                          {cover ? <img src={cover} alt="" loading="lazy" /> : <span>{list.name.slice(0, 1).toUpperCase()}</span>}
                        </span>
                        <span className="wishlist-sheet__row-text">
                          <strong>{list.name}</strong>
                          <small>{COPY.villaCount(list.count)}</small>
                        </span>
                        <span className="wishlist-sheet__tick" aria-hidden="true"><FiCheck /></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {more.length > 0 && !showMore ? (
                <button type="button" className="wishlist-sheet__more" onClick={() => setShowMore(true)}>{COPY.more(more.length)}</button>
              ) : null}
              {error ? <p className="wishlist-sheet__error" role="alert">{error}</p> : null}
              <div className="wishlist-sheet__footer">
                <button type="button" className="wishlist-sheet__text-button wishlist-sheet__create-new"
                  onClick={() => goTo("create")}>
                  <FiPlus aria-hidden="true" />
                  {COPY.createNew}
                </button>
                <button type="button" className="wishlist-sheet__primary" onClick={onClose}>{COPY.done}</button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </WishlistSheetFrame>
  );
}

/**
 * The sheet's frame, shared by every wishlist dialog (save, create, rename, delete): the native modal layer, the
 * overlay that closes on a tap, a bottom sheet that closes on a swipe of its header on phones, and a centred dialog
 * from 768 px. Mount it inside AnimatePresence so it can play its exit. The header calls `startDrag` on pointer down.
 */
export function WishlistSheetFrame({ titleId, onClose, children }: {
  titleId: string;
  onClose: () => void;
  children: (startDrag: (event: ReactPointerEvent) => void) => ReactNode;
}) {
  const reduce = usePrefersReducedMotion();
  const [modal] = useState(() => window.matchMedia(MODAL_QUERY).matches);
  const dragControls = useDragControls();
  // A swipe down on the header closes the bottom sheet; Esc, Cancel and the close button stay the other ways out.
  const startDrag = (event: ReactPointerEvent) => { if (!modal) dragControls.start(event); };

  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.16 } }
    : modal
      ? {
        initial: { opacity: 0, transform: "translateY(12px) scale(0.97)" },
        animate: { opacity: 1, transform: "translateY(0px) scale(1)", transition: { duration: 0.28, ease: EASE_OUT } },
        exit: { opacity: 0, transform: "translateY(6px) scale(0.985)", transition: { duration: 0.16, ease: EASE_OUT } },
      }
      : {
        initial: { transform: "translateY(100%)" },
        animate: { transform: "translateY(0%)", transition: { duration: 0.32, ease: EASE_OUT } },
        exit: { transform: "translateY(100%)", transition: { duration: 0.2, ease: EASE_OUT } },
      };

  return createPortal(
    <ModalLayer lockScroll onClose={onClose} aria-labelledby={titleId}>
      <div className="wishlist-sheet-layer">
        <motion.div aria-hidden className="wishlist-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
        <motion.div
          className="wishlist-sheet-drag"
          drag={modal ? false : "y"}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.7 }}
          dragMomentum={false}
          onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 400) onClose(); }}
        >
          <motion.div className={`wishlist-sheet ${modal ? "is-modal" : "is-sheet"}`} {...panelMotion}>
            {children(startDrag)}
          </motion.div>
        </motion.div>
      </div>
    </ModalLayer>,
    document.body,
  );
}
