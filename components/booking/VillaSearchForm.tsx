"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiSearch } from "react-icons/fi";

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

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMonths = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const buildMonthCells = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: Date[] = [];

  for (let i = startOffset; i > 0; i -= 1) cells.push(addDays(first, -i));
  for (let day = 1; day <= last.getDate(); day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));

  return cells;
};

export default function VillaSearchForm({
  variant = "listing",
  initialValues,
  locations: providedLocations = [],
}: VillaSearchFormProps) {
  const router = useRouter();
  const [locations, setLocations] = useState(providedLocations);
  const [activePanel, setActivePanel] = useState<"location" | "dates" | "guests" | null>(null);
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
    if (providedLocations.length > 0) return;

    fetch("/api/lodgify/search-options")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.locations)) setLocations(data.locations);
      })
      .catch(() => setLocations([]));
  }, [providedLocations.length]);

  const togglePanel = (panel: "location" | "dates" | "guests") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const guestLabel = useMemo(() => {
    const total = adults + children;
    return `${total} ${total === 1 ? "adult" : "guests"}${infants ? `, ${infants} infant` : ""}${pets ? `, ${pets} pet` : ""}`;
  }, [adults, children, infants, pets]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (adults) params.set("adults", String(adults));
    if (children) params.set("children", String(children));
    if (infants) params.set("infants", String(infants));
    if (pets) params.set("pets", String(pets));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/villas?${params.toString()}`);
  };

  const handleDateClick = (date: string) => {
    if (!checkIn || (checkIn && checkOut) || toDate(date) <= toDate(checkIn)) {
      setCheckIn(date);
      setCheckOut("");
      return;
    }

    setCheckOut(date);
    setActivePanel(null);
  };

  const renderDateMonth = (month: Date) => {
    const cells = buildMonthCells(month);
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div className="villa-search-calendar__month">
        <h4>{monthNames[month.getMonth()]} {month.getFullYear()}</h4>
        <div className="villa-search-calendar__weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="villa-search-calendar__grid">
          {cells.map((cell) => {
            const date = toISODate(cell);
            const isOutside = cell.getMonth() !== month.getMonth();
            const isPast = cell < today;
            const isStart = date === checkIn;
            const isEnd = date === checkOut;
            const isRange = checkIn && checkOut && toDate(date) > toDate(checkIn) && toDate(date) < toDate(checkOut);

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
      className={`villa-search-form villa-search-form--${variant} ${activePanel ? "is-panel-open" : ""}`}
      onSubmit={submitSearch}
    >
      <div className="villa-search-form__group villa-search-form__group--location">
        <button type="button" onClick={() => togglePanel("location")}>
          <span>Location</span>
          <strong>{location || "Location"}</strong>
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
          {locations.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => {
                setLocation(item);
                setActivePanel(null);
              }}
            >
              {item}
            </button>
          ))}
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
