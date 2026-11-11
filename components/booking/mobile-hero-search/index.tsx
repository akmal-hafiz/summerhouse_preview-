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

import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { parseISODate } from "@/lib/date";
import { useAuth } from "@/components/providers/AuthProvider";
import { recordSearch, searchEntryFromParams } from "@/lib/search-history-client";
import { promoFromSearch, withPromo } from "@/lib/promo-param";
import Trigger from "./Trigger";
import Sheet from "./Sheet";
import { INITIAL_STATE } from "./constants";
import type { Guests, SearchState, Step } from "./types";

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

  const onDatesChange = useCallback((checkIn: string, checkOut: string) => {
    setState((s) => ({ ...s, checkIn, checkOut }));
    if (checkOut) setStep("who");
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

  return (
    <>
      <Trigger onOpen={() => setOpen(true)} />
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
            onGuestsChange={onGuestsChange}
            onClearAll={onClearAll}
            onClose={() => setOpen(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
