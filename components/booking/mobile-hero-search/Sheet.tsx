"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
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

type LocationsStatus = "loading" | "ready" | "error";

type SheetProps = {
  state: SearchState;
  step: Step;
  onStepChange: (step: Step) => void;
  onLocationInput: (value: string) => void;
  onLocationSelect: (value: string) => void;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onGuestsChange: (guests: Guests) => void;
  onClearAll: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function Sheet({
  state,
  step,
  onStepChange,
  onLocationInput,
  onLocationSelect,
  onDatesChange,
  onGuestsChange,
  onClearAll,
  onClose,
  onSubmit,
}: SheetProps) {
  const reduce = useReducedMotion();
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
    where: state.location || "Anywhere",
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
        initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0.6 }}
        animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
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
                  <WhenCard checkIn={state.checkIn} checkOut={state.checkOut} onChange={onDatesChange} />
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

        <ActionBar onClearAll={onClearAll} onSearch={onSubmit} />
      </motion.div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
