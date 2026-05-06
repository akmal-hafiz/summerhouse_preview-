"use client";

import { useEffect, useMemo, useState } from "react";
import StickyBookingBar from "./StickyBookingBar";

type AvailabilityDay = {
  date: string;
  status: "available" | "booked" | "blocked" | "unavailable" | "unknown";
  available: boolean;
  reason: string;
};

type AvailabilityCalendarProps = {
  propertyId: string | number;
  villaName: string;
  location: string;
  priceLabel?: string | null;
  maxGuests?: number;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const nightsBetween = (checkIn?: string, checkOut?: string) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((toDate(checkOut).getTime() - toDate(checkIn).getTime()) / 86400000));
};

const eachNight = (checkIn: string, checkOut: string) => {
  const nights: string[] = [];
  let cursor = toDate(checkIn);
  const finalDate = toDate(checkOut);

  while (cursor < finalDate) {
    nights.push(toISODate(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
};

const buildCheckoutUrl = (propertyId: string | number, checkIn?: string, checkOut?: string, guests?: number) => {
  const url = new URL("https://lodgify.com/v2/direct-booking");
  url.searchParams.set("propertyId", String(propertyId));
  if (checkIn) {
    url.searchParams.set("checkIn", checkIn);
    url.searchParams.set("check_in", checkIn);
    url.searchParams.set("arrival", checkIn);
  }
  if (checkOut) {
    url.searchParams.set("checkOut", checkOut);
    url.searchParams.set("check_out", checkOut);
    url.searchParams.set("departure", checkOut);
  }
  if (guests) {
    url.searchParams.set("guests", String(guests));
    url.searchParams.set("adults", String(guests));
  }
  return url.toString();
};

const getMonthCells = (month: Date) => {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startOffset = (first.getDay() + 6) % 7;
  const cells: Date[] = [];

  for (let i = startOffset; i > 0; i -= 1) cells.push(addDays(first, -i));
  for (let day = 1; day <= last.getDate(); day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));

  return cells;
};

export default function AvailabilityCalendar({
  propertyId,
  villaName,
  location,
  priceLabel,
  maxGuests = 12,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => startOfMonth(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(today);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityDay>>({});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const rangeStart = toISODate(startOfMonth(visibleMonth));
  const rangeEnd = toISODate(endOfMonth(addMonths(visibleMonth, 1)));
  const nights = nightsBetween(checkIn, checkOut);

  const isRangeValid = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    return eachNight(checkIn, checkOut).every((date) => availabilityMap[date]?.available);
  }, [availabilityMap, checkIn, checkOut, nights]);

  const checkoutUrl = buildCheckoutUrl(propertyId, checkIn, checkOut, guests);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/lodgify/availability?propertyId=${propertyId}&start=${rangeStart}&end=${rangeEnd}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Availability unavailable.");
        setAvailabilityMap(data.map || {});
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Availability unavailable.");
        setAvailabilityMap({});
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [propertyId, rangeStart, rangeEnd]);

  const validateRange = (start: string, end: string) => {
    if (toDate(end) <= toDate(start)) return false;
    return eachNight(start, end).every((date) => availabilityMap[date]?.available);
  };

  const handleDateClick = (date: string) => {
    const day = availabilityMap[date];
    if (!day?.available) {
      setError(day?.reason === "closed_period" ? "This date is blocked." : "This date is not available.");
      return;
    }

    setError("");

    if (!checkIn || (checkIn && checkOut) || toDate(date) <= toDate(checkIn)) {
      setCheckIn(date);
      setCheckOut("");
      return;
    }

    if (!validateRange(checkIn, date)) {
      setError("Selected range crosses unavailable dates.");
      return;
    }

    setCheckOut(date);
  };

  const renderMonth = (month: Date) => {
    const cells = getMonthCells(month);

    return (
      <div className="villa-calendar__month">
        <h3>{monthNames[month.getMonth()]} {month.getFullYear()}</h3>
        <div className="villa-calendar__weekdays">
          {dayNames.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="villa-calendar__grid">
          {cells.map((cell) => {
            const date = toISODate(cell);
            const day = availabilityMap[date];
            const isOutside = cell.getMonth() !== month.getMonth();
            const isPast = cell < new Date(new Date().setHours(0, 0, 0, 0));
            const isSelectedStart = date === checkIn;
            const isSelectedEnd = date === checkOut;
            const isInsideRange = checkIn && checkOut && toDate(date) > toDate(checkIn) && toDate(date) < toDate(checkOut);
            const isDisabled = isOutside || isPast || !day?.available;

            return (
              <button
                key={date}
                type="button"
                disabled={isDisabled}
                title={!day?.available && !isOutside ? day?.reason || "Unavailable" : undefined}
                onClick={() => handleDateClick(date)}
                className={[
                  "villa-calendar__day",
                  isOutside ? "is-outside" : "",
                  isPast ? "is-past" : "",
                  day?.status ? `is-${day.status}` : "is-unknown",
                  isSelectedStart ? "is-selected-start" : "",
                  isSelectedEnd ? "is-selected-end" : "",
                  isInsideRange ? "is-in-range" : "",
                ].filter(Boolean).join(" ")}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="villa-calendar-section" id="availability">
      <div className="villa-calendar-section__header">
        <div>
          <p className="villa-detail-section-label">Availability</p>
          <h2>Choose your island dates.</h2>
          <span>
            {checkIn && checkOut
              ? `${checkIn} - ${checkOut}`
              : checkIn
                ? "Select check-out date"
                : "Select check-in date"}
          </span>
        </div>
        <button type="button" onClick={() => { setCheckIn(""); setCheckOut(""); setError(""); }}>
          Clear dates
        </button>
      </div>

      <div className="villa-calendar">
        <button
          type="button"
          className="villa-calendar__nav villa-calendar__nav--prev"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          aria-label="Previous month"
        >
          &#8592;
        </button>
        <div className="villa-calendar__months">
          {isLoading ? (
            <div className="villa-calendar__loading">Checking Lodgify availability...</div>
          ) : (
            <>
              {renderMonth(visibleMonth)}
              {renderMonth(addMonths(visibleMonth, 1))}
            </>
          )}
        </div>
        <button
          type="button"
          className="villa-calendar__nav villa-calendar__nav--next"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          aria-label="Next month"
        >
          &#8594;
        </button>
      </div>

      {error && <p className="villa-calendar__error">{error}</p>}
      <p className="villa-calendar__note">Final rates, minimum stay, taxes, and payment are confirmed by Lodgify at booking.</p>

      <StickyBookingBar
        villaName={villaName}
        location={location}
        priceLabel={priceLabel}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={Math.min(guests, maxGuests)}
        maxGuests={maxGuests}
        nights={nights}
        isValid={isRangeValid}
        error={error}
        checkoutUrl={checkoutUrl}
        onGuestChange={(value) => setGuests(Math.min(value, maxGuests))}
        onClearDates={() => { setCheckIn(""); setCheckOut(""); setError(""); }}
      />
    </section>
  );
}
