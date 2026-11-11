"use client";

import { FiChevronRight } from "react-icons/fi";
import type { Step } from "./types";

export default function CollapsedRow({
  id,
  label,
  value,
  onSelect,
}: {
  id: Step;
  label: string;
  value: string;
  onSelect: (id: Step) => void;
}) {
  return (
    <button type="button" className="mobile-booking-search__collapsed-row" onClick={() => onSelect(id)}>
      <span className="mobile-booking-search__collapsed-label">{label}</span>
      <span className="mobile-booking-search__collapsed-value">{value}</span>
      <FiChevronRight className="mobile-booking-search__collapsed-chevron" aria-hidden />
    </button>
  );
}
