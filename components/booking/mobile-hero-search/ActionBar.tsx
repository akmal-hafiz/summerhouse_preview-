"use client";

import { FiSearch } from "react-icons/fi";

export default function ActionBar({
  canClear,
  onClearAll,
  onSearch,
}: {
  canClear: boolean;
  onClearAll: () => void;
  onSearch: () => void;
}) {
  return (
    <div className="mobile-booking-search__action-bar">
      {/* Nothing to clear yet: stays visible so the bar does not shift, but cannot be pressed. */}
      <button type="button" onClick={onClearAll} className="mobile-booking-search__clear" disabled={!canClear}>
        Clear all
      </button>
      <button type="button" onClick={onSearch} className="mobile-booking-search__submit">
        {/* Content wrapper keeps the label/icon above the glass pseudo-layers. */}
        <span className="mobile-booking-search__submit-content">
          <FiSearch size={16} aria-hidden />
          <span>Search</span>
        </span>
      </button>
    </div>
  );
}
