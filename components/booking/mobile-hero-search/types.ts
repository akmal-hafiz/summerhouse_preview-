export type Step = "where" | "when" | "who";

export type Guests = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

export type SearchState = {
  location: string;
  checkIn: string;
  checkOut: string;
  /** The check-out was set from the member's usual stay length, not tapped; the next later day replaces it. */
  autoCheckOut: boolean;
  guests: Guests;
};
