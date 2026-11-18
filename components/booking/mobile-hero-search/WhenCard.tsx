"use client";

import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  addMonths,
  buildMonthCells,
  formatISODate,
  isPastDate,
  monthNames,
  nightsBetween,
  parseISODate,
} from "@/lib/date";
import { formatLongDate } from "./format";
import { pickDay, type DateRange } from "./pickDay";

export default function WhenCard({
  range,
  nights,
  onChange,
}: {
  range: DateRange;
  /** The member's usual stay length; with it, a check-in tap also sets the check-out. */
  nights?: number;
  onChange: (range: DateRange) => void;
}) {
  const { checkIn, checkOut, autoCheckOut } = range;
  const [cursor, setCursor] = useState(() => (checkIn ? parseISODate(checkIn) : new Date()));
  const months = useMemo(() => [cursor, addMonths(cursor, 1)], [cursor]);
  const onDayClick = (date: string) => onChange(pickDay(range, date, nights));
  const autoNights = autoCheckOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <div className="mobile-booking-search__when">
      <div className="mobile-booking-search__calendar-nav">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="mobile-booking-search__calendar-nav-button"
          aria-label="Previous month"
        >
          <FiChevronLeft size={16} aria-hidden />
        </button>
        <span className="mobile-booking-search__calendar-range-label">
          {monthNames[cursor.getMonth()]} to {monthNames[addMonths(cursor, 1).getMonth()]}
        </span>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="mobile-booking-search__calendar-nav-button"
          aria-label="Next month"
        >
          <FiChevronRight size={16} aria-hidden />
        </button>
      </div>

      {/* Above the months: the calendar scrolls, and a note below it would sit out of sight. */}
      {autoNights ? (
        <p className="mobile-booking-search__calendar-hint" role="status">
          {autoNights} {autoNights === 1 ? "night" : "nights"}, as in your last search. Pick another date to change it.
        </p>
      ) : null}

      <div className="mobile-booking-search__calendar-months">
        {months.map((m) => (
          <MonthGrid
            key={`${m.getFullYear()}-${m.getMonth()}`}
            month={m}
            checkIn={checkIn}
            checkOut={checkOut}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  checkIn,
  checkOut,
  onDayClick,
}: {
  month: Date;
  checkIn: string;
  checkOut: string;
  onDayClick: (date: string) => void;
}) {
  const cells = useMemo(() => buildMonthCells(month), [month]);

  return (
    <div className="mobile-booking-search__calendar-month">
      <h4 className="mobile-booking-search__calendar-month-title">
        {monthNames[month.getMonth()]} {month.getFullYear()}
      </h4>
      <div className="mobile-booking-search__calendar-weekdays">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mobile-booking-search__calendar-grid">
        {cells.map((cell) => {
          const iso = formatISODate(cell);
          const outside = cell.getMonth() !== month.getMonth();
          const past = isPastDate(cell);
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange =
            Boolean(checkIn) &&
            Boolean(checkOut) &&
            parseISODate(iso) > parseISODate(checkIn) &&
            parseISODate(iso) < parseISODate(checkOut);
          const disabled = outside || past;

          const classNames = [
            "mobile-booking-search__calendar-day",
            disabled ? "is-disabled" : "",
            inRange ? "is-in-range" : "",
            isStart || isEnd ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onDayClick(iso)}
              className={classNames}
              aria-pressed={isStart || isEnd}
              aria-label={formatLongDate(iso)}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
