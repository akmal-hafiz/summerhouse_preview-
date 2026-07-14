"use client";

import { FiSearch } from "react-icons/fi";
import { motion, useReducedMotion } from "motion/react";

export default function Trigger({ onOpen }: { onOpen: () => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="summerhouse-liquid-glass summerhouse-liquid-glass--trigger mobile-booking-search__trigger"
      aria-label="Open search"
    >
      <FiSearch size={17} strokeWidth={2.4} className="mobile-booking-search__trigger-icon" aria-hidden />
      <span className="mobile-booking-search__trigger-label">Start your search</span>
    </motion.button>
  );
}
