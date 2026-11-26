"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { StickyBookingBarProps } from "./StickyBookingBar";

type PublishBooking = (next: StickyBookingBarProps) => void;

const BookingPublishContext = createContext<PublishBooking | null>(null);
const BookingSnapshotContext = createContext<StickyBookingBarProps | null>(null);

export function VillaBookingProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StickyBookingBarProps | null>(null);

  return (
    <BookingPublishContext.Provider value={setSnapshot}>
      <BookingSnapshotContext.Provider value={snapshot}>
        {children}
      </BookingSnapshotContext.Provider>
    </BookingPublishContext.Provider>
  );
}

export function usePublishBooking(): PublishBooking | null {
  return useContext(BookingPublishContext);
}

export function useBookingSnapshot(): StickyBookingBarProps | null {
  return useContext(BookingSnapshotContext);
}
