import type { Guests, SearchState, Step } from "./types";

export const INITIAL_GUESTS: Guests = { adults: 1, children: 0, infants: 0, pets: 0 };

export const INITIAL_STATE: SearchState = {
  location: "",
  checkIn: "",
  checkOut: "",
  guests: INITIAL_GUESTS,
};

export const STEPS: Array<{ id: Step; label: string; title: string }> = [
  { id: "where", label: "Where", title: "Where to?" },
  { id: "when", label: "When", title: "When's your trip?" },
  { id: "who", label: "Who", title: "Who's coming?" },
];

export const GUEST_ROWS: Array<{
  key: keyof Guests;
  label: string;
  helper: string;
  min: number;
}> = [
  { key: "adults", label: "Adults", helper: "Ages 13 or above", min: 1 },
  { key: "children", label: "Children", helper: "Ages 2 to 12", min: 0 },
  { key: "infants", label: "Infants", helper: "Under 2", min: 0 },
  { key: "pets", label: "Pets", helper: "Well-mannered companions", min: 0 },
];

export const FEATURED = [
  { name: "Ubud", tag: "Rice-field calm" },
  { name: "Canggu", tag: "Surf mornings" },
  { name: "Seminyak", tag: "Sunset side" },
  { name: "Uluwatu", tag: "Cliff living" },
];
