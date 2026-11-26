"use client";

import { formatGuestCountLabel, normalizeGuestLimit } from "@/lib/villa-detail-format";
import { useBookingSnapshot } from "./VillaBookingContext";

type VillaBookingSidebarProps = {
  priceLabel: string | null;
  originalPriceLabel: string | null;
  /** The guests the calendar starts with (the link's, clamped), shown before the calendar publishes. */
  initialGuests?: number;
  isShowcasePreview: boolean;
};

export default function VillaBookingSidebar({
  priceLabel,
  originalPriceLabel,
  initialGuests = 1,
  isShowcasePreview,
}: VillaBookingSidebarProps) {
  const snapshot = useBookingSnapshot();

  if (isShowcasePreview || !snapshot) {
    const showRegular = Boolean(originalPriceLabel && priceLabel && originalPriceLabel !== priceLabel);

    return (
      <aside className="villa-booking-sidebar" aria-label="Booking summary">
        <div className="villa-booking-sidebar__price">
          {priceLabel ? (
            <>
              <small>From</small>
              {showRegular && <del>{originalPriceLabel}</del>}
              <strong>{priceLabel}</strong>
              <span>/ night</span>
            </>
          ) : (
            <strong>Rate on request</strong>
          )}
        </div>
        {!isShowcasePreview && (
          <div className="villa-booking-sidebar__fields">
            <a href="#availability" className="villa-booking-sidebar__field">
              <span>Check-in</span>
              <strong>Add date</strong>
            </a>
            <a href="#availability" className="villa-booking-sidebar__field">
              <span>Check-out</span>
              <strong>Add date</strong>
            </a>
            <a href="#availability" className="villa-booking-sidebar__field villa-booking-sidebar__field--full">
              <span>Guests</span>
              <strong>{formatGuestCountLabel(initialGuests)}</strong>
            </a>
          </div>
        )}
        <a href="#availability" className="villa-booking-sidebar__cta">
          {isShowcasePreview ? "Check availability" : "Check dates"}
        </a>
        <p className="villa-booking-sidebar__note">
          See the current rate and any applicable fees before you confirm your stay.
        </p>
      </aside>
    );
  }

  const bookingLabel = snapshot.isValid
    ? snapshot.totalLabel
      ? "Continue to checkout"
      : "See your full stay price"
    : "Check dates";
  const nightsLabel = `${snapshot.nights} ${snapshot.nights === 1 ? "night" : "nights"}`;
  // The villa price, as before hydration: the snapshot carries the calendar's regular price instead.
  const effectivePriceLabel = priceLabel;
  const showRegular = Boolean(originalPriceLabel && effectivePriceLabel && originalPriceLabel !== effectivePriceLabel);
  const maxGuests = normalizeGuestLimit(snapshot.maxGuests);

  return (
    <aside className="villa-booking-sidebar" aria-label="Booking summary">
      <div className="villa-booking-sidebar__price">
        {snapshot.totalLabel ? (
          <>
            <strong>{snapshot.totalLabel}</strong>
            <span>total for {nightsLabel}</span>
          </>
        ) : effectivePriceLabel ? (
          <>
            <small>From</small>
            {showRegular && <del>{originalPriceLabel}</del>}
            <strong>{effectivePriceLabel}</strong>
            <span>/ night</span>
          </>
        ) : (
          <strong>Rate on request</strong>
        )}
      </div>

      <div className="villa-booking-sidebar__fields">
        <button
          type="button"
          className="villa-booking-sidebar__field"
          onClick={snapshot.onFocusDates}
        >
          <span>Check-in</span>
          <strong>{snapshot.checkIn || "Add date"}</strong>
        </button>
        <button
          type="button"
          className="villa-booking-sidebar__field"
          onClick={snapshot.onFocusDates}
        >
          <span>Check-out</span>
          <strong>{snapshot.checkOut || "Add date"}</strong>
        </button>
        <label className="villa-booking-sidebar__field villa-booking-sidebar__field--full">
          <span>Guests</span>
          <select
            value={snapshot.guests}
            onChange={(event) => snapshot.onGuestChange(Number(event.target.value))}
          >
            {Array.from({ length: maxGuests }).map((_, index) => {
              const value = index + 1;
              return (
                <option key={value} value={value}>
                  {formatGuestCountLabel(value)}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {(snapshot.checkIn || snapshot.checkOut) && (
        <div className="villa-booking-sidebar__utility">
          <span>{snapshot.isValid ? `${nightsLabel} selected` : "Dates selected"}</span>
          <button
            type="button"
            className="villa-booking-sidebar__clear"
            onClick={snapshot.onClearDates}
          >
            Clear
          </button>
        </div>
      )}

      <a
        href={snapshot.isValid ? snapshot.checkoutUrl : "#availability"}
        onClick={
          snapshot.isValid
            ? snapshot.onBookNow
            : (event) => {
                event.preventDefault();
                snapshot.onFocusDates();
              }
        }
        className="villa-booking-sidebar__cta"
        data-booking-property-id={snapshot.propertyId}
        data-booking-check-in={snapshot.checkIn || ""}
        data-booking-check-out={snapshot.checkOut || ""}
        data-booking-guests={snapshot.guests}
        data-booking-quote-status={snapshot.quoteStatus ?? "available"}
      >
        {bookingLabel}
      </a>

      <p
        className={`villa-booking-sidebar__status${snapshot.error && !snapshot.isQuoteLoading ? " is-error" : ""}`}
        aria-live="polite"
      >
        {snapshot.error || ""}
      </p>

      <p className="villa-booking-sidebar__note">
        See the current rate and any applicable fees before you confirm your stay.
      </p>

      {snapshot.whatsAppFallbackUrl && (
        <p className="villa-booking-sidebar__help">
          Need help?{" "}
          <a href={snapshot.whatsAppFallbackUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
          .
        </p>
      )}
    </aside>
  );
}
