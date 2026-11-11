"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { FiDroplet, FiHeart, FiHome, FiMapPin, FiUsers, FiX } from "react-icons/fi";
import type { VillaSearchResult } from "@/lib/lodgify";
import {
  readSavedVillaIds,
  restoreSavedVillaId,
  subscribeSavedVillas,
  toggleGuestSavedVillaId,
  toggleSavedVillaId,
} from "./savedVillas";
import { isShowcasePreview } from "@/lib/showcase-preview";
import { getStoredAuthToken } from "@/lib/auth-client";
import { SAVE_TOASTS, saveErrorMessage, savePromptCopy } from "@/lib/notifications/guest-messages";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { villaHref } from "@/lib/promo-param";

type PremiumVillaCardProps = {
  villa: VillaSearchResult;
  priority?: boolean;
  initialSaved?: boolean;
  onSavedChange?: (villaId: string, saved: boolean) => void;
  /** A validated `?promo=` code from the listing, kept on the links to the villa page. */
  promo?: string;
};

function formatCount(value: number | null | undefined, singular: string, plural: string) {
  if (!value) return null;
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function PremiumVillaCard({
  villa,
  priority = false,
  initialSaved = false,
  onSavedChange,
  promo = "",
}: PremiumVillaCardProps) {
  const villaId = String(villa.id);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [promptPosition, setPromptPosition] = useState({ top: 0, left: 0 });
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { openAuth } = useAuthModal();
  const toast = useToast();
  const promptCopy = savePromptCopy(villa.name);

  useEffect(() => {
    setIsSaved(readSavedVillaIds().includes(villaId));
    return subscribeSavedVillas(({ ids }) => {
      setIsSaved(ids.includes(villaId));
    });
  }, [villaId]);

  useEffect(() => {
    if (isAuthenticated) setShowAuthPrompt(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const closeOtherPrompt = (event: Event) => {
      if ((event as CustomEvent).detail !== saveButtonRef.current) setShowAuthPrompt(false);
    };
    window.addEventListener("summerhouses:wishlist-auth-prompt", closeOtherPrompt);
    return () => window.removeEventListener("summerhouses:wishlist-auth-prompt", closeOtherPrompt);
  }, []);

  useEffect(() => {
    if (!showAuthPrompt) return;
    const updatePosition = () => {
      const anchor = saveButtonRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const width = Math.min(296, window.innerWidth - 24);
      const height = promptRef.current?.offsetHeight || 176;
      setPromptPosition({
        left: Math.max(12, Math.min(anchor.right - width, window.innerWidth - width - 12)),
        top: anchor.bottom + height + 10 < window.innerHeight
          ? anchor.bottom + 10
          : Math.max(12, anchor.top - height - 10),
      });
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (promptRef.current?.contains(event.target as Node) || saveButtonRef.current?.contains(event.target as Node)) return;
      setShowAuthPrompt(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowAuthPrompt(false);
      saveButtonRef.current?.focus();
    };
    updatePosition();
    promptRef.current?.querySelector<HTMLButtonElement>("button[data-prompt-primary]")?.focus();
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showAuthPrompt]);

  const facts = useMemo(() => ([
    { icon: FiUsers, label: formatCount(villa.guests || villa.capacity, "guest", "guests") },
    { icon: FiHome, label: formatCount(villa.bedrooms, "bedroom", "bedrooms") },
    { icon: FiDroplet, label: formatCount(villa.bathrooms, "bathroom", "bathrooms") },
  ].filter((item): item is { icon: IconType; label: string } => Boolean(item.label))), [
    villa.bathrooms,
    villa.bedrooms,
    villa.capacity,
    villa.guests,
  ]);

  // Undo outlives the card (the saved list unmounts a removed card), so it uses only module and context helpers.
  const offerUndo = (id: string, name: string) => {
    toast.success({
      ...SAVE_TOASTS.removed,
      message: name,
      action: {
        label: "Undo",
        onClick: () => {
          void restoreSavedVillaId(id).then((restored) => {
            if (restored) toast.success(getStoredAuthToken() ? { ...SAVE_TOASTS.saved, message: name } : { ...SAVE_TOASTS.guestSaved });
            else toast.error({ ...SAVE_TOASTS.undoFailed });
          });
        },
      },
    });
  };

  const toggleSaved = async () => {
    if (isSaving || isLoading) return;
    setSaveError("");
    if (!isAuthenticated) {
      // Guests keep the villa in this tab at once; the prompt offers the sign-in that keeps it everywhere.
      const result = toggleGuestSavedVillaId(villaId);
      if (!result) return;
      setIsSaved(result.saved);
      onSavedChange?.(villaId, result.saved);
      if (result.saved) {
        window.dispatchEvent(new CustomEvent("summerhouses:wishlist-auth-prompt", { detail: saveButtonRef.current }));
        setShowAuthPrompt(true);
        toast.success({ ...SAVE_TOASTS.guestSaved, action: { label: "Sign in", onClick: () => openAuth("login") } });
      } else {
        setShowAuthPrompt(false);
        offerUndo(villaId, villa.name);
      }
      return;
    }
    const wasSaved = isSaved;
    setIsSaving(true);
    try {
      const result = await toggleSavedVillaId(villaId);
      if (!result) {
        setSaveError(saveErrorMessage({ wasSaved, signedOut: !getStoredAuthToken() }));
        return;
      }
      setIsSaved(result.saved);
      onSavedChange?.(villaId, result.saved);
      if (result.saved) toast.success({ ...SAVE_TOASTS.saved, message: villa.name });
      else offerUndo(villaId, villa.name);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="villa-catalog-card">
      <div className="villa-catalog-card__media">
        <Link href={villaHref(villa.id, promo)} className="villa-catalog-card__image-link" aria-label={`View ${villa.name}`}>
          <Image
            src={villa.imageUrl}
            alt={villa.name}
            fill
            priority={priority}
            sizes="(max-width: 359px) 100vw, (max-width: 767px) 50vw, (max-width: 1180px) 50vw, 33vw"
            className="villa-catalog-card__image"
          />
        </Link>
        <button
          ref={saveButtonRef}
          type="button"
          aria-label={isSaved ? `Remove ${villa.name} from saved villas` : `Save ${villa.name}`}
          aria-pressed={isSaved}
          aria-expanded={showAuthPrompt || undefined}
          aria-controls={showAuthPrompt ? `wishlist-auth-${villaId}` : undefined}
          className={`villa-catalog-card__save ${isSaved ? "is-saved" : ""}`}
          onClick={toggleSaved}
        >
          <FiHeart aria-hidden="true" />
        </button>
      </div>

      {showAuthPrompt && typeof document !== "undefined" && createPortal(
        <div
          id={`wishlist-auth-${villaId}`}
          ref={promptRef}
          className="wishlist-auth-prompt"
          role="dialog"
          aria-labelledby={`wishlist-auth-${villaId}-title`}
          aria-describedby={`wishlist-auth-${villaId}-copy`}
          style={promptPosition}
        >
          <button type="button" className="wishlist-auth-prompt__close" aria-label="Not now" onClick={() => { setShowAuthPrompt(false); saveButtonRef.current?.focus(); }}>
            <FiX aria-hidden="true" />
          </button>
          <p id={`wishlist-auth-${villaId}-title`} className="wishlist-auth-prompt__title">{promptCopy.title}</p>
          <p id={`wishlist-auth-${villaId}-copy`} className="wishlist-auth-prompt__copy">{promptCopy.body}</p>
          <div className="wishlist-auth-prompt__actions">
            <button type="button" className="wishlist-auth-prompt__primary" data-prompt-primary onClick={() => { setShowAuthPrompt(false); openAuth("login"); }}>Sign in</button>
            <button type="button" className="wishlist-auth-prompt__secondary" onClick={() => { setShowAuthPrompt(false); openAuth("register"); }}>Create account</button>
          </div>
        </div>, document.body
      )}

      <div className="villa-catalog-card__body">
        {saveError && <p className="villa-catalog-card__save-error" role="alert">{saveError}</p>}
        <Link href={villaHref(villa.id, promo)} className="villa-catalog-card__title-link">
          <h2>{villa.name}</h2>
        </Link>

        <p className="villa-catalog-card__location">
          <FiMapPin aria-hidden="true" />
          <span>{villa.location || "Bali, Indonesia"}</span>
        </p>

        {facts.length > 0 ? (
          <div className="villa-catalog-card__facts" aria-label={`${villa.name} quick facts`}>
            {facts.map(({ icon: Icon, label }) => (
              <span key={label}>
                <Icon aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        ) : null}

        {villa.availabilityReason === "temporarily_unavailable" ? (
          <p className="villa-catalog-card__availability" role="status">
            We cannot show availability right now
          </p>
        ) : null}

        <div className="villa-catalog-card__footer">
          <p className="villa-catalog-card__price">
            {villa.priceLabel ? (
              <>
                <strong>From {villa.priceLabel}</strong>
                <span>/ night</span>
              </>
            ) : (
              <strong>Rate on request</strong>
            )}
          </p>
          <Link href={isShowcasePreview ? villaHref(villa.id, promo) : `${villaHref(villa.id, promo)}#availability`} className="villa-catalog-card__book">
            {isShowcasePreview ? "View villa" : "Book Now"}
          </Link>
        </div>
      </div>
    </article>
  );
}
