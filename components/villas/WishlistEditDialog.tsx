"use client";

/**
 * Rename and Delete for one wishlist, in the same frame as the save sheet (bottom sheet on phones, centred dialog from
 * 768 px). Mount inside AnimatePresence. Delete puts focus on Cancel, the safe choice, so Enter never deletes by accident.
 */
import { useId, useState, type FormEvent } from "react";
import { WISHLIST_COPY as COPY } from "@/lib/notifications/guest-messages";
import { normalizeWishlistName, WISHLIST_NAME_MAX, wishlistNameProblem, type WishlistSummary } from "@/lib/wishlist-rules";
import { deleteWishlist, renameWishlist } from "./savedVillas";
import { WishlistSheetFrame } from "./WishlistSheet";

type Props = {
  mode: "rename" | "delete";
  list: WishlistSummary;
  onClose: () => void;
  /** After a delete went through: the page leaves the wishlist's view. */
  onDeleted: () => void;
};

export default function WishlistEditDialog({ mode, list, onClose, onDeleted }: Props) {
  const titleId = useId();
  const [name, setName] = useState(list.name);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { length } = normalizeWishlistName(name);
  const nameProblem = wishlistNameProblem(name);
  const unchanged = normalizeWishlistName(name).name === list.name;

  const rename = async (event: FormEvent) => {
    event.preventDefault();
    if (nameProblem || busy) return;
    if (unchanged) return onClose();
    setBusy(true);
    setError("");
    const answer = await renameWishlist(list.id, name);
    setBusy(false);
    if (answer && "error" in answer) return setError(answer.error);
    onClose();
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const answer = await deleteWishlist(list.id);
    setBusy(false);
    if (!answer) return onClose();
    // Already deleted (another tab or device): the outcome the member asked for, so finish the same way.
    if ("error" in answer && answer.status !== 404) return setError(answer.error);
    onDeleted();
  };

  return (
    <WishlistSheetFrame titleId={titleId} onClose={onClose}>
      {(startDrag) => mode === "rename" ? (
        <form className="wishlist-sheet__form" onSubmit={rename} noValidate>
          <h2 id={titleId} className="wishlist-sheet__title" onPointerDown={startDrag}>{COPY.renameTitle}</h2>
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
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => { setName(event.target.value); setError(""); }}
              />
            </label>
            <p id={`${titleId}-count`} className={`wishlist-sheet__count ${length > WISHLIST_NAME_MAX ? "is-over" : ""}`}>
              {COPY.counter(length, WISHLIST_NAME_MAX)}
            </p>
            {error ? <p id={`${titleId}-error`} className="wishlist-sheet__error" role="alert">{error}</p> : null}
          </div>
          <div className="wishlist-sheet__footer">
            <button type="button" className="wishlist-sheet__text-button" onClick={onClose}>{COPY.cancel}</button>
            <button type="submit" className="wishlist-sheet__primary" disabled={Boolean(nameProblem) || busy}>
              {busy ? COPY.saving : COPY.save}
            </button>
          </div>
        </form>
      ) : (
        <div className="wishlist-sheet__form">
          <h2 id={titleId} className="wishlist-sheet__title" onPointerDown={startDrag}>{COPY.deleteTitle}</h2>
          <div className="wishlist-sheet__body">
            <p id={`${titleId}-body`} className="wishlist-sheet__message">{COPY.deleteBody(list.name, list.count)}</p>
            {error ? <p className="wishlist-sheet__error" role="alert">{error}</p> : null}
          </div>
          <div className="wishlist-sheet__footer">
            <button type="button" className="wishlist-sheet__text-button" onClick={onClose} autoFocus aria-describedby={`${titleId}-body`}>
              {COPY.cancel}
            </button>
            <button type="button" className="wishlist-sheet__primary" onClick={() => void remove()} disabled={busy}>
              {busy ? COPY.deleting : COPY.deleteWishlist}
            </button>
          </div>
        </div>
      )}
    </WishlistSheetFrame>
  );
}
