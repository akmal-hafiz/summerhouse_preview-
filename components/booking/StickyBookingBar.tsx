"use client";

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
  checkoutUrl: string;
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
  checkoutUrl,
  onGuestChange,
  onClearDates,
}: StickyBookingBarProps) {
  return (
    <div className="villa-booking-bar" aria-live="polite">
      <div className="villa-booking-bar__identity">
        <strong>{villaName}</strong>
        <span>{location}{priceLabel ? ` · from ${priceLabel} per night` : ""}</span>
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
        <span>
          {isValid
            ? `${nights} ${nights === 1 ? "night" : "nights"} selected`
            : error || "Select available dates"}
        </span>
        <a
          href={isValid ? checkoutUrl : undefined}
          aria-disabled={!isValid}
          className={!isValid ? "is-disabled" : ""}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isValid ? "Book Now" : "Check dates"}
        </a>
      </div>
    </div>
  );
}
