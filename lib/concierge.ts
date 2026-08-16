export type ConciergeService = {
  id: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  featured: boolean;
};

export const conciergeServices: ConciergeService[] = [
  { id: "villa-matching", title: "Villa Matching", summary: "Curated villa recommendations shaped around your group, pace, and plans.", image: "/homepage_villa/curated-1-main.webp", alt: "Summerhouse villa selected for a Bali stay", featured: false },
  { id: "arrival-support", title: "Arrival & Airport Support", summary: "Clear arrival details and trusted transfer coordination before you land.", image: "/concierge/arrival-support.png", alt: "Guest welcomed on arrival at a Bali villa", featured: true },
  { id: "private-drivers", title: "Private Drivers", summary: "Reliable local drivers for easy journeys around Bali.", image: "/concierge/private-drivers.png", alt: "Private driver welcoming a guest in Bali", featured: true },
  { id: "dining-reservations", title: "Dining & Reservations", summary: "Restaurant suggestions and reservations chosen around your taste.", image: "/concierge/dining-reservations.png", alt: "Guests receiving dining recommendations", featured: true },
  { id: "itinerary-planning", title: "Local Itinerary Planning", summary: "Thoughtful day-by-day ideas with room for the island to surprise you.", image: "/concierge/itinerary-planning.png", alt: "Guests planning a Bali itinerary with a local host", featured: true },
  { id: "long-stay", title: "Long-Stay Setup", summary: "Groceries, routines, and practical home details for slower stays.", image: "/homepage_villa/curated-5-lounge.webp", alt: "Comfortable villa lounge prepared for a long stay", featured: false },
  { id: "home-readiness", title: "Home Readiness", summary: "Pre-arrival checks so your villa feels considered from the first step.", image: "/homepage_villa/88east.webp", alt: "Prepared Summerhouse villa interior", featured: false },
  { id: "island-recommendations", title: "Beach Days & Island Recommendations", summary: "Beaches, local favorites, and simple escapes selected for you.", image: "/homepage_villa/curated-4-view.webp", alt: "Bali view recommended by the Summerhouse team", featured: false },
  { id: "guest-support", title: "In-Stay Guest Support", summary: "Calm, practical assistance throughout your stay whenever plans shift.", image: "/homepage_villa/curated-3-corner.webp", alt: "Quiet villa corner supported by the local guest team", featured: true },
];

export const featuredConciergeServices = conciergeServices.filter((service) => service.featured);
