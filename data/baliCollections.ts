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
  lifestylePillars?: Array<{
    title: string;
    description: string;
  }>;
};

export const baliCollections: BaliCollectionItem[] = [
  {
    id: "canggu-berawa",
    location: "Canggu - Berawa",
    category: "Cafe Coastline",
    tag: "Cafe Coastline",
    moods: ["Beach", "Cafes", "Design", "Social"],
    description: "Stylish homes close to cafes, beach clubs, and the polished rhythm of Berawa.",
    highlights: ["Beach Clubs", "Cafe Culture", "Design Villas", "Easy Dining"],
    bestFor: ["Friends", "Couples", "Lifestyle Stays"],
    facts: [
      { label: "Mood", value: "Social coastal living" },
      { label: "Pace", value: "Easy and connected" },
      { label: "Stay style", value: "Design villas" },
    ],
    villaCount: "15 villas",
    price: "From Rp 700.000 / night",
    cta: "Explore Villas in Canggu - Berawa",
    href: "/villas?location=Canggu%20-%20Berawa",
    image: "/homepage_villa/curated-3-corner.webp",
    imageAlt: "SummerHouse villa collection in Canggu Berawa",
    galleryImages: [
      "/homepage_villa/curated-3-corner.webp",
      "/homepage_villa/88east.webp",
      "/homepage_villa/curated-1-main.webp",
      "/homepage_villa/rumahmimosa.webp",
      "/homepage_villa/villaarta.webp",
    ],
    lifestylePillars: [
      { title: "Beach Clubs", description: "World-class venues for golden hour sunset sessions." },
      { title: "Bespoke Cafes", description: "Artisan coffee roasters and high-end brunch spots." },
      { title: "Surf Culture", description: "Warm waters perfect for longboards and beach breaks." }
    ]
  },
  {
    id: "pererenan",
    location: "Pererenan",
    category: "Quiet Coast",
    tag: "Quiet Coast",
    moods: ["Surf", "Village", "Privacy", "Slow Living"],
    description: "A quieter coastal pocket for surf mornings, private villas, and slower evenings.",
    highlights: ["Surf Mornings", "Village Calm", "Private Pools", "Dining Nearby"],
    bestFor: ["Longer Stays", "Couples", "Families"],
    facts: [
      { label: "Mood", value: "Quiet coastal calm" },
      { label: "Pace", value: "Slow and spacious" },
      { label: "Stay style", value: "Private estates" },
    ],
    villaCount: "6 villas",
    price: "From Rp 1.100.000 / night",
    cta: "Explore Villas in Pererenan",
    href: "/villas?location=Pererenan",
    image: "/homepage_villa/curated-6-exterior.webp",
    imageAlt: "SummerHouse villa collection in Pererenan",
    galleryImages: [
      "/homepage_villa/curated-6-exterior.webp",
      "/homepage_villa/CactusEstate.webp",
      "/homepage_villa/curated-4-view.webp",
      "/homepage_villa/curated-7.webp",
      "/homepage_villa/curated-8.webp",
    ],
    lifestylePillars: [
      { title: "Surf Mornings", description: "Uncrowded reef breaks at dawn with local surfers." },
      { title: "Village Calm", description: "Quiet pathways and traditional lanes blending into green fields." },
      { title: "Private Pools", description: "Secluded sanctuary spaces designed for absolute quietude." }
    ]
  },
  {
    id: "canggu",
    location: "Canggu",
    category: "Beach Lifestyle",
    tag: "Beach Lifestyle",
    moods: ["Surf", "Cafe", "Sunset", "Pool Villas"],
    description: "Modern villas near surf spots, cafes, and the everyday energy of Canggu.",
    highlights: ["Surf Spots", "Cafe Days", "Private Pools", "Sunset Scenes"],
    bestFor: ["Friends", "Couples", "First Bali Trips"],
    facts: [
      { label: "Mood", value: "Creative coastal energy" },
      { label: "Pace", value: "Social and lively" },
      { label: "Stay style", value: "Modern villas" },
    ],
    villaCount: "4 villas",
    price: "From Rp 1.030.000 / night",
    cta: "Explore Villas in Canggu",
    href: "/villas?location=Canggu",
    image: "/homepage_villa/curated-8.webp",
    imageAlt: "SummerHouse villa collection in Canggu",
    galleryImages: [
      "/homepage_villa/curated-8.webp",
      "/homepage_villa/VillaZen.webp",
      "/homepage_villa/curated-3-corner.webp",
      "/homepage_villa/curated-5-lounge.webp",
      "/homepage_villa/curated-2-detail.webp",
    ],
    lifestylePillars: [
      { title: "Creative Hub", description: "A lively intersection of creators, surfers, and nomads." },
      { title: "Sunset Scene", description: "Relaxed bonfires and golden hours on natural black sand." },
      { title: "Cafe Hopping", description: "An endless playground of design-focused, organic eateries." }
    ]
  },
  {
    id: "canggu-padonan",
    location: "Canggu - Padonan",
    category: "Calm Canggu",
    tag: "Calm Canggu",
    moods: ["Local", "Quiet", "Modern", "Practical"],
    description: "Design-led homes in a calmer Canggu neighborhood with easy access to the coast.",
    highlights: ["Quiet Lanes", "Modern Lofts", "Local Rhythm", "Canggu Access"],
    bestFor: ["Remote Work", "Couples", "Slow Trips"],
    facts: [
      { label: "Mood", value: "Residential calm" },
      { label: "Pace", value: "Balanced and practical" },
      { label: "Stay style", value: "Modern homes" },
    ],
    villaCount: "4 villas",
    price: "From Rp 900.000 / night",
    cta: "Explore Villas in Canggu - Padonan",
    href: "/villas?location=Canggu%20-%20Padonan",
    image: "/homepage_villa/curated-4-view.webp",
    imageAlt: "SummerHouse villa collection in Canggu Padonan",
    galleryImages: [
      "/homepage_villa/curated-4-view.webp",
      "/homepage_villa/curated-3-corner.webp",
      "/homepage_villa/curated-1-main.webp",
      "/homepage_villa/curated-6-exterior.webp",
      "/homepage_villa/curated-7.webp",
    ],
    lifestylePillars: [
      { title: "Residential Peace", description: "Tranquil neighborhoods nestled away from the main strip." },
      { title: "Modern Lofts", description: "Architectural spaces with concrete lines and open layouts." },
      { title: "Coast Access", description: "Spacious country roads winding down to the Canggu shoreline." }
    ]
  },
  {
    id: "umalas",
    location: "Umalas",
    category: "Leafy Privacy",
    tag: "Leafy Privacy",
    moods: ["Leafy", "Private", "Central", "Relaxed"],
    description: "Leafy villas with quiet privacy, central access, and a softer rhythm for private downtime.",
    highlights: ["Leafy Streets", "Private Pools", "Central Access", "Quiet Dining"],
    bestFor: ["Families", "Couples", "Long Stays"],
    facts: [
      { label: "Mood", value: "Soft privacy" },
      { label: "Pace", value: "Calm and central" },
      { label: "Stay style", value: "Private villas" },
    ],
    villaCount: "4 villas",
    price: "From Rp 1.120.000 / night",
    cta: "Explore Villas in Umalas",
    href: "/villas?location=Umalas",
    image: "/homepage_villa/villaarta.webp",
    imageAlt: "SummerHouse villa collection in Umalas",
    galleryImages: [
      "/homepage_villa/villaarta.webp",
      "/homepage_villa/officiana17.webp",
      "/homepage_villa/88east.webp",
      "/homepage_villa/curated-2-detail.webp",
      "/homepage_villa/curated-3-corner.webp",
    ],
    lifestylePillars: [
      { title: "Leafy Streets", description: "Scenic bamboo-lined pathways with a residential feel." },
      { title: "Softer Rhythm", description: "A quiet, green enclave nestled between Seminyak and Canggu." },
      { title: "Cozy Bakeries", description: "Small french patisseries and cafes with zero rush." }
    ]
  },
  {
    id: "ubud",
    location: "Ubud",
    category: "Jungle Retreats",
    tag: "Jungle Retreats",
    moods: ["Jungle", "Wellness", "River", "Culture"],
    description: "Peaceful villas surrounded by rice fields, rivers, and tropical jungle.",
    highlights: ["River Views", "Jungle Calm", "Wellness Rituals", "Cultural Days"],
    bestFor: ["Couples", "Wellness", "Nature Lovers"],
    facts: [
      { label: "Mood", value: "Restorative nature" },
      { label: "Pace", value: "Slow and quiet" },
      { label: "Stay style", value: "Jungle villas" },
    ],
    villaCount: "2 villas",
    price: "From Rp 1.240.000 / night",
    cta: "Explore Villas in Ubud",
    href: "/villas?location=Ubud",
    image: "/homepage_villa/VillaZen.webp",
    imageAlt: "SummerHouse villa collection in Ubud",
    galleryImages: [
      "/homepage_villa/VillaZen.webp",
      "/homepage_villa/curated-4-view.webp",
      "/homepage_villa/curated-6-exterior.webp",
      "/homepage_villa/curated-8.webp",
      "/homepage_villa/rumahmimosa.webp",
    ],
    lifestylePillars: [
      { title: "Jungle Canyons", description: "Deep ravines, wild palms, and soundscapes of flowing rivers." },
      { title: "Wellness Shalas", description: "World-renowned sound healing, yoga, and holistic therapy." },
      { title: "Heritage Craft", description: "Ancient temples, terraced rice paddies, and stone-carving villages." }
    ]
  }
];
