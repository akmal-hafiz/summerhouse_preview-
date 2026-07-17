"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useRef } from "react";
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

type VillaSearchFormProps = {
  variant?: "hero" | "listing";
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
};

export default function VillaSearchForm({
  variant = "listing",
  initialValues,
  locations: providedLocations = [],
}: VillaSearchFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const hasProvidedLocations = providedLocations.length > 0;
  const [fetchedLocations, setFetchedLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(!hasProvidedLocations);
  const [locationError, setLocationError] = useState("");
  const [activePanel, setActivePanel] = useState<"location" | "dates" | "guests" | null>(null);

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

  const guestLabel = useMemo(() => {
    const total = adults + children;
    return `${total} ${total === 1 ? "adult" : "guests"}${infants ? `, ${infants} infant` : ""}${pets ? `, ${pets} pet` : ""}`;
  }, [adults, children, infants, pets]);

  const locationOptions = hasProvidedLocations ? providedLocations : fetchedLocations;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const safeAdults = Math.min(40, Math.max(1, Math.floor(adults || 1)));
    const safeChildren = Math.min(20, Math.max(0, Math.floor(children || 0)));
    const safeInfants = Math.min(10, Math.max(0, Math.floor(infants || 0)));
    const safePets = Math.min(10, Math.max(0, Math.floor(pets || 0)));
    const safeMinPrice = Number(minPrice);
    const safeMaxPrice = Number(maxPrice);
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
    if (Number.isFinite(safeMinPrice) && safeMinPrice >= 0) params.set("minPrice", String(Math.floor(safeMinPrice)));
    if (Number.isFinite(safeMaxPrice) && safeMaxPrice >= 0) params.set("maxPrice", String(Math.floor(safeMaxPrice)));

    router.push(`/villas?${params.toString()}`);
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
        <button type="button" onClick={() => togglePanel("location")}>
          <span>Location</span>
          <strong>{getSelectedLocationLabel(location)}</strong>
          <FiChevronDown aria-hidden="true" className="villa-search-form__chevron" />
        </button>
      </div>

      <div className="villa-search-form__group villa-search-form__group--dates">
        <button type="button" onClick={() => togglePanel("dates")}>
          <span>Check-in</span>
          <strong>{checkIn || "Check-in"}</strong>
        </button>
        <button type="button" onClick={() => togglePanel("dates")}>
          <span>Check-out</span>
          <strong>{checkOut || "Check-out"}</strong>
        </button>
      </div>

      <div className="villa-search-form__group villa-search-form__group--guests">
        <button type="button" onClick={() => togglePanel("guests")}>
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
        <div className="villa-search-form__panel villa-search-form__panel--location">
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
        <div className="villa-search-form__panel villa-search-form__panel--dates">
          <button type="button" className="villa-search-calendar__nav" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}>
            &#8592;
          </button>
          <div className="villa-search-calendar">
            {renderDateMonth(visibleMonth)}
            {renderDateMonth(addMonths(visibleMonth, 1))}
          </div>
          <button type="button" className="villa-search-calendar__nav" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}>
            &#8594;
          </button>
        </div>
      )}

      {activePanel === "guests" && (
        <div className="villa-search-form__panel villa-search-form__panel--guests">
          {[
            ["adults", "adults", "Ages 13 or above"],
            ["children", "children", "Ages 2-12"],
            ["infants", "infants", "Under 2"],
            ["pets", "pets", "Pets"],
          ].map(([key, label, helper]) => (
            <div key={key} className="villa-search-guests__row">
              <div>
                <strong>{label}</strong>
                <span>{helper}</span>
              </div>
              <div>
                <button type="button" onClick={() => changeGuest(key as "adults" | "children" | "infants" | "pets", -1)}>-</button>
                <span>{({ adults, children, infants, pets } as Record<string, number>)[key]}</span>
                <button type="button" onClick={() => changeGuest(key as "adults" | "children" | "infants" | "pets", 1)}>+</button>
              </div>
            </div>
          ))}
          <button type="button" className="villa-search-guests__done" onClick={() => setActivePanel(null)}>Done</button>
        </div>
      )}
    </form>
  );
}
