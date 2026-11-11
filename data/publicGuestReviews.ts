export type PublicGuestReview = {
  id: string;
  author: string;
  villaName: string;
  dateLabel: string;
  rating: number | null;
  quote: string;
  sourceLabel: "Airbnb" | "Booking.com";
  sourceUrl: string;
  /** Only use a managed local image that Summerhouse has permission to publish. */
  avatarSrc?: string;
};

/**
 * Curated public proof used by editorial testimonial sections.
 *
 * These are intentionally separate from the moderated villa and owner-review
 * records in the CMS. Source URLs are retained for internal verification and
 * may also be used for a future per-review source link.
 */
export const publicGuestReviews: readonly PublicGuestReview[] = [
  {
    id: "airbnb-52747480-ayumi-2026-07",
    author: "Ayumi",
    villaName: "Ubud Zen River House",
    dateLabel: "July 2026",
    rating: 5,
    quote: "very kindly support. super clean and sofisticated and unique place. thank you so much.",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/52747480",
    avatarSrc: "/images/testimonials/guest-01.webp",
  },
  {
    id: "airbnb-666279284816487687-jessica-2026-08",
    author: "Jessica",
    villaName: "Casaluna Loft I",
    dateLabel: "August 2026",
    rating: 5,
    quote: "Lovely stay!",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/666279284816487687",
    avatarSrc: "/images/testimonials/guest-02.webp",
  },
  {
    id: "airbnb-866660731928145031-alienor-2026-08",
    author: "Aliénor",
    villaName: "Cactus Estate Villa Pererenan",
    dateLabel: "August 2026",
    rating: 5,
    quote: "Nous avons passé un très bon séjour dans cette villa. Le logement était agréable, propre et conforme à la description.",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/866660731928145031",
    avatarSrc: "/images/testimonials/guest-03.webp",
  },
  {
    id: "airbnb-1606939883680239437-niti-2026-02",
    author: "Niti",
    villaName: "Villa Arta Umalas",
    dateLabel: "February 2026",
    rating: 5,
    quote: "Had a very pleasant stay. The place was clean, comfortable, and exactly as shown in the photos. The host was very friendly and communicative.",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/1606939883680239437",
    avatarSrc: "/images/testimonials/guest-04.webp",
  },
  {
    id: "airbnb-1700402963724240423-brighid-2026-06",
    author: "Brighid",
    villaName: "Fondazione Bondarev Ubud",
    dateLabel: "June 2026",
    rating: 5,
    quote: "amazing location, wonderful decor, superbly comfortable and stylish. can reccomend for anyone looking for a special creative inspiration!",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/1700402963724240423",
    avatarSrc: "/images/testimonials/guest-05.webp",
  },
  {
    id: "airbnb-52887367-abdulrhman-2026-07",
    author: "Abdulrhman",
    villaName: "Villa Rindu Canggu",
    dateLabel: "July 2026",
    rating: 5,
    quote: "Amazing place! Clean, comfortable, and the staff were very friendly. I highly recommend it and would definitely stay here again",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/52887367",
    avatarSrc: "/images/testimonials/guest-06.webp",
  },
  {
    id: "airbnb-667034264343998955-tyra-2026-07",
    author: "Tyra",
    villaName: "Casaluna Loft II",
    dateLabel: "July 2026",
    rating: 5,
    quote: "nicely designed and equipped villa, would be great for your trip on Canggu.",
    sourceLabel: "Airbnb",
    sourceUrl: "https://www.airbnb.com/rooms/667034264343998955",
    avatarSrc: "/images/testimonials/guest-07.webp",
  },
  {
    id: "booking-535816-clement",
    author: "Clement",
    villaName: "Villa Kita IV",
    dateLabel: "Guest review",
    rating: null,
    quote: "The venue was amazing and perfect to fit a couple or even 4 people. The staff was incredibly friendly and is great communicating with us.",
    sourceLabel: "Booking.com",
    sourceUrl: "https://www.booking.com/hotel/id/private-tropic-chic-villa-in-peaceful-neighborhood.en-gb.html",
    avatarSrc: "/images/testimonials/guest-08.webp",
  },
  {
    id: "booking-621443-brooke",
    author: "Brooke",
    villaName: "Villa Ari Pererenan",
    dateLabel: "Guest review",
    rating: null,
    quote: "Spacious, clean, comfy beds and rooms (both with ensuites), great location, beautiful interior, nice outdoor area/pool, as well as lounge area.",
    sourceLabel: "Booking.com",
    sourceUrl: "https://www.booking.com/hotel/id/brand-new-tropical-oasis-5-mins-walk-to-the-beach.en-gb.html",
    avatarSrc: "/images/testimonials/guest-09.webp",
  },
] as const;

export const airbnbHostProof = {
  displayRating: "4.7",
  reviewsLabel: "1,200+ Airbnb reviews",
  hostStatus: "Superhost",
  hostingTenure: "8 years hosting",
  profileUrl: "https://www.airbnb.com/users/show/246887792",
  listingsUrl: "https://www.airbnb.com/users/246887792/listings",
  verifiedAt: "2026-10-04",
} as const;
