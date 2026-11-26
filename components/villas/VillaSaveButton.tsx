"use client";

import { FiHeart } from "react-icons/fi";
import { useVillaHeart } from "./useVillaHeart";

type VillaSaveButtonProps = {
  villaId: string | number;
  villaName: string;
  image?: string;
};

export default function VillaSaveButton({ villaId, villaName, image }: VillaSaveButtonProps) {
  const { isSaved, isBusy, onHeart } = useVillaHeart(
    { id: villaId, name: villaName, image },
    { toastOnError: true },
  );

  return (
    <button
      type="button"
      className={`villa-detail-save-btn${isSaved ? " is-saved" : ""}`}
      aria-pressed={isSaved}
      aria-busy={isBusy || undefined}
      disabled={isBusy}
      onClick={onHeart}
    >
      <FiHeart aria-hidden="true" />
      <span>{isSaved ? "Saved" : "Save"}</span>
    </button>
  );
}
