"use client";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { FiX } from "react-icons/fi";
import { useFocusTrap } from "./useFocusTrap";
import CollapsedRow from "./CollapsedRow";
import WhereCard from "./WhereCard";
import WhenCard from "./WhenCard";
import WhoCard from "./WhoCard";
import ActionBar from "./ActionBar";
import { STEPS } from "./constants";
import { formatDateRange, guestsLabel } from "./format";
import type { Guests, SearchState, Step } from "./types";
import type { DateRange } from "./pickDay";

type LocationsStatus = "loading" | "ready" | "error";

type SheetProps = {
  state: SearchState;
  step: Step;
  onStepChange: (step: Step) => void;
  onLocationInput: (value: string) => void;
  onLocationSelect: (value: string) => void;
  onDatesChange: (range: DateRange) => void;
  /** The member's usual stay length, used to set the check-out after a check-in. */
  nights?: number;
  onGuestsChange: (guests: Guests) => void;
  canClear: boolean;
  onClearAll: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

// Same query as the CSS that turns the sheet into a centred modal (globals.css, "Tablet and desktop").
const MODAL_QUERY = "(min-width: 768px) and (min-height: 600px)";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function Sheet({
  state,
  step,
  onStepChange,
  onLocationInput,
  onLocationSelect,
  onDatesChange,
  nights,
  onGuestsChange,
  canClear,
  onClearAll,
  onClose,
  onSubmit,
}: SheetProps) {
  const reduce = usePrefersReducedMotion();
  // The sheet only mounts after a click, so reading the viewport here is safe and stable for its lifetime.
  const [modal] = useState(() => window.matchMedia(MODAL_QUERY).matches);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [locationsStatus, setLocationsStatus] = useState<LocationsStatus>("loading");

  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lodgify/search-options", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((data) => {
        if (Array.isArray(data.locations)) {
          setLocations(data.locations);
          setLocationsStatus("ready");
        } else {
          setLocationsStatus("error");
        }
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setLocationsStatus("error");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // Keep the sheet reachable when the on-screen keyboard resizes the visual
  // viewport — 100dvh alone can still clip content on some mobile browsers.
  // Scoped to the mobile full-screen sheet only (< 768px): the tablet modal
  // has its own definite height and must not be fought by an inline style,
  // and only kicks in past a real keyboard-sized delta so ordinary browser
  // chrome (address bar show/hide) doesn't trigger a layout jump.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = dialogRef.current;
    if (!vv || !el) return;
    const onResize = () => {
      if (window.innerWidth >= 768) {
        el.style.height = "";
        return;
      }
      const keyboardInset = window.innerHeight - vv.height;
      el.style.height = keyboardInset > 120 ? `${vv.height}px` : "";
    };
    onResize();
    vv.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
      el.style.height = "";
    };
  }, []);

  const values: Record<Step, string> = {
    where: state.location || "Anywhere in Bali",
    when: formatDateRange(state.checkIn, state.checkOut) || "Add dates",
    who: guestsLabel(state.guests),
  };

  const activeTitle = STEPS.find((s) => s.id === step)?.title ?? "Search";

  const sheet = (
    <div className="mobile-booking-search__overlay-layer">
      <motion.div
        aria-hidden
        className="mobile-booking-search__overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={activeTitle}
        tabIndex={-1}
        {...(reduce
          ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 } }
          : modal
            // Centred modal: rises a little and settles; leaving is quicker than arriving.
            ? {
              initial: { opacity: 0, transform: "translateY(16px) scale(0.97)" },
              animate: { opacity: 1, transform: "translateY(0px) scale(1)", transition: { duration: 0.34, ease: EASE_OUT } },
              exit: { opacity: 0, transform: "translateY(8px) scale(0.985)", transition: { duration: 0.18, ease: EASE_OUT } },
            }
            : { initial: { y: "100%", opacity: 0.6 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 }, transition: { type: "spring", stiffness: 340, damping: 34 } })}
        className="mobile-booking-search__sheet"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="mobile-booking-search__close"
        >
          <FiX size={20} aria-hidden />
        </button>

        <div className="mobile-booking-search__stack">
          {STEPS.map((s) =>
            s.id === step ? (
              <div key={s.id} className="mobile-booking-search__card">
                <p className="mobile-booking-search__card-title">{s.title}</p>
                {s.id === "where" ? (
                  <WhereCard
                    value={state.location}
                    locations={locations}
                    status={locationsStatus}
                    onInput={onLocationInput}
                    onSelect={onLocationSelect}
                  />
                ) : s.id === "when" ? (
                  <WhenCard range={state} nights={nights} onChange={onDatesChange} />
                ) : (
                  <WhoCard guests={state.guests} onChange={onGuestsChange} />
                )}
              </div>
            ) : (
              <CollapsedRow
                key={s.id}
                id={s.id}
                label={s.label}
                value={values[s.id]}
                onSelect={onStepChange}
              />
            ),
          )}
        </div>

        <ActionBar canClear={canClear} onClearAll={onClearAll} onSearch={onSubmit} />
      </motion.div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
