export type BaliCollectionItem = {
  id: string;
  location: string;
  category: string;
  tag: string;
  moods: string[];
  description: string;
  highlights: string[];
  bestFor: string[];
  facts: Array<{
    label: string;
    value: string;
  }>;
  villaCount: string;
  price: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  galleryImages: string[];
};

export const baliCollections: BaliCollectionItem[] = [
  {
    id: "ubud",
    location: "Ubud",
    category: "The Heart of Nature",
    tag: "The Heart of Nature",
    moods: ["Peaceful", "Jungle", "Wellness", "Culture"],
    description: "Surrounded by rice terraces, rivers, and tropical forests, Ubud offers a slower rhythm where nature, wellness, and Balinese culture come together.",
    highlights: ["Rice Terraces", "Waterfalls", "Yoga Retreats", "Traditional Culture"],
    bestFor: ["Couples", "Wellness Retreats", "Nature Lovers"],
    facts: [
      { label: "Mood", value: "Wellness and culture" },
      { label: "Pace", value: "Slow and restorative" },
      { label: "Stay style", value: "Jungle villas" },
    ],
    villaCount: "12 villas",
    price: "From Rp 3.000.000 / night",
    cta: "Explore Villas in Ubud",
    href: "/villas?location=Ubud",
    image: "/homepage_villa/VillaZen.webp",
    imageAlt: "A calm Ubud villa bedroom surrounded by tropical greenery",
    galleryImages: [
      "/homepage_villa/VillaZen.webp",
      "/homepage_villa/curated-4-view.webp",
      "/homepage_villa/curated-6-exterior.webp",
      "/homepage_villa/curated-8.webp",
      "/homepage_villa/rumahmimosa.webp",
    ],
  },
  {
    id: "canggu",
    location: "Canggu",
    category: "Beach Lifestyle",
    tag: "Beach Lifestyle",
    moods: ["Surf", "Cafe", "Digital Nomad", "Sunset"],
    description: "A vibrant coastal destination known for surf breaks, creative cafes, beach clubs, and an energetic atmosphere.",
    highlights: ["Surf Spots", "Beach Clubs", "Trendy Cafes", "Sunset Beaches"],
    bestFor: ["Digital Nomads", "Friends", "Surf Travelers"],
    facts: [
      { label: "Mood", value: "Creative coastal energy" },
      { label: "Pace", value: "Social and lively" },
      { label: "Stay style", value: "Modern villas" },
    ],
    villaCount: "18 villas",
    price: "From Rp 2.500.000 / night",
    cta: "Explore Villas in Canggu",
    href: "/villas?location=Canggu",
    image: "/homepage_villa/curated-3-corner.webp",
    imageAlt: "A modern Canggu villa with a private pool",
    galleryImages: [
      "/homepage_villa/curated-3-corner.webp",
      "/homepage_villa/CactusEstate.webp",
      "/homepage_villa/88east.webp",
      "/homepage_villa/curated-1-main.webp",
      "/homepage_villa/villaarta.webp",
    ],
  },
  {
    id: "uluwatu",
    location: "Uluwatu",
    category: "Cliffside Escapes",
    tag: "Cliffside Escapes",
    moods: ["Ocean", "Luxury", "Sunset", "Adventure"],
    description: "Dramatic cliffs, hidden beaches, and breathtaking ocean views make Uluwatu one of Bali's most unforgettable destinations.",
    highlights: ["Ocean Cliffs", "Hidden Beaches", "Sunset Views", "Luxury Dining"],
    bestFor: ["Luxury Escapes", "Honeymoons", "Ocean Lovers"],
    facts: [
      { label: "Mood", value: "Ocean drama" },
      { label: "Pace", value: "Refined and scenic" },
      { label: "Stay style", value: "Cliffside escapes" },
    ],
    villaCount: "9 villas",
    price: "From Rp 4.000.000 / night",
    cta: "Explore Villas in Uluwatu",
    href: "/villas?location=Uluwatu",
    image: "/homepage_villa/curated-5-lounge.webp",
    imageAlt: "An Uluwatu villa lounge with warm coastal light",
    galleryImages: [
      "/homepage_villa/curated-5-lounge.webp",
      "/homepage_villa/curated-4-view.webp",
      "/homepage_villa/curated-7.webp",
      "/homepage_villa/curated-2-detail.webp",
      "/homepage_villa/TKR03549-HDR.webp",
    ],
  },
  {
    id: "seminyak",
    location: "Seminyak",
    category: "Elegant Living",
    tag: "Elegant Living",
    moods: ["Dining", "Shopping", "Lifestyle", "Nightlife"],
    description: "A sophisticated mix of fine dining, boutique shopping, luxury spas, and vibrant nightlife.",
    highlights: ["Fine Dining", "Boutique Shopping", "Luxury Spas", "Beachfront Sunset"],
    bestFor: ["Lifestyle Travelers", "Dining", "Shopping"],
    facts: [
      { label: "Mood", value: "Polished lifestyle" },
      { label: "Pace", value: "Stylish and social" },
      { label: "Stay style", value: "Elegant getaways" },
    ],
    villaCount: "15 villas",
    price: "From Rp 3.500.000 / night",
    cta: "Explore Villas in Seminyak",
    href: "/villas?location=Seminyak",
    image: "/homepage_villa/CactusEstate.webp",
    imageAlt: "A polished Seminyak villa pool with soft modern interiors",
    galleryImages: [
      "/homepage_villa/CactusEstate.webp",
      "/homepage_villa/88east.webp",
      "/homepage_villa/officiana17.webp",
      "/homepage_villa/curated-2-detail.webp",
      "/homepage_villa/curated-3-corner.webp",
    ],
  },
  {
    id: "nusa-dua",
    location: "Nusa Dua",
    category: "Resort Serenity",
    tag: "Resort Serenity",
    moods: ["Family", "Relaxation", "Luxury", "Beach"],
    description: "Known for calm beaches, family-friendly resorts, and a refined atmosphere perfect for a relaxing escape.",
    highlights: ["White Sand Beaches", "Family Friendly", "Luxury Resorts", "Calm Waters"],
    bestFor: ["Families", "Relaxation", "Resort Experiences"],
    facts: [
      { label: "Mood", value: "Soft resort calm" },
      { label: "Pace", value: "Easy and relaxed" },
      { label: "Stay style", value: "Family luxury" },
    ],
    villaCount: "7 villas",
    price: "From Rp 4.500.000 / night",
    cta: "Explore Villas in Nusa Dua",
    href: "/villas?location=Nusa%20Dua",
    image: "/homepage_villa/curated-7.webp",
    imageAlt: "A refined Nusa Dua villa exterior for calm resort-style stays",
    galleryImages: [
      "/homepage_villa/curated-7.webp",
      "/homepage_villa/curated-8.webp",
      "/homepage_villa/glass_house.png",
      "/homepage_villa/curated-6-exterior.webp",
      "/homepage_villa/curated-1-main.webp",
    ],
  },
];
