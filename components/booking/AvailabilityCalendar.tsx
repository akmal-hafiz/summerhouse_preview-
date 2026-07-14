"use client";

import type { MouseEvent } from "react";
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
import { buildBookingWhatsAppUrl, buildLodgifyCheckoutUrl } from "@/lib/lodgify/booking";

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
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [availabilityRetryKey, setAvailabilityRetryKey] = useState(0);

  const rangeStart = formatISODate(startOfMonth(visibleMonth));
  const rangeEnd = formatISODate(endOfMonth(addMonths(visibleMonth, 1)));
  const nights = nightsBetween(checkIn, checkOut);

  const isRangeValid = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    return eachNightInRange(checkIn, checkOut).every((date) => availabilityMap[date]?.available);
  }, [availabilityMap, checkIn, checkOut, nights]);
  const isMinimumStayValid = rateQuote?.isMinimumStayValid !== false;
  const isBookingValid = isRangeValid && isMinimumStayValid && !isQuoteLoading;

  const checkoutUrl = useMemo(() => {
    try {
      return buildLodgifyCheckoutUrl({ propertyId, checkIn, checkOut, guests });
    } catch {
      return "";
    }
  }, [checkIn, checkOut, guests, propertyId]);
  const whatsAppFallbackUrl = useMemo(() => buildBookingWhatsAppUrl({
    villaName,
    checkIn,
    checkOut,
    guests,
  }), [checkIn, checkOut, guests, villaName]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setAvailabilityError("");
      const params = new URLSearchParams({
        propertyId: String(propertyId),
        start: rangeStart,
        end: rangeEnd,
      });

      try {
        const response = await fetch(
          `/api/lodgify/availability?${params.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Availability unavailable.");
        setAvailabilityMap(data.map || {});
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setAvailabilityError(fetchError instanceof Error ? fetchError.message : "Availability unavailable.");
        setAvailabilityMap({});
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [propertyId, rangeStart, rangeEnd, availabilityRetryKey]);

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
          throw new Error(data.error || "Unable to load rates.");
        }

        setRateQuote(data);
      } catch (quoteFetchError) {
        if (controller.signal.aborted) return;
        setRateQuote(null);
        setQuoteError(
          quoteFetchError instanceof Error
            ? quoteFetchError.message
            : "Unable to load rates."
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
    if (availabilityError) {
      setError("Availability is not loaded yet. Please retry before selecting dates.");
      return;
    }

    if (!checkIn || (checkIn && checkOut) || parseISODate(date) <= parseISODate(checkIn)) {
      if (!day?.available) {
        setError(day?.reason === "closed_period" ? "This date is blocked." : "This date is not available.");
        return;
      }

      setError("");
      setBookingError("");
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
    setBookingError("");
    setCheckOut(date);
  };

  const validateBookingDetails = () => {
    if (!propertyId) return "Villa booking information is missing. Please contact us via WhatsApp.";
    if (!checkIn || !checkOut) return "Please choose your check-in and check-out dates first.";
    if (nights <= 0 || parseISODate(checkOut) <= parseISODate(checkIn)) {
      return "Please choose a valid check-out date after check-in.";
    }
    if (!Number.isFinite(guests) || guests < 1) return "Please choose at least one guest.";
    if (guests > maxGuests) return `This villa accepts up to ${maxGuests} guests.`;
    if (availabilityError) return "Availability is temporarily unavailable. Please retry or contact us via WhatsApp.";
    if (!isRangeValid) return "Selected dates are not available. Please choose another date range.";
    if (!isMinimumStayValid) return rateQuote?.message || "Selected dates do not meet the minimum stay rule.";
    if (!checkoutUrl) return "Booking is temporarily unavailable. Please contact us via WhatsApp.";
    return "";
  };

  const handleBookNow = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const validationMessage = validateBookingDetails();

    if (validationMessage) {
      setBookingError(validationMessage);
      setError(validationMessage);
      return;
    }

    window.location.href = checkoutUrl;
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
          <button type="button" onClick={() => { setCheckIn(""); setCheckOut(""); setError(""); setBookingError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}>
            Clear dates
          </button>
          {isBookingValid && (
            <a
              href={checkoutUrl}
              onClick={handleBookNow}
              data-booking-property-id={propertyId}
              data-booking-check-in={checkIn}
              data-booking-check-out={checkOut}
              data-booking-guests={guests}
              data-booking-quote-status={rateQuote?.totalLabel ? "quoted" : quoteError ? "quote-fallback" : "available"}
            >
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
            <div className="villa-calendar__loading" role="status" aria-live="polite">Checking availability...</div>
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

      {error && !bookingError && <p className="villa-calendar__error" role="alert">{error}</p>}
      {bookingError && (
        <p className="villa-calendar__error" role="alert">
          {bookingError}{" "}
          <a href={whatsAppFallbackUrl} target="_blank" rel="noopener noreferrer">
            Contact us via WhatsApp.
          </a>
        </p>
      )}
      {availabilityError && (
        <div className="villa-calendar__error villa-calendar__error--retry" role="alert">
          <span>{availabilityError}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setBookingError("");
              setAvailabilityRetryKey((current) => current + 1);
            }}
          >
            Retry availability
          </button>
        </div>
      )}
      {quoteError && isRangeValid && (
        <p className="villa-calendar__error" role="status" aria-live="polite">
          Rates are unavailable right now. The final price will still be confirmed in secure checkout.
        </p>
      )}
      <p className="villa-calendar__note">Final rates, minimum stay, taxes, and payment are confirmed at booking.</p>

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
        error={isQuoteLoading ? "Checking rates..." : availabilityError || error || (isRangeValid && !isMinimumStayValid ? rateQuote?.message : "") || quoteError}
        rateQuote={rateQuote}
        isQuoteLoading={isQuoteLoading}
        checkoutUrl={checkoutUrl}
        whatsAppFallbackUrl={whatsAppFallbackUrl}
        propertyId={propertyId}
        quoteStatus={rateQuote?.totalLabel ? "quoted" : quoteError ? "quote-fallback" : "available"}
        onBookNow={handleBookNow}
        onGuestChange={(value) => {
          setIsQuoteLoading(true);
          setRateQuote(null);
          setQuoteError("");
          setBookingError("");
          setGuests(Math.min(value, maxGuests));
        }}
        onClearDates={() => { setCheckIn(""); setCheckOut(""); setError(""); setBookingError(""); setRateQuote(null); setQuoteError(""); setIsQuoteLoading(false); }}
      />
    </section>
  );
}
