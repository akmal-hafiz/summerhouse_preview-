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
  guests: Guests;
};
