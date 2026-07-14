"use client";

import { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiSearch, FiX } from "react-icons/fi";
import { FEATURED } from "./constants";

type Status = "loading" | "ready" | "error";

export default function WhereCard({
  value,
  locations,
  status,
  onInput,
  onSelect,
}: {
  value: string;
  locations: string[];
  status: Status;
  onInput: (v: string) => void;
  onSelect: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations.slice(0, 8);
    return locations.filter((loc) => loc.toLowerCase().includes(q)).slice(0, 8);
  }, [query, locations]);

  const handleInput = (v: string) => {
    setQuery(v);
    onInput(v);
  };

  const clearLocation = () => {
    setQuery("");
    onInput("");
  };

  const pick = (loc: string) => {
    setQuery(loc);
    onSelect(loc);
  };

  const trimmed = query.trim();

  return (
    <div className="mobile-booking-search__where">
      <div className="mobile-booking-search__search-input">
        <FiSearch size={18} className="mobile-booking-search__search-icon" aria-hidden />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={(e) => {
            if (value) e.currentTarget.select();
          }}
          placeholder="Search villas, areas, neighbourhoods"
          className="mobile-booking-search__search-field"
        />
        {trimmed ? (
          <button
            type="button"
            className="mobile-booking-search__location-clear"
            onClick={clearLocation}
            aria-label="Clear selected location"
          >
            <FiX size={16} aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="mobile-booking-search__destination-list">
        {!trimmed ? (
          <>
            <p className="mobile-booking-search__section-label">Suggested for you</p>
            <ul className="mobile-booking-search__destination-group">
              {FEATURED.map((f, i) => (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => pick(f.name)}
                    className="mobile-booking-search__destination-row"
                  >
                    <span
                      className={`mobile-booking-search__destination-tile mobile-booking-search__destination-tile--tint-${i % 4}`}
                    >
                      <FiMapPin size={16} aria-hidden />
                    </span>
                    <span className="mobile-booking-search__destination-text">
                      <span className="mobile-booking-search__destination-title">{f.name}</span>
                      <span className="mobile-booking-search__destination-subtitle">{f.tag}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {status === "loading" ? (
          <ul className="mobile-booking-search__destination-group" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="mobile-booking-search__destination-row mobile-booking-search__destination-row--skeleton"
              />
            ))}
          </ul>
        ) : status === "error" ? (
          <p className="mobile-booking-search__helper-text">
            Destinations are temporarily unavailable. You can still search without choosing an area.
          </p>
        ) : filtered.length > 0 ? (
          <>
            <p className="mobile-booking-search__section-label">All destinations</p>
            <ul className="mobile-booking-search__destination-group">
              {filtered.map((loc, i) => (
                <li key={loc}>
                  <button
                    type="button"
                    onClick={() => pick(loc)}
                    className="mobile-booking-search__destination-row"
                  >
                    <span
                      className={`mobile-booking-search__destination-tile mobile-booking-search__destination-tile--tint-${i % 4}`}
                    >
                      <FiMapPin size={16} aria-hidden />
                    </span>
                    <span className="mobile-booking-search__destination-text">
                      <span className="mobile-booking-search__destination-title">{loc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : trimmed ? (
          <p className="mobile-booking-search__helper-text">
            No matches for &ldquo;{trimmed}&rdquo; — press Search to look anyway.
          </p>
        ) : null}
      </div>
    </div>
  );
}
