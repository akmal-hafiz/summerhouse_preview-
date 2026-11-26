"use client";

import type { MouseEvent } from "react";
import { normalizeGuestLimit } from "@/lib/villa-detail-format";

export type StickyBookingBarProps = {
  villaName: string;
  location: string;
  priceLabel?: string | null;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  maxGuests?: number;
  nights: number;
  /** Lodgify's formatted total for the chosen stay, when it quoted one. */
  totalLabel?: string;
  isValid: boolean;
  error?: string;
  isQuoteLoading?: boolean;
  checkoutUrl: string;
  whatsAppFallbackUrl?: string;
  propertyId?: string | number;
  quoteStatus?: "quoted" | "quote-fallback" | "available";
  onBookNow?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onGuestChange: (guests: number) => void;
  onFocusDates: () => void;
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
  totalLabel,
  isValid,
  error,
  isQuoteLoading = false,
  checkoutUrl,
  whatsAppFallbackUrl,
  propertyId,
  quoteStatus = "available",
  onBookNow,
  onGuestChange,
  onFocusDates,
  onClearDates,
}: StickyBookingBarProps) {
  const bookingLabel = isValid ? (totalLabel ? "Continue to checkout" : "See your full stay price") : "Check dates";
  const nightsLabel = `${nights} ${nights === 1 ? "night" : "nights"}`;
  const summaryLabel = isValid
    ? isQuoteLoading
      ? "Preparing your stay..."
      : totalLabel ? `${nightsLabel} · ${totalLabel}` : `${nightsLabel} selected`
    : error || "Select available dates";

  return (
    <div className="villa-booking-bar">
      <div className="villa-booking-bar__identity">
        <strong className="villa-booking-bar__name">{villaName}</strong>
        <span className="villa-booking-bar__location">{location}{!checkIn && !checkOut && priceLabel ? ` - from ${priceLabel} per night` : ""}</span>
        <strong className="villa-booking-bar__mobile-price">
          {priceLabel ? `From ${priceLabel} / night` : villaName}
        </strong>
      </div>

      <div className="villa-booking-bar__controls">
        <button type="button" className="villa-booking-bar__field" onClick={onFocusDates}>
          <span>Check-in</span>
          <strong>{checkIn || "Add date"}</strong>
        </button>
        <button type="button" className="villa-booking-bar__field" onClick={onFocusDates}>
          <span>Check-out</span>
          <strong>{checkOut || "Add date"}</strong>
        </button>
        <label className="villa-booking-bar__field villa-booking-bar__guest">
          <span>Guests</span>
          <select value={guests} onChange={(event) => onGuestChange(Number(event.target.value))}>
            {Array.from({ length: normalizeGuestLimit(maxGuests) }).map((_, index) => {
              const value = index + 1;
              return (
                <option key={value} value={value}>
                  {value} {value === 1 ? "guest" : "guests"}
                </option>
              );
            })}
          </select>
        </label>
        {(checkIn || checkOut) && (
          <button type="button" className="villa-booking-bar__clear" onClick={onClearDates}>
            Clear
          </button>
        )}
      </div>

      <div className="villa-booking-bar__summary">
        <span className="villa-booking-bar__status" aria-live="polite">{summaryLabel}</span>
        <a
          href={isValid ? checkoutUrl : "#availability"}
          onClick={
            isValid
              ? onBookNow
              : (event) => {
                  event.preventDefault();
                  onFocusDates();
                }
          }
          className="villa-booking-bar__cta"
          data-booking-property-id={propertyId}
          data-booking-check-in={checkIn || ""}
          data-booking-check-out={checkOut || ""}
          data-booking-guests={guests}
          data-booking-quote-status={quoteStatus}
        >
          {bookingLabel}
        </a>
        {whatsAppFallbackUrl && (
          <small className="villa-booking-bar__help">
            Need help? <a href={whatsAppFallbackUrl} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.
          </small>
        )}
      </div>
    </div>
  );
}
