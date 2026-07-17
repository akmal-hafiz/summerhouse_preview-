"use client";

import type { MouseEvent } from "react";

type StickyBookingBarProps = {
  villaName: string;
  location: string;
  priceLabel?: string | null;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  maxGuests?: number;
  nights: number;
  isValid: boolean;
  error?: string;
  rateQuote?: {
    totalLabel?: string | null;
    averageNightlyLabel?: string | null;
    additionalGuestSubtotal?: number;
    isMinimumStayValid?: boolean;
    message?: string;
  } | null;
  isQuoteLoading?: boolean;
  checkoutUrl: string;
  whatsAppFallbackUrl?: string;
  propertyId?: string | number;
  quoteStatus?: "quoted" | "quote-fallback" | "available";
  onBookNow?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onGuestChange: (guests: number) => void;
  onClearDates: () => void;
};

export default function StickyBookingBar({
  villaName,
  location,
  priceLabel,
  checkIn,
  checkOut,
  guests,
  maxGuests = 12,
  nights,
  isValid,
  error,
  rateQuote,
  isQuoteLoading = false,
  checkoutUrl,
  whatsAppFallbackUrl,
  propertyId,
  quoteStatus = "available",
  onBookNow,
  onGuestChange,
  onClearDates,
}: StickyBookingBarProps) {
  const bookingLabel = isValid && rateQuote?.totalLabel
    ? `Book for ${rateQuote.totalLabel}`
    : isValid
      ? "Book Now"
      : "Check dates";
  const summaryLabel = isValid
    ? isQuoteLoading
      ? "Checking rates..."
      : rateQuote?.totalLabel
        ? `${nights} ${nights === 1 ? "night" : "nights"} - ${rateQuote.totalLabel}`
        : `${nights} ${nights === 1 ? "night" : "nights"} selected`
    : error || "Select available dates";

  return (
    <div className="villa-booking-bar" aria-live="polite">
      <div className="villa-booking-bar__identity">
        <strong>{villaName}</strong>
        <span>{location}{priceLabel ? ` - from ${priceLabel} per night` : ""}</span>
      </div>

      <div className="villa-booking-bar__controls">
        <button type="button" className="villa-booking-bar__field" onClick={onClearDates}>
          <span>Check-in</span>
          <strong>{checkIn || "Add date"}</strong>
        </button>
        <button type="button" className="villa-booking-bar__field" onClick={onClearDates}>
          <span>Check-out</span>
          <strong>{checkOut || "Add date"}</strong>
        </button>
        <label className="villa-booking-bar__field villa-booking-bar__guest">
          <span>Guests</span>
          <select value={guests} onChange={(event) => onGuestChange(Number(event.target.value))}>
            {Array.from({ length: Math.max(1, Math.min(20, maxGuests)) }).map((_, index) => {
              const value = index + 1;
              return (
                <option key={value} value={value}>
                  {value} {value === 1 ? "guest" : "guests"}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="villa-booking-bar__summary">
        <span>{summaryLabel}</span>
        {isValid && rateQuote?.averageNightlyLabel && (
          <small>{rateQuote.averageNightlyLabel} average per night</small>
        )}
        <a
          href={isValid ? checkoutUrl : undefined}
          onClick={onBookNow}
          aria-disabled={!isValid}
          className={!isValid ? "is-disabled" : ""}
          data-booking-property-id={propertyId}
          data-booking-check-in={checkIn || ""}
          data-booking-check-out={checkOut || ""}
          data-booking-guests={guests}
          data-booking-quote-status={quoteStatus}
        >
          {bookingLabel}
        </a>
        {!isValid && error && whatsAppFallbackUrl && (
          <small>
            Need help? <a href={whatsAppFallbackUrl} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.
          </small>
        )}
      </div>
    </div>
  );
}
