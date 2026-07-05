"use client";

import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  addMonths,
  buildMonthCells,
  formatISODate,
  isPastDate,
  monthNames,
  parseISODate,
} from "@/lib/date";

export default function WhenCard({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const [cursor, setCursor] = useState(() => (checkIn ? parseISODate(checkIn) : new Date()));
  const months = useMemo(() => [cursor, addMonths(cursor, 1)], [cursor]);

  const onDayClick = (date: string) => {
    if (!checkIn || (checkIn && checkOut) || parseISODate(date) <= parseISODate(checkIn)) {
      onChange(date, "");
      return;
    }
    onChange(checkIn, date);
  };

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
          {monthNames[cursor.getMonth()]} - {monthNames[addMonths(cursor, 1).getMonth()]}
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
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
