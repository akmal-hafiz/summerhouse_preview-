"use client";

import { FiMinus, FiPlus } from "react-icons/fi";
import { GUEST_ROWS } from "./constants";
import type { Guests } from "./types";

export default function WhoCard({
  guests,
  onChange,
}: {
  guests: Guests;
  onChange: (g: Guests) => void;
}) {
  const change = (key: keyof Guests, delta: number) => {
    const row = GUEST_ROWS.find((r) => r.key === key);
    const min = row?.min ?? 0;
    onChange({ ...guests, [key]: Math.max(min, guests[key] + delta) });
  };

  return (
    <div className="mobile-booking-search__who">
      {GUEST_ROWS.map((row) => (
        <div key={row.key} className="mobile-booking-search__guest-row">
          <div className="mobile-booking-search__guest-copy">
            <p className="mobile-booking-search__guest-label">{row.label}</p>
            <p className="mobile-booking-search__guest-helper">{row.helper}</p>
          </div>
          <div className="mobile-booking-search__stepper-group">
            <button
              type="button"
              onClick={() => change(row.key, -1)}
              disabled={guests[row.key] <= row.min}
              aria-label={`Decrease ${row.label}`}
              className="mobile-booking-search__stepper"
            >
              <FiMinus size={16} aria-hidden />
            </button>
            <span className="mobile-booking-search__stepper-value" aria-live="polite">
              {guests[row.key]}
            </span>
            <button
              type="button"
              onClick={() => change(row.key, 1)}
              aria-label={`Increase ${row.label}`}
              className="mobile-booking-search__stepper"
            >
              <FiPlus size={16} aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
