"use client";

/**
 * Mobile + tablet hero search.
 *
 * Airbnb-style accordion sheet: one section (Where / When / Who) expanded
 * at a time, the other two collapsed into summary rows, sticky Clear all /
 * Search bar always visible. Business logic (destinations endpoint, query
 * param shape) matches VillaSearchForm exactly so /villas keeps consuming
 * the same query string.
 *
 * State (including which section is active) lives here, at the root, so
 * closing and reopening the sheet preserves the user's progress instead of
 * resetting to "Where" every time.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { parseISODate } from "@/lib/date";
import { useAuth } from "@/components/providers/AuthProvider";
import { loadHistory, recordSearch, searchEntryFromParams, stayHabit } from "@/lib/search-history-client";
import { promoFromSearch, withPromo } from "@/lib/promo-param";
import Trigger from "./Trigger";
import Sheet from "./Sheet";
import { INITIAL_GUESTS, INITIAL_STATE } from "./constants";
import { formatDateRange, guestsLabel } from "./format";
import type { Guests, SearchState, Step } from "./types";
import type { DateRange } from "./pickDay";

export default function MobileHeroSearch() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("where");
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  const onLocationInput = useCallback((value: string) => {
    setState((s) => ({ ...s, location: value }));
  }, []);

  const onLocationSelect = useCallback((value: string) => {
    setState((s) => ({ ...s, location: value }));
    setStep("when");
  }, []);

  // A member's usual party and stay length, read once from their search history the first time the sheet opens.
  // Guests and CMS admins send nothing. It fills only what is still untouched.
  const [habit, setHabit] = useState<{ guests?: number; nights?: number }>({});
  const habitLoaded = useRef(false);
  const isMember = isAuthenticated && !isAdmin;
  useEffect(() => {
    if (!open || !isMember || habitLoaded.current) return;
    habitLoaded.current = true;
    void loadHistory().then((items) => {
      const usual = stayHabit(items);
      setHabit(usual);
      if (usual.guests) {
        setState((s) => (s.guests === INITIAL_GUESTS ? { ...s, guests: { ...s.guests, adults: Math.min(40, usual.guests!) } } : s));
      }
    });
  }, [isMember, open]);

  const onDatesChange = useCallback((range: DateRange) => {
    setState((s) => ({ ...s, ...range }));
    // An auto check-out keeps the calendar open, so the guest sees it and can tap another day.
    if (range.checkOut && !range.autoCheckOut) setStep("who");
  }, []);

  const onGuestsChange = useCallback((guests: Guests) => {
    setState((s) => ({ ...s, guests }));
  }, []);

  const onClearAll = useCallback(() => {
    setState(INITIAL_STATE);
    setStep("where");
  }, []);

  const onSubmit = useCallback(() => {
    const params = new URLSearchParams();
    if (state.location) params.set("location", state.location);
    if (
      state.checkIn &&
      state.checkOut &&
      parseISODate(state.checkOut) > parseISODate(state.checkIn)
    ) {
      params.set("checkIn", state.checkIn);
      params.set("checkOut", state.checkOut);
    }
    params.set("adults", String(Math.max(1, state.guests.adults)));
    if (state.guests.children) params.set("children", String(state.guests.children));
    if (state.guests.infants) params.set("infants", String(state.guests.infants));
    if (state.guests.pets) params.set("pets", String(state.guests.pets));
    // Signed-in members only: for guests this is a no-op that sends and stores nothing.
    const historyEntry = searchEntryFromParams({
      location: state.location,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      guests: Math.min(40, Math.max(1, state.guests.adults) + state.guests.children),
    });
    if (historyEntry) void recordSearch(historyEntry, isAuthenticated && !isAdmin);
    // Same rule as the desktop form: a valid `?promo=` on this page travels with the search.
    router.push(`/villas?${withPromo(params, promoFromSearch(window.location.search)).toString()}`);
    setOpen(false);
  }, [isAdmin, isAuthenticated, router, state]);

  // The pill reads back what the guest chose, so closing the sheet never loses their place.
  const touched = Boolean(state.location || state.checkIn)
    || (Object.keys(INITIAL_GUESTS) as (keyof Guests)[]).some((key) => state.guests[key] !== INITIAL_GUESTS[key]);
  const summary = touched ? {
    where: state.location || "Anywhere in Bali",
    meta: `${formatDateRange(state.checkIn, state.checkOut) || "Any dates"} · ${guestsLabel(state.guests)}`,
  } : null;

  return (
    <>
      <Trigger summary={summary} expanded={open} onOpen={() => setOpen(true)} onClear={onClearAll} />
      <AnimatePresence>
        {open ? (
          <Sheet
            key="sheet"
            state={state}
            step={step}
            onStepChange={setStep}
            onLocationInput={onLocationInput}
            onLocationSelect={onLocationSelect}
            onDatesChange={onDatesChange}
            nights={habit.nights}
            onGuestsChange={onGuestsChange}
            canClear={touched}
            onClearAll={onClearAll}
            onClose={() => setOpen(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
