"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import HierarchicalLocationPicker, { getSelectedLocationLabel } from "./HierarchicalLocationPicker";
import {
  addMonths,
  buildMonthCells,
  formatISODate,
  isPastDate,
  monthNames,
  parseISODate,
} from "@/lib/date";
import { useAuth } from "@/components/providers/AuthProvider";
import { recordSearch, searchEntryFromParams } from "@/lib/search-history-client";
import { promoFromSearch, withPromo } from "@/lib/promo-param";
import { setPriceParams } from "./search-price";
import { GUEST_ROWS } from "./mobile-hero-search/constants";
import { formatLongDate, formatShortDate, guestsLabel } from "./mobile-hero-search/format";

type VillaSearchFormProps = {
  variant?: "hero" | "listing" | "cinematic";
  initialValues?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    infants?: number;
    pets?: number;
    minPrice?: number;
    maxPrice?: number;
  };
  locations?: string[];
  /** A validated member code from `?promo=`, kept on the search this form submits. */
  promo?: string;
};

export default function VillaSearchForm({
  variant = "listing",
  initialValues,
  locations: providedLocations = [],
  promo = "",
}: VillaSearchFormProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const panelId = useId();
  const hasProvidedLocations = providedLocations.length > 0;
  const [fetchedLocations, setFetchedLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(!hasProvidedLocations);
  const [locationError, setLocationError] = useState("");
  const [activePanel, setActivePanel] = useState<"location" | "dates" | "guests" | null>(null);

  useLayoutEffect(() => {
    if (variant !== "cinematic" || !activePanel) return;
    const form = formRef.current;
    const panel = form?.querySelector<HTMLElement>(".villa-search-form__panel");
    if (!form || !panel) return;
    const position = () => {
      const bounds = form.getBoundingClientRect();
      const above = bounds.top - 112;
      const below = window.innerHeight - bounds.bottom - 16;
      const openBelow = below > above;
      panel.dataset.placement = openBelow ? "below" : "above";
      panel.style.maxHeight = `${Math.max(120, Math.min(440, openBelow ? below : above))}px`;
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [activePanel, variant]);

  // Close active panel on clicking outside the search form
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  // Close active panel on pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePanel(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [location, setLocation] = useState(initialValues?.location || "");
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || "");
  const [adults, setAdults] = useState(initialValues?.adults || 1);
  const [children, setChildren] = useState(initialValues?.children || 0);
  const [infants, setInfants] = useState(initialValues?.infants || 0);
  const [pets, setPets] = useState(initialValues?.pets || 0);
  const [minPrice, setMinPrice] = useState(initialValues?.minPrice ? String(initialValues.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(initialValues?.maxPrice ? String(initialValues.maxPrice) : "");

  useEffect(() => {
    if (hasProvidedLocations) {
      setIsLoadingLocations(false);
      setLocationError("");
      return;
    }

    const controller = new AbortController();

    setIsLoadingLocations(true);
    setLocationError("");
    fetch("/api/lodgify/search-options", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load locations.");
        return response.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;

        if (Array.isArray(data.locations) && data.locations.length > 0) {
          setFetchedLocations(data.locations);
          return;
        }

        setFetchedLocations([]);
        setLocationError("Destinations are temporarily unavailable. You can still search without choosing an area.");
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === "AbortError") return;

        setFetchedLocations([]);
        setLocationError("Destinations are temporarily unavailable. You can still search without choosing an area.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingLocations(false);
      });

    return () => controller.abort();
  }, [hasProvidedLocations]);

  const togglePanel = (panel: "location" | "dates" | "guests") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Disclosure semantics for the three panel buttons; each panel is a labelled, non-modal dialog.
  const panelTrigger = (panel: "location" | "dates" | "guests") => ({
    "aria-haspopup": "dialog" as const,
    "aria-expanded": activePanel === panel,
    "aria-controls": activePanel === panel ? `${panelId}-${panel}` : undefined,
  });

  const guestLabel = useMemo(() => guestsLabel({ adults, children, infants, pets }), [adults, children, infants, pets]);

  const locationOptions = hasProvidedLocations ? providedLocations : fetchedLocations;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const safeAdults = Math.min(40, Math.max(1, Math.floor(adults || 1)));
    const safeChildren = Math.min(20, Math.max(0, Math.floor(children || 0)));
    const safeInfants = Math.min(10, Math.max(0, Math.floor(infants || 0)));
    const safePets = Math.min(10, Math.max(0, Math.floor(pets || 0)));
    const hasCompleteDateRange = checkIn && checkOut && parseISODate(checkOut) > parseISODate(checkIn);

    if (location) params.set("location", location);
    if (hasCompleteDateRange) {
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
    }
    params.set("adults", String(safeAdults));
    if (safeChildren) params.set("children", String(safeChildren));
    if (safeInfants) params.set("infants", String(safeInfants));
    if (safePets) params.set("pets", String(safePets));
    setPriceParams(params, minPrice, maxPrice);

    // Signed-in members only: for guests this is a no-op that sends and stores nothing.
    const historyEntry = searchEntryFromParams({ location, checkIn, checkOut, guests: safeAdults + safeChildren });
    if (historyEntry) void recordSearch(historyEntry, isAuthenticated && !isAdmin);

    // The prop wins (the /villas page validates it); the hero has no prop, so it reads the page's own `?promo=`.
    router.push(`/villas?${withPromo(params, promo || promoFromSearch(window.location.search)).toString()}`);
  };

  const handleDateClick = (date: string) => {
    if (!checkIn || (checkIn && checkOut) || parseISODate(date) <= parseISODate(checkIn)) {
      setCheckIn(date);
      setCheckOut("");
      return;
    }

    setCheckOut(date);
    setActivePanel(null);
  };

  const renderDateMonth = (month: Date) => {
    const cells = buildMonthCells(month);
    return (
      <div className="villa-search-calendar__month">
        <h4>{monthNames[month.getMonth()]} {month.getFullYear()}</h4>
        <div className="villa-search-calendar__weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="villa-search-calendar__grid">
          {cells.map((cell) => {
            const date = formatISODate(cell);
            const isOutside = cell.getMonth() !== month.getMonth();
            const isPast = isPastDate(cell);
            const isStart = date === checkIn;
            const isEnd = date === checkOut;
            const isRange = checkIn && checkOut && parseISODate(date) > parseISODate(checkIn) && parseISODate(date) < parseISODate(checkOut);

            return (
              <button
                key={date}
                type="button"
                disabled={isOutside || isPast}
                className={[
                  "villa-search-calendar__day",
                  isOutside ? "is-outside" : "",
                  isPast ? "is-past" : "",
                  isStart ? "is-selected-start" : "",
                  isEnd ? "is-selected-end" : "",
                  isRange ? "is-in-range" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => handleDateClick(date)}
                aria-label={formatLongDate(date)}
                aria-pressed={isStart || isEnd}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const changeGuest = (type: "adults" | "children" | "infants" | "pets", amount: number) => {
    const setters = { adults: setAdults, children: setChildren, infants: setInfants, pets: setPets };
    const values = { adults, children, infants, pets };
    const min = type === "adults" ? 1 : 0;
    setters[type](Math.max(min, values[type] + amount));
  };

  return (
    <form
      ref={formRef}
      className={`villa-search-form villa-search-form--${variant} ${activePanel ? "is-panel-open" : ""}`}
      onSubmit={submitSearch}
    >
      <div className="villa-search-form__group villa-search-form__group--location">
        <button type="button" onClick={() => togglePanel("location")} {...panelTrigger("location")}>
          <span>Location</span>
          <strong className={location ? undefined : "is-empty"}>{location ? getSelectedLocationLabel(location) : "Anywhere in Bali"}</strong>
          <FiChevronDown aria-hidden="true" className="villa-search-form__chevron" />
        </button>
      </div>

      <div className="villa-search-form__group villa-search-form__group--dates">
        <button type="button" onClick={() => togglePanel("dates")} {...panelTrigger("dates")} aria-label={`Check-in, ${checkIn ? formatLongDate(checkIn) : "add dates"}`}>
          <span>Check-in</span>
          <strong className={checkIn ? undefined : "is-empty"}>{checkIn ? formatShortDate(checkIn) : "Add dates"}</strong>
        </button>
        <button type="button" onClick={() => togglePanel("dates")} {...panelTrigger("dates")} aria-label={`Check-out, ${checkOut ? formatLongDate(checkOut) : "add dates"}`}>
          <span>Check-out</span>
          <strong className={checkOut ? undefined : "is-empty"}>{checkOut ? formatShortDate(checkOut) : "Add dates"}</strong>
        </button>
      </div>

      <div className="villa-search-form__group villa-search-form__group--guests">
        <button type="button" onClick={() => togglePanel("guests")} {...panelTrigger("guests")}>
          <span>Guests</span>
          <strong>{guestLabel}</strong>
          <FiChevronDown aria-hidden="true" className="villa-search-form__chevron" />
        </button>
      </div>

      <button type="submit" className="villa-search-form__submit">
        <FiSearch aria-hidden="true" />
        <span>Search</span>
      </button>

      {activePanel === "location" && (
        <div id={`${panelId}-location`} className="villa-search-form__panel villa-search-form__panel--location">
          <HierarchicalLocationPicker
            locations={locationOptions}
            selectedLocation={location}
            isLoading={isLoadingLocations}
            error={locationError}
            onSelect={(item) => setLocation(item)}
            onClose={() => setActivePanel(null)}
          />
        </div>
      )}

      {activePanel === "dates" && (
        <div id={`${panelId}-dates`} role="dialog" aria-label="Choose dates" className="villa-search-form__panel villa-search-form__panel--dates">
          <button type="button" className="villa-search-calendar__nav" aria-label="Previous month" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}>
            &#8592;
          </button>
          <div className="villa-search-calendar">
            {renderDateMonth(visibleMonth)}
            {renderDateMonth(addMonths(visibleMonth, 1))}
          </div>
          <button type="button" className="villa-search-calendar__nav" aria-label="Next month" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}>
            &#8594;
          </button>
        </div>
      )}

      {activePanel === "guests" && (
        <div id={`${panelId}-guests`} role="dialog" aria-label="Choose guests" className="villa-search-form__panel villa-search-form__panel--guests">
          {/* The same rows (labels and age helpers) as the phone sheet. */}
          {GUEST_ROWS.map(({ key, label, helper }) => (
            <div key={key} className="villa-search-guests__row">
              <div>
                <strong>{label}</strong>
                <span>{helper}</span>
              </div>
              <div>
                <button type="button" aria-label={`Decrease ${label}`} onClick={() => changeGuest(key, -1)}>-</button>
                <span>{({ adults, children, infants, pets })[key]}</span>
                <button type="button" aria-label={`Increase ${label}`} onClick={() => changeGuest(key, 1)}>+</button>
              </div>
            </div>
          ))}
          <button type="button" className="villa-search-guests__done" onClick={() => setActivePanel(null)}>Done</button>
        </div>
      )}
    </form>
  );
}
