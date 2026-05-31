"use client";

import { useEffect, useMemo, useState } from "react";
import StickyBookingBar from "./StickyBookingBar";
import {
  addMonths,
  buildMonthCells,
  dayNames,
  eachNightInRange,
  endOfMonth,
  formatISODate,
  isPastDate,
  monthNames,
  nightsBetween,
  parseISODate,
  startOfMonth,
} from "@/lib/date";
import { buildLodgifyCheckoutUrl } from "@/lib/lodgify/booking";

type AvailabilityDay = {
  date: string;
  status: "available" | "booked" | "blocked" | "unavailable" | "unknown";
  available: boolean;
  reason: string;
};

type AvailabilityCalendarProps = {
  propertyId: string | number;
  roomTypeId?: string | number | null;
  villaName: string;
  location: string;
  priceLabel?: string | null;
  maxGuests?: number;
};

type RateQuote = {
  success: boolean;
  totalLabel?: string | null;
  averageNightlyLabel?: string | null;
  nightlySubtotal?: number;
  additionalGuestSubtotal?: number;
  minStay?: number | null;
  maxStay?: number | null;
  isMinimumStayValid?: boolean;
  message?: string;
};

export default function AvailabilityCalendar({
  propertyId,
  roomTypeId,
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
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [rateQuote, setRateQuote] = useState<RateQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [error, setError] = useState("");

  const rangeStart = formatISODate(startOfMonth(visibleMonth));
  const rangeEnd = formatISODate(endOfMonth(addMonths(visibleMonth, 1)));
  const nights = nightsBetween(checkIn, checkOut);

  const isRangeValid = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    return eachNightInRange(checkIn, checkOut).every((date) => availabilityMap[date]?.available);
  }, [availabilityMap, checkIn, checkOut, nights]);
  const isMinimumStayValid = rateQuote?.isMinimumStayValid !== false;
  const isBookingValid = isRangeValid && isMinimumStayValid && !isQuoteLoading;

  const checkoutUrl = buildLodgifyCheckoutUrl({ propertyId, checkIn, checkOut, guests });

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadRateQuote() {
      if (!isRangeValid || !checkIn || !checkOut) {
        setRateQuote(null);
        setQuoteError("");
        setIsQuoteLoading(false);
        return;
      }

      setIsQuoteLoading(true);
      setQuoteError("");

      const params = new URLSearchParams({
        propertyId: String(propertyId),
        checkIn,
        checkOut,
        guests: String(guests),
      });

      if (roomTypeId) params.set("roomTypeId", String(roomTypeId));

      try {
        const response = await fetch(`/api/lodgify/rate-quote?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load Lodgify rates.");
        }

        setRateQuote(data);
      } catch (quoteFetchError) {
        if (controller.signal.aborted) return;
        setRateQuote(null);
        setQuoteError(
          quoteFetchError instanceof Error
            ? quoteFetchError.message
            : "Unable to load Lodgify rates."
        );
      } finally {
        if (!controller.signal.aborted) setIsQuoteLoading(false);
      }
    }

    loadRateQuote();

    return () => controller.abort();
  }, [checkIn, checkOut, guests, isRangeValid, propertyId, roomTypeId]);

  const validateRange = (start: string, end: string) => {
    if (parseISODate(end) <= parseISODate(start)) return false;
    return eachNightInRange(start, end).every((date) => availabilityMap[date]?.available);
  };

  const handleDateClick = (date: string) => {
    const day = availabilityMap[date];

    if (!checkIn || (checkIn && checkOut) || parseISODate(date) <= parseISODate(checkIn)) {
      if (!day?.available) {
        setError(day?.reason === "closed_period" ? "This date is blocked." : "This date is not available.");
        return;
      }

      setError("");
      setCheckIn(date);
      setCheckOut("");
      setRateQuote(null);
      setQuoteError("");
      return;
    }

    setError("");

    if (!validateRange(checkIn, date)) {
      setError("Selected range crosses unavailable dates.");
      return;
    }

    setIsQuoteLoading(true);
    setRateQuote(null);
    setQuoteError("");
    setCheckOut(date);
  };

  const renderMonth = (month: Date) => {
    const cells = buildMonthCells(month);

    return (
      <div className="villa-calendar__month">
        <h3>{monthNames[month.getMonth()]} {month.getFullYear()}</h3>
        <div className="villa-calendar__weekdays">
          {dayNames.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="villa-calendar__grid">
          {cells.map((cell) => {
            const date = formatISODate(cell);
            const day = availabilityMap[date];
            const isOutside = cell.getMonth() !== month.getMonth();
            const isPast = isPastDate(cell);
            const isSelectedStart = date === checkIn;
            const isSelectedEnd = date === checkOut;
            const isInsideRange = checkIn && checkOut && parseISODate(date) > parseISODate(checkIn) && parseISODate(date) < parseISODate(checkOut);
            const isCheckoutCandidate = Boolean(checkIn && !checkOut && parseISODate(date) > parseISODate(checkIn));
            const isValidCheckout = isCheckoutCandidate && validateRange(checkIn, date);
            const isDisabled = isOutside || isPast || (!day?.available && !isValidCheckout);

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
        <div className="villa-calendar-section__actions">
          <button type="button" onClick={() => { setCheckIn(""); setCheckOut(""); setError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}>
            Clear dates
          </button>
          {isBookingValid && (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              {rateQuote?.totalLabel ? `Book for ${rateQuote.totalLabel}` : "Book Now"}
            </a>
          )}
        </div>
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
      {quoteError && isRangeValid && (
        <p className="villa-calendar__error">
          Lodgify rates are unavailable right now. The final price will still be confirmed in checkout.
        </p>
      )}
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
        isValid={isBookingValid}
        error={isQuoteLoading ? "Checking Lodgify rates..." : error || (isRangeValid && !isMinimumStayValid ? rateQuote?.message : "") || quoteError}
        rateQuote={rateQuote}
        isQuoteLoading={isQuoteLoading}
        checkoutUrl={checkoutUrl}
        onGuestChange={(value) => {
          setIsQuoteLoading(true);
          setRateQuote(null);
          setQuoteError("");
          setGuests(Math.min(value, maxGuests));
        }}
        onClearDates={() => { setCheckIn(""); setCheckOut(""); setError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}
      />
    </section>
  );
}
